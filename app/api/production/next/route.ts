import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  ProductionStepStatus,
} from "@prisma/client";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stepId = body.stepId as string;

    if (!stepId) {
      return NextResponse.json(
        {
          error: "stepId gerekli.",
        },
        {
          status: 400,
        }
      );
    }

    const currentStep = await prisma.productionStep.findUnique({
      where: {
        id: stepId,
      },
      include: {
        station: true,
        job: true,
        employee: true,
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

    // Personel kontrolü
    if (!currentStep.employeeId) {
      return NextResponse.json(
        {
          error: "Personel atanmadan sonraki aşamaya geçilemez.",
        },
        {
          status: 400,
        }
      );
    }

    // İlerleme kontrolü
    if (currentStep.progress < 100) {
      return NextResponse.json(
        {
          error: "İlerleme %100 olmadan sonraki aşamaya geçilemez.",
        },
        {
          status: 400,
        }
      );
    }

    // Beklemede kontrolü
    if (
      currentStep.status ===
      ProductionStepStatus.BEKLEMEDE
    ) {
      return NextResponse.json(
        {
          error: "İş beklemede olduğu için ilerleyemez.",
        },
        {
          status: 400,
        }
      );
    }

    // Montaj fotoğraf kontrolü
    if (
      currentStep.station.name === "Montaj" &&
      currentStep.photoCount < 2
    ) {
      return NextResponse.json(
        {
          error:
            "Montaj tamamlanmadan önce en az 2 fotoğraf yüklenmelidir.",
        },
        {
          status: 400,
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

    const nextStep = allSteps[index + 1];

    await prisma.$transaction(async (tx) => {
      // Mevcut adımı bitir
      await tx.productionStep.update({
        where: {
          id: currentStep.id,
        },
        data: {
          status:
            ProductionStepStatus.TAMAMLANDI,
          progress: 100,
          finishedAt: new Date(),
        },
      });

      // Sonraki adımı başlat
      if (nextStep) {
        await tx.productionStep.update({
          where: {
            id: nextStep.id,
          },
          data: {
            status:
              ProductionStepStatus.DEVAM_EDIYOR,
            progress:
              nextStep.progress === 0
                ? 1
                : nextStep.progress,
            startedAt:
              nextStep.startedAt ??
              new Date(),
          },
        });
      }

      // History
      await tx.jobHistory.create({
        data: {
          jobId: currentStep.jobId,
          employeeId:
            currentStep.employeeId,
          action: "NEXT_STEP",
          description: nextStep
            ? `${currentStep.station.name} tamamlandı → ${nextStep.stepOrder}. adım başladı`
            : `${currentStep.station.name} tamamlandı. İş tamamen tamamlandı.`,
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
        error:
          "Sonraki aşamaya geçilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}