import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  JobStatus,
  ProductionStepStatus,
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

    const step = await prisma.productionStep.findUnique({
      where: { id },
      include: {
        station: true,
        assignments: {
          select: {
            id: true,
            employeeId: true,
            status: true,
            startedAt: true,
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
          message: "Bu üretim adımı başlatılamaz.",
        },
        { status: 400 }
      );
    }

    const isManager =
      user.role === EmployeeRole.ADMIN ||
      user.role === EmployeeRole.YONETICI;

    const isLeader = step.leaderId === user.id;

    const userAssignment = step.assignments.find(
      (assignment) => assignment.employeeId === user.id
    );

    if (!isManager && !isLeader && !userAssignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu üretim adımını başlatmak için yetkiniz yok.",
        },
        { status: 403 }
      );
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      const currentStep = await tx.productionStep.findUnique({
        where: { id },
      });

      if (
        !currentStep ||
        currentStep.status === ProductionStepStatus.TAMAMLANDI ||
        currentStep.status === ProductionStepStatus.IPTAL
      ) {
        throw new Error("Bu üretim adımı başlatılamaz.");
      }

      await tx.productionStep.update({
        where: { id },
        data: {
          status: ProductionStepStatus.DEVAM_EDIYOR,
          startedAt: currentStep.startedAt ?? now,
          progress:
            currentStep.progress === 0 ? 1 : currentStep.progress,
          waitingReason: null,
          waitingNote: null,
        },
      });

      // Başlatan personelin atama kaydını güncelle.
      if (userAssignment) {
        await tx.productionAssignment.update({
          where: {
            id: userAssignment.id,
          },
          data: {
            status: ProductionStepStatus.DEVAM_EDIYOR,
            startedAt: userAssignment.startedAt ?? now,
          },
        });
      }

      await tx.job.update({
        where: {
          id: step.jobId,
        },
        data: {
          status: JobStatus.DEVAM_EDIYOR,
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: step.jobId,
          employeeId: user.id,
          action: "STEP_STARTED",
          description: `${step.station.name} üretim aşaması başlatıldı.`,
        },
      });
    });

    return NextResponse.redirect(
      new URL(`/mobile/jobs/${step.jobId}`, req.url)
    );
  } catch (error) {
    console.error("START PRODUCTION STEP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Üretim adımı başlatılamadı.",
      },
      { status: 500 }
    );
  }
}