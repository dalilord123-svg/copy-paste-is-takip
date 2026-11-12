import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

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
      where: { username },
    });

    if (!employee || !employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı veya şifre hatalı.",
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı veya şifre hatalı.",
        },
        { status: 401 }
      );
    }

    const token = signToken({
      id: employee.id,
      username: employee.username,
      role: employee.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Giriş başarılı.",
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
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}