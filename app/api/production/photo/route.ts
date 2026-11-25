import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

    const formData = await req.formData();

    const file = formData.get("photo") as File | null;

    const productionStepId = formData.get(
      "productionStepId"
    ) as string | null;

    if (!file || !productionStepId) {
      return NextResponse.json(
        {
          success: false,
          message: "Eksik bilgi.",
        },
        {
          status: 400,
        }
      );
    }

    const step =
      await prisma.productionStep.findUnique({
        where: {
          id: productionStepId,
        },
      });

    if (!step) {
      return NextResponse.json(
        {
          success: false,
          message: "Üretim bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop();

    const fileName =
      randomUUID() + "." + ext;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "production"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDir,
      fileName
    );

    await fs.writeFile(
      filePath,
      buffer
    );
        const dbPhoto = await prisma.jobPhoto.create({
      data: {
        jobId: step.jobId,

        productionStepId: step.id,

        employeeId: user.id,

        originalName: file.name,

        fileName,

        filePath: `/uploads/production/${fileName}`,

        fileType: file.type,

        fileSize: file.size,
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

        action: "Fotoğraf Yüklendi",

        description: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      photo: dbPhoto,
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