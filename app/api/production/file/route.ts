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

    const file = formData.get("file") as File | null;

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
          message: "Üretim adımı bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const ext =
      file.name.split(".").pop() ?? "";

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "production",
      "files"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const savePath = path.join(
      uploadDir,
      fileName
    );

    await fs.writeFile(
      savePath,
      buffer
    );

    const dbFile =
      await prisma.jobFile.create({
        data: {
          jobId: step.jobId,

          category: "DIGER",

          originalName: file.name,

          fileName,

          filePath:
            `/uploads/production/files/${fileName}`,

          fileType: file.type,

          fileSize: file.size,
        },
      });

    await prisma.productionStep.update({
      where: {
        id: step.id,
      },
      data: {
        fileCount: {
          increment: 1,
        },
      },
    });

    await prisma.jobHistory.create({
      data: {
        jobId: step.jobId,

        employeeId: user.id,

        action: "Dosya Yüklendi",

        description: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      file: dbFile,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Dosya yüklenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}