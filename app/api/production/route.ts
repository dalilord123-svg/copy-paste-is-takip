import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
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

    const production = await prisma.productionStep.findMany({
      where: {
        isSkipped: false,
        isLocked: false,
        status: {
          in: ["HAZIR", "DEVAM_EDIYOR", "BEKLIYOR"],
        },
      },

      orderBy: [
        {
          status: "asc",
        },
        {
          stepOrder: "asc",
        },
      ],

      include: {
        station: true,

        job: {
          include: {
            customer: true,
          },
        },

        assignments: {
          include: {
            employee: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      production,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Üretim listesi alınamadı.",
      },
      { status: 500 }
    );
  }
}