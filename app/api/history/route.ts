import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      jobId,
      action,
      description,
      employeeId,
    } = body;

    if (!jobId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Eksik bilgi gönderildi.",
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

    await prisma.jobHistory.create({
      data: {
        jobId,
        action,
        description,
        employeeId: employeeId ?? null,
      },
    });

    const history = await prisma.jobHistory.findMany({
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
        message: "Geçmiş kaydı oluşturuldu.",
        data: history,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("HISTORY CREATE ERROR:", error);

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