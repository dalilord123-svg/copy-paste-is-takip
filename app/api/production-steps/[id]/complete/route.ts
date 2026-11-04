import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ProductionStepStatus,
  JobStatus,
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
        job: true,
        assignments: {
          include: {
            employee: true,
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
          message: "Bu üretim adımı tamamlanamaz.",
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
          message: "Bu üretim adımını tamamlamak için yetkiniz yok.",
        },
        { status: 403 }
      );
    }

    if (step.photoCount < step.station.requirePhotoCount) {
      return NextResponse.json(
        {
          success: false,
          message: `Bu istasyon için en az ${step.station.requirePhotoCount} fotoğraf yüklenmelidir.`,
        },
        { status: 400 }
      );
    }

    if (step.station.requireFile && step.fileCount < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu istasyon için en az bir dosya yüklenmelidir.",
        },
        { status: 400 }
      );
    }

    if (step.station.requireNote && step.noteCount < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu istasyon için en az bir not eklenmelidir.",
        },
        { status: 400 }
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
        throw new Error("Bu üretim adımı artık tamamlanamaz.");
      }

      await tx.productionStep.update({
        where: { id },
        data: {
          status: ProductionStepStatus.TAMAMLANDI,
          progress: 100,
          finishedAt: now,
        },
      });

      await tx.productionAssignment.updateMany({
        where: {
          productionStepId: id,
        },
        data: {
          status: ProductionStepStatus.TAMAMLANDI,
          finishedAt: now,
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: step.jobId,
          employeeId: user.id,
          action: "STEP_COMPLETED",
          description: `${step.station.name} üretim adımı tamamlandı.`,
        },
      });

      // Sıradaki üretim adımını bul.
      const nextStep = await tx.productionStep.findFirst({
        where: {
          jobId: step.jobId,
          stepOrder: {
            gt: step.stepOrder,
          },
          status: {
            not: ProductionStepStatus.IPTAL,
          },
        },
        orderBy: {
          stepOrder: "asc",
        },
        include: {
          assignments: true,
          station: true,
        },
      });

      if (nextStep) {
        await tx.productionStep.update({
          where: {
            id: nextStep.id,
          },
          data: {
            status: ProductionStepStatus.HAZIR,
          },
        });

        // Sonraki aşamanın ilk personelini başlat.
        const firstAssignment = nextStep.assignments[0];

        if (firstAssignment) {
          await tx.productionAssignment.update({
            where: {
              id: firstAssignment.id,
            },
            data: {
              status: ProductionStepStatus.DEVAM_EDIYOR,
              startedAt: now,
            },
          });

          await tx.productionStep.update({
            where: {
              id: nextStep.id,
            },
            data: {
              status: ProductionStepStatus.DEVAM_EDIYOR,
              startedAt: now,
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
            action: "NEXT_STEP_STARTED",
            description: `${nextStep.station.name} aşamasına geçildi.`,
          },
        });
      } else {
        const remaining = await tx.productionStep.count({
          where: {
            jobId: step.jobId,
            status: {
              notIn: [
                ProductionStepStatus.TAMAMLANDI,
                ProductionStepStatus.IPTAL,
              ],
            },
          },
        });

        if (remaining === 0) {
          await tx.job.update({
            where: {
              id: step.jobId,
            },
            data: {
              status: JobStatus.TAMAMLANDI,
            },
          });

          await tx.jobHistory.create({
            data: {
              jobId: step.jobId,
              employeeId: user.id,
              action: "JOB_COMPLETED",
              description:
                "Bütün üretim aşamaları tamamlandı. İş tamamlandı.",
            },
          });
        }
      }
    });

    return NextResponse.redirect(
      new URL(`/mobile/jobs/${step.jobId}`, req.url)
    );
  } catch (error) {
    console.error("COMPLETE PRODUCTION STEP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Üretim adımı tamamlanamadı.",
      },
      { status: 500 }
    );
  }
}