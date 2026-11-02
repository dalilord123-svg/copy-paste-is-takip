import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre en az 6 karakter olmalıdır.",
        },
        {
          status: 400,
        }
      );
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.employee.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla değiştirildi.",
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