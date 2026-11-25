import { NextRequest, NextResponse } from "next/server";
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

    const { productionStepId } = await req.json();

    if (!productionStepId) {
      return NextResponse.json(
        {
          success: false,
          message: "Production Step bulunamadı.",
        },
        { status: 400 }
      );
    }

    const step = await prisma.productionStep.update({
      where: {
        id: productionStepId,
      },
      data: {
        status: "DEVAM_EDIYOR",
        startedAt: new Date(),
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,
        employeeId: user.id,
        action: "Üretim başlatıldı",
      },
    });

    return NextResponse.json({
      success: true,
      step,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Başlatılamadı.",
      },
      {
        status: 500,
      }
    );
  }
}