import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    const step =
      await prisma.productionStep.findUnique({
        where: {
          id,
        },
        include: {
          job: {
            include: {
              productionSteps: {
                orderBy: {
                  stepOrder: "asc",
                },
              },
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
        {
          status: 404,
        }
      );
    }

    if (
      step.photoCount < step.requirePhotoCount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Bu istasyon için en az ${step.requirePhotoCount} fotoğraf yüklenmelidir.`,
        },
        {
          status: 400,
        }
      );
    }

    if (
      step.requireFile &&
      step.fileCount === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bu istasyon için dosya yüklenmesi zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      step.requireNote &&
      step.noteCount === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bu istasyon için not girilmesi zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.productionStep.update({
      where: {
        id,
      },
      data: {
        status: "TAMAMLANDI",
        progress: 100,
        finishedAt: new Date(),
      },
    });

    await prisma.productionAssignment.updateMany({
      where: {
        productionStepId: id,
      },
      data: {
        status: "TAMAMLANDI",
        finishedAt: new Date(),
      },
    });

    const currentIndex =
      step.job.productionSteps.findIndex(
        (s) => s.id === step.id
      );

    const nextStep =
      step.job.productionSteps[currentIndex + 1];

    if (nextStep) {
      await prisma.productionStep.update({
        where: {
          id: nextStep.id,
        },
        data: {
          status: "HAZIR",
        },
      });
    }

    const allFinished =
      await prisma.productionStep.count({
        where: {
          jobId: step.jobId,
          status: {
            not: "TAMAMLANDI",
          },
        },
      });

    if (allFinished === 0) {
      await prisma.job.update({
        where: {
          id: step.jobId,
        },
        data: {
          status: "TAMAMLANDI",
          progress: 100,
        },
      });
    } else {
      const total =
        step.job.productionSteps.length;

      const finished =
        await prisma.productionStep.count({
          where: {
            jobId: step.jobId,
            status: "TAMAMLANDI",
          },
        });

      await prisma.job.update({
        where: {
          id: step.jobId,
        },
        data: {
          progress: Math.round(
            (finished / total) * 100
          ),
          status: "DEVAM_EDIYOR",
        },
      });
    }

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,
        employeeId: user.id,
        action: "Üretim Tamamlandı",
        description: `${step.stationId} istasyonu tamamlandı.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Üretim adımı tamamlandı.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Üretim tamamlanamadı.",
      },
      {
        status: 500,
      }
    );
  }
}