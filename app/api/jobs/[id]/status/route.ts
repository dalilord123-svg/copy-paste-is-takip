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
    const { id } = await params;

    const body = await request.json();

    const stepId = body.stepId as string | undefined;

    const status = body.status as ProductionStepStatus | undefined;

    if (!stepId || !status) {
      return NextResponse.json(
        {
          error: "stepId ve status zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    const step = await prisma.productionStep.update({
      where: {
        id: stepId,
      },

      data: {
        status,

        startedAt:
          status === ProductionStepStatus.DEVAM_EDIYOR
            ? new Date()
            : undefined,

        finishedAt:
          status === ProductionStepStatus.TAMAMLANDI
            ? new Date()
            : undefined,
      },

      include: {
        station: true,
        employee: true,
        job: true,
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,

        employeeId: step.employeeId,

        action: "STATUS_CHANGED",

        description: `${step.station.name} → ${status}`,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Durum güncellenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}