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

    const stations = await prisma.station.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        requirePhotoCount: true,
        requireFile: true,
        requireNote: true,
        estimatedMinutes: true,
      },
    });

    return NextResponse.json({
      success: true,
      stations,
    });
  } catch (error) {
    console.error("GET STATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "İstasyonlar alınamadı.",
      },
      { status: 500 }
    );
  }
}