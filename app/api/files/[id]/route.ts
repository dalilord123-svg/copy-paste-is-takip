import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const file = await prisma.jobFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı." },
        { status: 404 }
      );
    }

    const buffer = await fs.readFile(file.filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          file.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          file.originalName
        )}"`,
      },
    });
  } catch (error) {
    console.error("GET FILE ERROR");
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("DELETE FILE ID:", id);

    const file = await prisma.jobFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json(
        {
          error: "Dosya veritabanında bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    console.log("FILE:", file);

    try {
      await fs.unlink(file.filePath);
      console.log("Diskten silindi.");
    } catch (err) {
      console.error("unlink hatası:", err);
    }

    await prisma.jobFile.delete({
      where: {
        id,
      },
    });

    console.log("Veritabanından silindi.");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE FILE ERROR");
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}