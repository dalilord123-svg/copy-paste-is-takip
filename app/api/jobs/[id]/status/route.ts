
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductionStepStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();

    const stepId = body.stepId as string | undefined;
    const status = body.status as ProductionStepStatus | undefined;

    if (!stepId || !status) {
      return NextResponse.json(
        { error: "stepId ve status zorunludur." },
        { status: 400 }
      );
    }

    const validStatuses = Object.values(ProductionStepStatus);

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Geçersiz üretim durumu." },
        { status: 400 }
      );
    }

    const existingStep = await prisma.productionStep.findFirst({
      where: {
        id: stepId,
        jobId,
      },
      include: {
        station: true,
        assignments: true,
      },
    });

    if (!existingStep) {
      return NextResponse.json(
        { error: "Üretim adımı bulunamadı." },
        { status: 404 }
      );
    }

    const now = new Date();

    const step = await prisma.$transaction(async (tx) => {
      const updatedStep = await tx.productionStep.update({
        where: {
          id: stepId,
        },
        data: {
          status,

          startedAt:
            status === ProductionStepStatus.DEVAM_EDIYOR
              ? existingStep.startedAt ?? now
              : undefined,

          finishedAt:
            status === ProductionStepStatus.TAMAMLANDI
              ? now
              : status !== ProductionStepStatus.TAMAMLANDI
                ? null
                : undefined,

          progress:
            status === ProductionStepStatus.TAMAMLANDI
              ? 100
              : undefined,
        },
        include: {
          station: true,
          leader: true,
          assignments: {
            include: {
              employee: true,
            },
          },
          job: true,
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: updatedStep.jobId,
          action: "STATUS_CHANGED",
          description: `${updatedStep.station.name} → ${status}`,
        },
      });

      return updatedStep;
    });

    return NextResponse.json({
      success: true,
      step,
    });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Durum güncellenemedi." },
      { status: 500 }
    );
  }
}
