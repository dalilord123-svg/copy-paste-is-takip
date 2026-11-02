import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs/promises";
import path from "path";

import { v4 as uuid } from "uuid";

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    const jobId = formData.get("jobId")?.toString();

    const employeeId =
      formData.get("employeeId")?.toString() || null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "Fotoğraf bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Job ID gerekli.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Desteklenmeyen dosya tipi.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "10 MB sınırı aşıldı.",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);

    const fileName = uuid() + ext;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "jobs"
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

    const db = await prisma.jobPhoto.create({
      data: {
        jobId,
        employeeId,

        originalName: file.name,

        fileName,

        filePath: "/uploads/jobs/" + fileName,

        fileType: file.type,

        fileSize: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      photo: db,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Upload başarısız.",
      },
      {
        status: 500,
      }
    );
  }
}