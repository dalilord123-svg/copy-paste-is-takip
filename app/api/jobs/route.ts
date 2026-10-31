import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobPriority } from "@prisma/client";

function generateJobNo() {
  const now = new Date();

  const y = now.getFullYear();

  const m = String(now.getMonth() + 1).padStart(2, "0");

  const d = String(now.getDate()).padStart(2, "0");

  const h = String(now.getHours()).padStart(2, "0");

  const min = String(now.getMinutes()).padStart(2, "0");

  return `JOB-${y}${m}${d}-${h}${min}`;
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        isArchived: false,
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
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "İşler getirilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const job = await prisma.job.create({
      data: {
        jobNo: generateJobNo(),

        title: body.title,

        description: body.description ?? null,

        width: body.width ? Number(body.width) : null,

        height: body.height ? Number(body.height) : null,

        quantity: body.quantity ? Number(body.quantity) : null,

        material: body.material ?? null,

        machine: body.machine ?? null,

        deliveryDate: body.deliveryDate
          ? new Date(body.deliveryDate)
          : null,

        priority:
          (body.priority as JobPriority) ??
          JobPriority.NORMAL,

        customer: {
          connect: {
            id: body.customerId,
          },
        },
      },

      include: {
        customer: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "İş oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}