import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { JobStatus } from "@/app/generated/prisma/enums";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const status = body.status as JobStatus;

    if (!status) {
      return NextResponse.json(
        {
          error: "Durum belirtilmedi.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "İş bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("STATUS UPDATE ERROR");
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Durum güncellenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}