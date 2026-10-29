import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

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
        isArchived: false,
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "İş geri alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}