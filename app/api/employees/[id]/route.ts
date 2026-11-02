import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// PERSONEL GETİR
export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Personel bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası.",
      },
      {
        status: 500,
      }
    );
  }
}

// PERSONEL GÜNCELLE
export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      name,
      username,
      phone,
      email,
      role,
      isActive,
    } = body;

    const employee = await prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Personel bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const usernameExists =
      await prisma.employee.findFirst({
        where: {
          username,
          NOT: {
            id,
          },
        },
      });

    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bu kullanıcı adı kullanılmaktadır.",
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await prisma.employee.update({
        where: {
          id,
        },
        data: {
          name,
          username,
          phone,
          email,
          role,
          isActive,
        },
      });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Güncelleme başarısız.",
      },
      {
        status: 500,
      }
    );
  }
}

// PERSONEL SİL
export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const activeJobs =
      await prisma.productionStep.count({
        where: {
          employeeId: id,
          status: {
            in: [
              "BEKLIYOR",
              "DEVAM_EDIYOR",
            ],
          },
        },
      });

    if (activeJobs > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bu personelin üzerinde aktif işler bulunmaktadır.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.employee.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Silinemedi.",
      },
      {
        status: 500,
      }
    );
  }
}