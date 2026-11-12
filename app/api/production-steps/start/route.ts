
import { NextRequest, NextResponse } from "next/server";
import {
  JobStatus,
  ProductionStepStatus,
  EmployeeRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
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

    // ID bilgisini önce URL'den, ardından istek gövdesinden al.
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const id =
      url.searchParams.get("id") ||
      url.searchParams.get("stepId") ||
      (typeof body.id === "string" ? body.id : null) ||
      (typeof body.stepId === "string" ? body.stepId : null) ||
      (typeof body.productionStepId === "string"
        ? body.productionStepId
        : null);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Üretim adımı ID bilgisi gönderilmedi.",
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
          progress: currentStep.progress === 0 ? 1 : currentStep.progress,
          waitingReason: null,
          waitingNote: null,
        },
      });

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

    return NextResponse.json({
      success: true,
      message: "Üretim aşaması başlatıldı.",
      jobId: step.jobId,
      productionStepId: id,
    });
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
