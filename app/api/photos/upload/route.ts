import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  EmployeeRole,
  ProductionStepStatus,
} from "@prisma/client";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  let savedFilePath: string | null = null;

  try {
    const employee = await getCurrentUser();

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Oturum açmanız gerekiyor.",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const jobId = formData.get("jobId");
    const productionStepId = formData.get("productionStepId");
    const file = formData.get("photo");

    if (
      typeof jobId !== "string" ||
      !jobId.trim() ||
      typeof productionStepId !== "string" ||
      !productionStepId.trim() ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Eksik veya geçersiz bilgi.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Boş dosya yüklenemez.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Sadece JPG, PNG ve WEBP fotoğrafları yüklenebilir.",
        },
        { status: 400 }
      );
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Fotoğraf boyutu en fazla 10 MB olabilir.",
        },
        { status: 400 }
      );
    }

    const productionStep = await prisma.productionStep.findUnique({
      where: {
        id: productionStepId,
      },
      include: {
        job: true,
        station: true,
        assignments: {
          select: {
            employeeId: true,
          },
        },
      },
    });

    if (!productionStep || productionStep.jobId !== jobId) {
      return NextResponse.json(
        {
          success: false,
          message: "İş veya üretim aşaması bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (productionStep.job.isArchived) {
      return NextResponse.json(
        {
          success: false,
          message: "Arşivlenmiş işe fotoğraf yüklenemez.",
        },
        { status: 400 }
      );
    }

    if (
      productionStep.status === ProductionStepStatus.TAMAMLANDI ||
      productionStep.status === ProductionStepStatus.IPTAL
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tamamlanmış veya iptal edilmiş aşamaya fotoğraf yüklenemez.",
        },
        { status: 400 }
      );
    }

    const isManager =
      employee.role === EmployeeRole.ADMIN ||
      employee.role === EmployeeRole.YONETICI;

    const isLeader = productionStep.leaderId === employee.id;

    const isAssigned = productionStep.assignments.some(
      (assignment) => assignment.employeeId === employee.id
    );

    if (!isManager && !isLeader && !isAssigned) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu aşamaya fotoğraf yükleme yetkiniz yok.",
        },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const isJpeg =
      file.type === "image/jpeg" &&
      buffer.length >= 3 &&
      buffer.subarray(0, 3).equals(
        Buffer.from([0xff, 0xd8, 0xff])
      );

    const isPng =
      file.type === "image/png" &&
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a,
        ])
      );

    const isWebp =
      file.type === "image/webp" &&
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        {
          success: false,
          message: "Yüklenen dosya geçerli bir fotoğraf değil.",
        },
        { status: 400 }
      );
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension = extensionByType[file.type];
    const fileName = `${randomUUID()}${extension}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    savedFilePath = path.join(uploadDir, fileName);

    await writeFile(savedFilePath, buffer);

    await prisma.$transaction(async (tx) => {
      await tx.jobPhoto.create({
        data: {
          jobId,
          productionStepId,
          employeeId: employee.id,
          originalName: file.name,
          fileName,
          filePath: `/uploads/${fileName}`,
          fileType: file.type,
          fileSize: file.size,
        },
      });

      await tx.productionStep.update({
        where: {
          id: productionStepId,
        },
        data: {
          photoCount: {
            increment: 1,
          },
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId,
          employeeId: employee.id,
          action: "PHOTO_UPLOAD",
          description: `${productionStep.station.name} aşamasına ${file.name} fotoğrafı yüklendi.`,
        },
      });
    });

    savedFilePath = null;

    return NextResponse.redirect(
      new URL(`/mobile/jobs/${productionStepId}`, req.url)
    );
  } catch (error) {
    if (savedFilePath) {
      try {
        await unlink(savedFilePath);
      } catch {
        // Dosya silinemediğinde hata kaydı korunur.
      }
    }

    console.error("FOTOĞRAF YÜKLEME HATASI:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Fotoğraf yüklenemedi.",
      },
      { status: 500 }
    );
  }
}