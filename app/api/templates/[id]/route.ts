import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Şablon detayını getir
export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const template = await prisma.template.findUnique({
      where: { id },
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

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Şablon bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("GET TEMPLATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Şablon alınamadı." },
      { status: 500 }
    );
  }
}

// Şablonu güncelle
export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Şablon adı zorunludur." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      return NextResponse.json(
        { success: false, message: "En az bir üretim adımı gereklidir." },
        { status: 400 }
      );
    }

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Şablon bulunamadı." },
        { status: 404 }
      );
    }

    const stationIds = body.steps.map(
      (step: { stationId: string }) => step.stationId
    );

    if (
      stationIds.some((stationId: string) => !stationId) ||
      new Set(stationIds).size !== stationIds.length
    ) {
      return NextResponse.json(
        { success: false, message: "Üretim adımlarını kontrol edin." },
        { status: 400 }
      );
    }

    const stations = await prisma.station.findMany({
      where: {
        id: { in: stationIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (stations.length !== stationIds.length) {
      return NextResponse.json(
        { success: false, message: "Geçersiz veya pasif istasyon seçildi." },
        { status: 400 }
      );
    }

    const updatedTemplate = await prisma.$transaction(async (tx) => {
      await tx.template.update({
        where: { id },
        data: { name },
      });

      await tx.templateStep.deleteMany({
        where: { templateId: id },
      });

      await tx.templateStep.createMany({
        data: body.steps.map(
          (step: { stationId: string }, index: number) => ({
            templateId: id,
            stationId: step.stationId,
            stepOrder: index + 1,
          })
        ),
      });

      return tx.template.findUnique({
        where: { id },
        include: {
          steps: {
            include: { station: true },
            orderBy: { stepOrder: "asc" },
          },
        },
      });
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("UPDATE TEMPLATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Şablon güncellenemedi." },
      { status: 500 }
    );
  }
}

// Şablonu pasife al
export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Şablon bulunamadı." },
        { status: 404 }
      );
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
    });
  } catch (error) {
    console.error("DELETE TEMPLATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Şablon pasife alınamadı." },
      { status: 500 }
    );
  }
}