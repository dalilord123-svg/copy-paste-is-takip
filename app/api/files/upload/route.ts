import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FileCategory } from "@prisma/client";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(
  request: NextRequest
) {

  try {

    const formData =
      await request.formData();

    const jobId =
      formData.get("jobId") as string;

    const files =
      formData.getAll("files") as File[];

    if (!jobId) {

      return NextResponse.json(

        {

          success: false,

          error:
            "Job ID bulunamadı.",

        },

        {

          status: 400,

        }

      );

    }

    if (files.length === 0) {

      return NextResponse.json(

        {

          success: false,

          error:
            "Dosya seçilmedi.",

        },

        {

          status: 400,

        }

      );

    }

    const job =
      await prisma.job.findUnique({

        where: {

          id: jobId,

        },

      });

    if (!job) {

      return NextResponse.json(

        {

          success: false,

          error:
            "İş bulunamadı.",

        },

        {

          status: 404,

        }

      );

    }

    const uploadDir =
      path.join(

        process.cwd(),

        "public",

        "uploads",

        jobId

      );

    await fs.mkdir(

      uploadDir,

      {

        recursive: true,

      }

    );

    const uploadedFiles = [];    for (const file of files) {

      const bytes =
        await file.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const extension =
        path.extname(file.name)
          .toLowerCase();

      const fileName =
        `${randomUUID()}${extension}`;

      const fullPath =
        path.join(
          uploadDir,
          fileName
        );

      await fs.writeFile(
        fullPath,
        buffer
      );
let category: FileCategory = FileCategory.DIGER;

      switch (extension) {

        case ".pdf":
          category =
            FileCategory.PDF;
          break;

        case ".jpg":
        case ".jpeg":
        case ".png":
        case ".gif":
        case ".webp":
        case ".bmp":
        case ".svg":
          category =
            FileCategory.GORSEL;
          break;

        case ".ai":
        case ".cdr":
        case ".eps":
        case ".psd":
          category =
            FileCategory.TASARIM;
          break;

      }

      const createdFile =
        await prisma.jobFile.create({

          data: {

            jobId,

            category,

            originalName:
              file.name,

            fileName,

            filePath:
              `/uploads/${jobId}/${fileName}`,

            fileType:
              file.type,

            fileSize:
              file.size,

          },

        });

      uploadedFiles.push(
        createdFile
      );

    }    const allFiles =
      await prisma.jobFile.findMany({

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

        message:
          `${uploadedFiles.length} dosya başarıyla yüklendi.`,

        data: allFiles,

      },

      {

        status: 201,

      }

    );

  } catch (error) {

    console.error(

      "FILE UPLOAD ERROR:",

      error

    );

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

    }    return NextResponse.json(

      {

        success: false,

        error:
          "Beklenmeyen bir hata oluştu.",

      },

      {

        status: 500,

      }

    );

  }

}