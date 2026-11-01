import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const { id } =
      await params;

    const note =
      await prisma.jobNote.findUnique({

        where: {
          id,
        },

      });

    if (!note) {

      return NextResponse.json(

        {

          success: false,

          error:
            "Not bulunamadı.",

        },

        {

          status: 404,

        }

      );

    }    await prisma.jobNote.delete({

      where: {
        id,
      },

    });

    return NextResponse.json(

      {

        success: true,

        message:
          "Not başarıyla silindi.",

      },

      {

        status: 200,

      }

    );

  } catch (error) {

    console.error(

      "NOTE DELETE ERROR:",

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

    );  }

}