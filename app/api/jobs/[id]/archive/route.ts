
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        jobNo: true,
        title: true,
        isArchived: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "İş bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (job.isArchived) {
      return NextResponse.json({
        success: true,
        message: "Bu iş zaten arşivde.",
        job,
      });
    }

    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        isArchived: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "İş başarıyla arşivlendi.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("ARCHIVE JOB ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "İş arşivlenemedi.",
      },
      { status: 500 }
    );
  }
}
