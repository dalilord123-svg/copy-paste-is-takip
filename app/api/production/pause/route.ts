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
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const productionStepId = body.productionStepId as string;

    const waitingReason = body.waitingReason as
      | "MALZEME"
      | "MUSTERI_ONAYI"
      | "TASARIM"
      | "MAKINE_ARIZASI"
      | "PERSONEL"
      | "DIGER";

    const waitingNote = body.waitingNote as string;

    if (!productionStepId) {
      return NextResponse.json(
        {
          success: false,
          message: "Production Step bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    const step = await prisma.productionStep.findUnique({
      where: {
        id: productionStepId,
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

    const updatedStep =
      await prisma.productionStep.update({
        where: {
          id: productionStepId,
        },
        data: {
          status: "BEKLEMEDE",
          waitingReason:
            waitingReason ?? "DIGER",
          waitingNote:
            waitingNote ?? "",
        },
      });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,

        employeeId: user.id,

        action: "Üretim Beklemeye Alındı",

        description:
          waitingNote ||
          waitingReason ||
          "Sebep belirtilmedi.",
      },
    });

    return NextResponse.json({
      success: true,
      step: updatedStep,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Üretim beklemeye alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}