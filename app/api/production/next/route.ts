import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  JobStatus,
  ProductionStepStatus,
  EmployeeRole,
} from "@prisma/client";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const stepId =
      typeof body.stepId === "string" ? body.stepId : "";

    if (!stepId) {
      return NextResponse.json(
        { success: false, error: "stepId gerekli." },
        { status: 400 }
      );
    }

    const currentStep = await prisma.productionStep.findUnique({
      where: { id: stepId },
      include: {
        station: true,
        assignments: {
          select: {
            employeeId: true,
          },
        },
      },
    });

    if (!currentStep) {
      return NextResponse.json(
        { success: false, error: "Üretim adımı bulunamadı." },
        { status: 404 }
      );
    }

    const isManager =
      user.role === EmployeeRole.ADMIN ||
      user.role === EmployeeRole.YONETICI;

    const isLeader = currentStep.leaderId === user.id;

    const isAssigned = currentStep.assignments.some(
      (assignment) => assignment.employeeId === user.id
    );

    if (!isManager && !isLeader && !isAssigned) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu üretim aşamasını ilerletmek için yetkiniz yok.",
        },
        { status: 403 }
      );
    }

    if (
      currentStep.status !== ProductionStepStatus.DEVAM_EDIYOR &&
      currentStep.status !== ProductionStepStatus.HAZIR
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu aşamanın mevcut durumu tamamlamaya uygun değil.",
        },
        { status: 400 }
      );
    }

    if (currentStep.assignments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Personel atanmadan sonraki aşamaya geçilemez.",
        },
        { status: 400 }
      );
    }

    if (currentStep.progress < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "İlerleme %100 olmadan sonraki aşamaya geçilemez.",
        },
        { status: 400 }
      );
    }

    if (
      currentStep.photoCount < currentStep.station.requirePhotoCount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Bu aşama için en az ${currentStep.station.requirePhotoCount} fotoğraf yüklenmelidir.`,
        },
        { status: 400 }
      );
    }

    if (currentStep.station.requireFile && currentStep.fileCount < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu aşama için en az bir dosya yüklenmelidir.",
        },
        { status: 400 }
      );
    }

    if (currentStep.station.requireNote && currentStep.noteCount < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu aşama için en az bir not eklenmelidir.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const latestStep = await tx.productionStep.findUnique({
        where: { id: stepId },
        include: {
          station: true,
          assignments: true,
        },
      });

      if (!latestStep) {
        throw new Error("Üretim adımı bulunamadı.");
      }

      if (
        latestStep.status !== ProductionStepStatus.DEVAM_EDIYOR &&
        latestStep.status !== ProductionStepStatus.HAZIR
      ) {
        throw new Error("Üretim adımının durumu tamamlamaya uygun değil.");
      }

      if (latestStep.progress < 100) {
        throw new Error("Üretim ilerlemesi henüz %100 değil.");
      }

      const nextStep = await tx.productionStep.findFirst({
        where: {
          jobId: latestStep.jobId,
          stepOrder: {
            gt: latestStep.stepOrder,
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
        if (
          nextStep.status === ProductionStepStatus.TAMAMLANDI ||
          nextStep.status === ProductionStepStatus.BEKLEMEDE ||
          nextStep.assignments.length === 0
        ) {
          throw new Error(
            "Sonraki aşama başlatılamıyor. Personel atamasını ve aşama durumunu kontrol edin."
          );
        }
      }

      await tx.productionStep.update({
        where: { id: stepId },
        data: {
          status: ProductionStepStatus.TAMAMLANDI,
          progress: 100,
          finishedAt: now,
        },
      });

      await tx.productionAssignment.updateMany({
        where: {
          productionStepId: stepId,
        },
        data: {
          status: ProductionStepStatus.TAMAMLANDI,
          finishedAt: now,
        },
      });

      if (nextStep) {
        await tx.productionStep.update({
          where: { id: nextStep.id },
          data: {
            status: ProductionStepStatus.DEVAM_EDIYOR,
            progress: nextStep.progress === 0 ? 1 : nextStep.progress,
            startedAt: nextStep.startedAt ?? now,
            waitingReason: null,
            waitingNote: null,
          },
        });

        await tx.productionAssignment.updateMany({
          where: {
            productionStepId: nextStep.id,
          },
          data: {
            status: ProductionStepStatus.DEVAM_EDIYOR,
            startedAt: now,
            finishedAt: null,
          },
        });

        await tx.job.update({
          where: { id: latestStep.jobId },
          data: {
            status: JobStatus.DEVAM_EDIYOR,
          },
        });
      } else {
        await tx.job.update({
          where: { id: latestStep.jobId },
          data: {
            status: JobStatus.TAMAMLANDI,
          },
        });
      }

      await tx.jobHistory.create({
        data: {
          jobId: latestStep.jobId,
          employeeId: user.id,
          action: "NEXT_STEP",
          description: nextStep
            ? `${latestStep.station.name} tamamlandı. ${nextStep.station.name} aşaması başlatıldı.`
            : `${latestStep.station.name} tamamlandı. İş tamamen tamamlandı.`,
        },
      });

      if (!nextStep) {
        await tx.jobHistory.create({
          data: {
            jobId: latestStep.jobId,
            employeeId: user.id,
            action: "JOB_COMPLETED",
            description: "Bütün üretim aşamaları tamamlandı. İş tamamlandı.",
          },
        });
      }

      return {
        currentStepId: stepId,
        nextStepId: nextStep?.id ?? null,
        jobCompleted: !nextStep,
      };
    });

    return NextResponse.json({
      success: true,
      message: result.jobCompleted
        ? "İş başarıyla tamamlandı."
        : "Sonraki üretim aşaması başlatıldı.",
      ...result,
    });
  } catch (error) {
    console.error("NEXT PRODUCTION STEP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Sonraki aşamaya geçilemedi.",
      },
      { status: 500 }
    );
  }
}