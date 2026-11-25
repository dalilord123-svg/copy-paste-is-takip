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
        { status: 401 }
      );
    }

    const { id } = await params;

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
        { status: 404 }
      );
    }

    if (step.photoCount < step.requirePhotoCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Zorunlu fotoğraflar eksik.",
        },
        { status: 400 }
      );
    }

    if (step.requireFile && step.fileCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Dosya yüklenmesi gerekiyor.",
        },
        { status: 400 }
      );
    }

    if (step.requireNote && step.noteCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Not girilmesi gerekiyor.",
        },
        { status: 400 }
      );
    }

    const completed = await prisma.productionStep.update({
      where: {
        id,
      },
      data: {
        status: "TAMAMLANDI",
        progress: 100,
        finishedAt: new Date(),
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: completed.jobId,
        employeeId: user.id,
        action: "Üretim adımı tamamlandı.",
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Tamamlanamadı.",
      },
      {
        status: 500,
      }
    );
  }
}