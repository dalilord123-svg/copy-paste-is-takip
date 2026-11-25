import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Oturum açmanız gerekiyor.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    const step = await prisma.productionStep.findUnique({
      where: {
        id,
      },

      include: {
        station: true,

        job: {
          include: {
            customer: true,

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

            history: {
              include: {
                employee: true,
              },

              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },

        assignments: {
          include: {
            employee: true,
          },
        },

        photos: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    });

    if (!step) {
      return NextResponse.json(
        {
          success: false,
          message: "Üretim adımı bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      step,
    });
  } catch (error) {
    console.error("GET PRODUCTION DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Üretim bilgisi alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}