import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: {
          id,
        },
      });

      if (!job) {
        throw new Error("JOB_NOT_FOUND");
      }

      await tx.job.update({
        where: {
          id,
        },
        data: {
          isArchived: true,
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId: id,
          action: "ARCHIVE",
          description: "İş arşive taşındı.",
        },
      });

      const archivedJob = await tx.job.findUnique({
        where: {
          id,
        },
        include: {
          customer: true,

          productionSteps: {
            include: {
              station: true,
              employee: true,
            },
            orderBy: {
              stepOrder: "asc",
            },
          },

          files: {
            orderBy: {
              uploadedAt: "desc",
            },
          },

          notes: {
            include: {
              employee: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },

          photos: {
            include: {
              employee: true,
            },
            orderBy: {
              uploadedAt: "desc",
            },
          },

          history: {
            include: {
              employee: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!archivedJob) {
        throw new Error("ARCHIVE_FAILED");
      }

      return archivedJob;
    });

    return NextResponse.json(
      {
        success: true,
        message: "İş başarıyla arşivlendi.",
        data: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("ARCHIVE JOB ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "JOB_NOT_FOUND") {
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

      if (error.message === "ARCHIVE_FAILED") {
        return NextResponse.json(
          {
            success: false,
            error: "İş arşivlenemedi.",
          },
          {
            status: 500,
          }
        );
      }

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