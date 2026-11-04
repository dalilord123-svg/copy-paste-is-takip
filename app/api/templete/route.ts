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

    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
      },
      include: {
        steps: {
          where: {
            station: {
              isActive: true,
            },
          },
          include: {
            station: true,
          },
          orderBy: {
            stepOrder: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET TEMPLATES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Şablonlar alınamadı.",
      },
      { status: 500 }
    );
  }
}