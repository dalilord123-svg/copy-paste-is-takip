import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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

    const body = await req.json();

    const { url } = body;

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "Fotoğraf adresi boş.",
        },
        {
          status: 400,
        }
      );
    }

    const step = await prisma.productionStep.findUnique({
      where: {
        id,
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

    const photo = await prisma.jobPhoto.create({
      data: {
        productionStepId: step.id,
        jobId: step.jobId,
        uploadedById: user.id,
        url,
      },
    });

    await prisma.productionStep.update({
      where: {
        id: step.id,
      },
      data: {
        photoCount: {
          increment: 1,
        },
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,
        employeeId: user.id,
        action: "Fotoğraf yüklendi.",
      },
    });

    return NextResponse.json({
      success: true,
      photo,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Fotoğraf yüklenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const photos = await prisma.jobPhoto.findMany({
      where: {
        productionStepId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      photos,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Fotoğraflar alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}