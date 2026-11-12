import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const template = await prisma.template.create({
      data: {
        name: body.name,
        description: body.description,

        steps: {
          create: body.steps
            .filter((step: any) => step.enabled)
            .sort(
              (a: any, b: any) =>
                a.stepOrder - b.stepOrder
            )
            .map((step: any) => ({
              stationId: step.stationId,
              stepOrder: step.stepOrder,
              estimatedMinutes:
                step.estimatedMinutes,
              requirePhotoCount:
                step.requirePhotoCount,
              requireFile:
                step.requireFile,
              requireNote:
                step.requireNote,
            })),
        },
      },

      include: {
        steps: {
          include: {
            station: true,
          },
          orderBy: {
            stepOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(template);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Şablon oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  const templates = await prisma.template.findMany({
    include: {
      steps: {
        include: {
          station: true,
        },
        orderBy: {
          stepOrder: "asc",
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(templates);
}