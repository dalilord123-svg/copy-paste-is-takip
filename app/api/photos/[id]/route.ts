import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const photo = await prisma.jobPhoto.findUnique({
      where: {
        id,
      },
    });

    if (!photo) {
      return NextResponse.json(
        {
          success: false,
          error: "Fotoğraf bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const physicalPath = path.join(
      process.cwd(),
      "public",
      photo.filePath
    );

    try {
      await fs.unlink(physicalPath);
    } catch {
      console.warn("Fiziksel dosya bulunamadı.");
    }

    await prisma.jobPhoto.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Fotoğraf başarıyla silindi.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("PHOTO DELETE ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Beklenmeyen bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}