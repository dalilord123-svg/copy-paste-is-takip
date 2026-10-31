import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;

    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "Dosya seçilmedi.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "İş bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      job.jobNo
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const extension = path.extname(file.name);

    const fileName = `${uuid()}${extension}`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    const bytes = await file.arrayBuffer();

    await fs.writeFile(
      filePath,
      Buffer.from(bytes)
    );

    const saved = await prisma.jobFile.create({
      data: {
        jobId: job.id,
        fileName,
        originalName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        filePath,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Dosya yüklenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}