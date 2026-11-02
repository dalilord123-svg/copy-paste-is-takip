import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stepId } = await req.json();

    if (!stepId) {
      return NextResponse.json(
        { error: "stepId gerekli." },
        { status: 400 }
      );
    }

    const step = await prisma.productionStep.findUnique({
      where: {
        id: stepId,
      },
      include: {
        station: true,
        job: true,
      },
    });

    if (!step) {
      return NextResponse.json(
        { error: "Üretim adımı bulunamadı." },
        { status: 404 }
      );
    }

    await prisma.productionStep.update({
      where: {
        id: stepId,
      },
      data: {
        status: "DEVAM_EDIYOR",
        startedAt: new Date(),
      },
    });

    await prisma.job.update({
      where: {
        id: step.jobId,
      },
      data: {
        status: "DEVAM_EDIYOR",
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,
        action: "STEP_STARTED",
        description: `${step.station.name} başladı`,
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Sunucu hatası",
      },
      {
        status: 500,
      }
    );
  }
}