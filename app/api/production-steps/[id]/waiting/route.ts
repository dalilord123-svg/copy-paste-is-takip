import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ProductionStepStatus,
  WaitingReason,
  EmployeeRole,
} from "@prisma/client";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Oturum açmanız gerekiyor.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const form = await req.formData();

    const reasonValue = form.get("reason");
    const noteValue = form.get("note");

    const reason =
      typeof reasonValue === "string" ? reasonValue : "";

    const note =
      typeof noteValue === "string" ? noteValue.trim() : "";

    if (!reason || !Object.values(WaitingReason).includes(reason as WaitingReason)) {
      return NextResponse.json(
        {
          success: false,
          message: "Geçerli bir bekleme nedeni seçilmelidir.",
        },
        { status: 400 }
      );
    }

    if (note.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Bekleme açıklaması en fazla 2000 karakter olabilir.",
        },
        { status: 400 }
      );
    }

    const step = await prisma.productionStep.findUnique({
      where: { id },
      include: {
        station: true,
        assignments: {
          select: {
            employeeId: true,
          },
        },
      },
    });

    if (!step) {
      return NextResponse.json(
        {
          success: false,
          message: "Üretim adımı bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (
      step.status === ProductionStepStatus.TAMAMLANDI ||
      step.status === ProductionStepStatus.IPTAL
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tamamlanmış veya iptal edilmiş aşama beklemeye alınamaz.",
        },
        { status: 400 }
      );
    }

    const isManager =
      user.role === EmployeeRole.ADMIN ||
      user.role === EmployeeRole.YONETICI;

    const isLeader = step.leaderId === user.id;

    const isAssigned = step.assignments.some(
      (assignment) => assignment.employeeId === user.id
    );

    if (!isManager && !isLeader && !isAssigned) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu üretim adımını beklemeye almak için yetkiniz yok.",
        },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const currentStep = await tx.productionStep.findUnique({
        where: { id },
      });

      if (
        !currentStep ||
        currentStep.status === ProductionStepStatus.TAMAMLANDI ||
        currentStep.status === ProductionStepStatus.IPTAL
      ) {
        throw new Error("Bu üretim adımı beklemeye alınamaz.");
      }

      await tx.productionStep.update({
        where: { id },
        data: {
          status: ProductionStepStatus.BEKLEMEDE,
          waitingReason: reason as WaitingReason,
          waitingNote: note || null,
        },
      });

      await tx.productionAssignment.updateMany({
        where: {
          productionStepId: id,
          status: {
            notIn: [
              ProductionStepStatus.TAMAMLANDI,
              ProductionStepStatus.IPTAL,
            ],
          },
        },
        data: {
          status: ProductionStepStatus.BEKLEMEDE,
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: currentStep.jobId,
          employeeId: user.id,
          action: "STEP_WAITING",
          description:
            `${step.station.name} beklemeye alındı. ` +
            `Neden: ${reason}. ${note}`,
        },
      });
    });

    return NextResponse.redirect(
      new URL(`/mobile/jobs/${step.jobId}`, req.url)
    );
  } catch (error) {
    console.error("WAITING STEP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Üretim adımı beklemeye alınamadı.",
      },
      { status: 500 }
    );
  }
}