import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ======================
// GET
// ======================

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        files: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "İş bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

// ======================
// PUT
// ======================

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const job = await prisma.job.update({
      where: {
        id,
      },

      data: {
        customerId: body.customerId,

        title: body.title,

        description: body.description || null,

        width: body.width
          ? Number(body.width)
          : null,

        height: body.height
          ? Number(body.height)
          : null,

        quantity: body.quantity
          ? Number(body.quantity)
          : null,

        material: body.material || null,

        machine: body.machine || null,

        deliveryDate: body.deliveryDate
          ? new Date(body.deliveryDate)
          : null,

        status: body.status,
      },

      include: {
        customer: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "İş güncellenemedi." },
      { status: 500 }
    );
  }
}

// ======================
// DELETE
// ======================

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await prisma.job.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "İş silinemedi." },
      { status: 500 }
    );
  }
}