import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductionStepStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stepId = body.stepId as string;

    if (!stepId) {
      return NextResponse.json(
        {
          error: "stepId gerekli",
        },
        {
          status: 400,
        }
      );
    }
        const currentStep =
      await prisma.productionStep.findUnique({
        where: {
          id: stepId,
        },
        include: {
          station: true,
          job: true,
        },
      });

    if (!currentStep) {
      return NextResponse.json(
        {
          error: "Üretim adımı bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const allSteps =
      await prisma.productionStep.findMany({
        where: {
          jobId: currentStep.jobId,
        },
        orderBy: {
          stepOrder: "asc",
        },
      });

    const index = allSteps.findIndex(
      (x) => x.id === currentStep.id
    );

    const nextStep =
      allSteps[index + 1];
          await prisma.$transaction(async (tx) => {
      await tx.productionStep.update({
        where: {
          id: currentStep.id,
        },

        data: {
          status: ProductionStepStatus.TAMAMLANDI,
          progress: 100,
          finishedAt: new Date(),
        },
      });

      if (nextStep) {
        await tx.productionStep.update({
          where: {
            id: nextStep.id,
          },

          data: {
            status: ProductionStepStatus.DEVAM_EDIYOR,
            progress: nextStep.progress === 0 ? 1 : nextStep.progress,
            startedAt: nextStep.startedAt ?? new Date(),
          },
        });
      }

      await tx.jobHistory.create({
        data: {
          jobId: currentStep.jobId,

          employeeId: currentStep.employeeId,

          action: "NEXT_STEP",

          description: nextStep
            ? `${currentStep.station.name} tamamlandı → ${nextStep.stepOrder}. adım başladı`
            : `${currentStep.station.name} tamamlandı. İş tamamlandı.`,
        },
      });
    });
        return NextResponse.json({
      success: true,
      currentStepId: currentStep.id,
      nextStepId: nextStep?.id ?? null,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Sonraki aşamaya geçilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}