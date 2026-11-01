import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { jobId, note } = body;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Job ID bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    if (!note || !note.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Not boş olamaz.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "İş bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.jobNote.create({
      data: {
        jobId,
        note: note.trim(),
      },
    });

    const allNotes = await prisma.jobNote.findMany({
      where: {
        jobId,
      },
      include: {
        employee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Not başarıyla eklendi.",
        data: allNotes,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("NOTE CREATE ERROR:", error);

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