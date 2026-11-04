
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
          message: "Kullanıcı adı ve şifre zorunludur.",
        },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: {
        username,
      },
    });

    if (!employee || !employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Kullanıcı adı veya şifre hatalı.",
        },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(
      password,
      employee.password
    );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Kullanıcı adı veya şifre hatalı.",
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
    });

    response.cookies.set({
  name: "employee_token",
  value: token,
  httpOnly: true,
  secure: false,
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
        message: "Giriş işlemi sırasında bir hata oluştu.",
      },
      { status: 500 }
    );
  }
  
}

