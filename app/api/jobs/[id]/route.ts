
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobPriority } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const jobInclude = {
  customer: true,

  files: {
    orderBy: {
      uploadedAt: "desc" as const,
    },
  },

  photos: {
    orderBy: {
      uploadedAt: "desc" as const,
    },
  },

  notes: {
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },

  history: {
    include: {
      employee: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },

  productionSteps: {
    include: {
      station: true,
      leader: true,
      assignments: {
        include: {
          employee: true,
        },
      },
    },
    orderBy: {
      stepOrder: "asc" as const,
    },
  },
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });

    if (!job) {
      return NextResponse.json(
        { error: "İş bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("GET JOB ERROR:", error);

    return NextResponse.json(
      { error: "İş bilgileri getirilemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "İş bulunamadı." },
        { status: 404 }
      );
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "İş adı zorunludur." },
        { status: 400 }
      );
    }

    if (body.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: body.customerId },
        select: { id: true },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Müşteri bulunamadı." },
          { status: 404 }
        );
      }
    }

    const validPriorities = Object.values(JobPriority);

    const priority =
      body.priority && validPriorities.includes(body.priority)
        ? body.priority
        : JobPriority.NORMAL;

    const parseNumber = (value: unknown) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : null;
    };

    let deliveryDate: Date | null = null;

    if (body.deliveryDate) {
      deliveryDate = new Date(body.deliveryDate);

      if (Number.isNaN(deliveryDate.getTime())) {
        return NextResponse.json(
          { error: "Teslim tarihi geçersiz." },
          { status: 400 }
        );
      }
    }

    const job = await prisma.job.update({
      where: { id },

      data: {
        customerId: body.customerId,
        title: body.title.trim(),
        description: body.description ?? null,

        width: parseNumber(body.width),
        height: parseNumber(body.height),
        quantity: parseNumber(body.quantity),

        material: body.material ?? null,
        machine: body.machine ?? null,

        deliveryDate,
        priority,
      },

      include: jobInclude,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);

    return NextResponse.json(
      { error: "İş güncellenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "İş bulunamadı." },
        { status: 404 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "İş başarıyla silindi.",
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);

    return NextResponse.json(
      { error: "İş silinemedi." },
      { status: 500 }
    );
  }
}
