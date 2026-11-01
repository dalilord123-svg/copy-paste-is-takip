import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductionStepStatus } from "@prisma/client";

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Üretim adımı ID'si gönderilmedi.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const step = await tx.productionStep.findUnique({
        where: {
          id,
        },
        include: {
          station: true,
          employee: true,
          job: true,
        },
      });

      if (!step) {
        throw new Error("NOT_FOUND");
      }

      if (step.status === ProductionStepStatus.DEVAM_EDIYOR) {
        throw new Error("ALREADY_STARTED");
      }

      const updatedStep = await tx.productionStep.update({
        where: {
          id,
        },
        data: {
          status: ProductionStepStatus.DEVAM_EDIYOR,
          startedAt: step.startedAt ?? new Date(),
          progress: step.progress === 0 ? 1 : step.progress,
        },
        include: {
          station: true,
          employee: true,
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: step.jobId,
          action: "STEP_STARTED",
          description: `${step.station.name} istasyonu başlatıldı.`,
        },
      });

      return updatedStep;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Üretim adımı başarıyla başlatıldı.",
        data: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("START PRODUCTION STEP ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Üretim adımı bulunamadı.",
          },
          {
            status: 404,
          }
        );
      }

      if (error.message === "ALREADY_STARTED") {
        return NextResponse.json(
          {
            success: false,
            error: "Bu adım zaten devam ediyor.",
          },
          {
            status: 400,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Beklenmeyen bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}