import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
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
        },
        {
          status: 404,
        }
      );
    }

    try {
      await fs.unlink(
        path.join(
          process.cwd(),
          "public",
          photo.filePath
        )
      );
    } catch {}

    await prisma.jobPhoto.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}