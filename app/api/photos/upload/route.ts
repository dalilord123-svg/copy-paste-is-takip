import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const jobId = formData.get("jobId") as string;
    const photos = formData.getAll("photos") as File[];

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Job ID bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    if (photos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Fotoğraf seçilmedi.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "İş bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "photos",
      jobId
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const uploadedPhotos = [];

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension = path.extname(photo.name).toLowerCase();

      const fileName = `${randomUUID()}${extension}`;

      const fullPath = path.join(uploadDir, fileName);

      await fs.writeFile(fullPath, buffer);

      const createdPhoto = await prisma.jobPhoto.create({
        data: {
          jobId,
          originalName: photo.name,
          fileName,
          filePath: `/uploads/photos/${jobId}/${fileName}`,
          fileType: photo.type,
          fileSize: photo.size,
        },
      });

      uploadedPhotos.push(createdPhoto);
    }

    const allPhotos = await prisma.jobPhoto.findMany({
      where: {
        jobId,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${uploadedPhotos.length} fotoğraf başarıyla yüklendi.`,
        data: allPhotos,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("PHOTO UPLOAD ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Beklenmeyen bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}