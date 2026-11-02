import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı ve şifre zorunludur.",
        },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: {
        username,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı bulunamadı.",
        },
        { status: 401 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu kullanıcı pasif durumda.",
        },
        { status: 403 }
      );
    }

    const validPassword = await comparePassword(
      password,
      employee.password
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre hatalı.",
        },
        { status: 401 }
      );
    }

    const token = createToken({
      id: employee.id,
      username: employee.username,
      role: employee.role,
    });

    const response = NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        username: employee.username,
        role: employee.role,
      },
    });

    response.cookies.set({
      name: "employee_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}