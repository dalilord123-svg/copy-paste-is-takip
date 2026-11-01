import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
        icon: true,
        color: true,
        requirePhotoCount: true,
        requireFile: true,
        requireNote: true,
      },
    });

    return NextResponse.json(stations);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "İstasyonlar getirilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}