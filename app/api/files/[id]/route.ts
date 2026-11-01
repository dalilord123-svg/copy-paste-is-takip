import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {

  try {

    const { id } = await params;

    const file =
      await prisma.jobFile.findUnique({

        where: {
          id,
        },

      });

    if (!file) {

      return NextResponse.json(

        {

          success: false,

          error:
            "Dosya bulunamadı.",

        },

        {

          status: 404,

        }

      );

    }

    const physicalPath =
      path.join(

        process.cwd(),

        "public",

        file.filePath

      );    try {

      await fs.access(physicalPath);

      await fs.unlink(physicalPath);

    } catch (error) {

      console.warn(
        "Fiziksel dosya bulunamadı:",
        physicalPath
      );

    }

    await prisma.jobFile.delete({

      where: {

        id,

      },

    });

    return NextResponse.json(

      {

        success: true,

        message:
          "Dosya başarıyla silindi.",

      },

      {

        status: 200,

      }

    );  } catch (error) {

    console.error(
      "FILE DELETE ERROR:",
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

    }

    return NextResponse.json(

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