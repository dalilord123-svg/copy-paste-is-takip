import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStatus, ProductionStepStatus } from "@prisma/client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const currentStep = await tx.productionStep.findUnique({
        where: {
          id,
        },
        include: {
          station: true,
          job: true,
        },
      });

      if (!currentStep) {
        throw new Error("NOT_FOUND");
      }

      if (currentStep.status === ProductionStepStatus.TAMAMLANDI) {
        throw new Error("ALREADY_COMPLETED");
      }

// ===============================
// İSTASYON KURALLARI
// ===============================

// Fotoğraf zorunluluğu
if (currentStep.station.requirePhotoCount > 0) {
  const photoCount = await tx.jobPhoto.count({
    where: {
      jobId: currentStep.jobId,
    },
  });

  if (photoCount < currentStep.station.requirePhotoCount) {
    throw new Error(
      `Bu istasyonda en az ${currentStep.station.requirePhotoCount} fotoğraf yüklenmelidir.`
    );
  }
}

// Dosya zorunluluğu
if (currentStep.station.requireFile) {
  const fileCount = await tx.jobFile.count({
    where: {
      jobId: currentStep.jobId,
    },
  });

  if (fileCount === 0) {
    throw new Error(
      "Bu istasyonda en az bir dosya yüklenmelidir."
    );
  }
}

// Not zorunluluğu
if (currentStep.station.requireNote) {
  const noteCount = await tx.jobNote.count({
    where: {
      jobId: currentStep.jobId,
    },
  });

  if (noteCount === 0) {
    throw new Error(
      "Bu istasyonda en az bir not girilmelidir."
    );
  }
}

      await tx.productionStep.update({
        where: {
          id,
        },
        data: {
          status: ProductionStepStatus.TAMAMLANDI,
          progress: 100,
          finishedAt: new Date(),
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: currentStep.jobId,
          action: "STEP_COMPLETED",
          description: `${currentStep.station.name} istasyonu tamamlandı.`,
        },
      });

      const nextStep = await tx.productionStep.findFirst({
        where: {
          jobId: currentStep.jobId,
          stepOrder: {
            gt: currentStep.stepOrder,
          },
        },
        orderBy: {
          stepOrder: "asc",
        },
        include: {
          station: true,
          employee: true,
        },
      });

      if (nextStep) {
        await tx.productionStep.update({
          where: {
            id: nextStep.id,
          },
          data: {
            status: ProductionStepStatus.DEVAM_EDIYOR,
            startedAt: nextStep.startedAt ?? new Date(),
            progress: nextStep.progress === 0 ? 1 : nextStep.progress,
          },
        });

        await tx.jobHistory.create({
          data: {
            jobId: currentStep.jobId,
            action: "STEP_STARTED",
            description: `${nextStep.station.name} istasyonu otomatik başlatıldı.`,
          },
        });
      } else {
        await tx.job.update({
          where: {
            id: currentStep.jobId,
          },
          data: {
            status: JobStatus.TAMAMLANDI,
          },
        });

        await tx.jobHistory.create({
          data: {
            jobId: currentStep.jobId,
            action: "JOB_COMPLETED",
            description: "İş tamamen tamamlandı.",
          },
        });
      }

      const updatedJob = await tx.job.findUnique({
        where: {
          id: currentStep.jobId,
        },
        include: {
          customer: true,
          productionSteps: {
            include: {
              station: true,
              employee: true,
            },
            orderBy: {
              stepOrder: "asc",
            },
          },
          files: {
            orderBy: {
              uploadedAt: "desc",
            },
          },
          notes: {
            include: {
              employee: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          photos: {
            include: {
              employee: true,
            },
            orderBy: {
              uploadedAt: "desc",
            },
          },
          history: {
            include: {
              employee: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!updatedJob) {
        throw new Error("JOB_NOT_FOUND");
      }

      return updatedJob;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Üretim adımı başarıyla tamamlandı.",
        data: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("COMPLETE PRODUCTION STEP ERROR:", error);

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

      if (error.message === "ALREADY_COMPLETED") {
        return NextResponse.json(
          {
            success: false,
            error: "Bu adım zaten tamamlandı.",
          },
          {
            status: 400,
          }
        );
      }

      if (error.message === "JOB_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "İş bulunamadı.",
          },
          {
            status: 404,
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
if (
  error.message.includes("fotoğraf") ||
  error.message.includes("dosya") ||
  error.message.includes("not")
) {
  return NextResponse.json(
    {
      success: false,
      error: error.message,
    },
    {
      status: 400,
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