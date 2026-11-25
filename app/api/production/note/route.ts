console.log("NOTE API ÇALIŞTI");
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const productionStepId = body.productionStepId as string;
    const note = body.note as string;

    if (!productionStepId) {
      return NextResponse.json(
        {
          success: false,
          message: "Production Step bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    if (!note || note.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Not boş olamaz.",
        },
        {
          status: 400,
        }
      );
    }

    const step = await prisma.productionStep.findUnique({
      where: {
        id: productionStepId,
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

    const jobNote = await prisma.jobNote.create({
      data: {
        jobId: step.jobId,
        employeeId: user.id,
        note: note.trim(),
      },
    });

    await prisma.productionStep.update({
      where: {
        id: step.id,
      },
      data: {
        noteCount: {
          increment: 1,
        },
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,
        employeeId: user.id,
        action: "Not Eklendi",
        description: note.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      note: jobNote,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Not kaydedilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}