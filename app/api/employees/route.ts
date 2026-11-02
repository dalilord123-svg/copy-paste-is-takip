import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        productionSteps: {
          where: {
            status: {
              in: ["BEKLIYOR", "DEVAM_EDIYOR"],
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Personeller alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      username,
      password,
      phone,
      email,
      role,
      isActive,
    } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Ad Soyad, Kullanıcı Adı ve Şifre zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    const usernameExists = await prisma.employee.findUnique({
      where: {
        username,
      },
    });

    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu kullanıcı adı zaten kullanılıyor.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await hashPassword(password);

    const employee = await prisma.employee.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone: phone || null,
        email: email || null,
        role,
        isActive,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Personel başarıyla oluşturuldu.",
        data: employee,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Personel oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}