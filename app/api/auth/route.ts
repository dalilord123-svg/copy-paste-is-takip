import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

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
          error: "Kullanıcı adı veya şifre hatalı.",
        },
        { status: 401 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu kullanıcı pasif durumdadır.",
        },
        { status: 403 }
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

    await prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    const token = generateToken({
      employeeId: employee.id,
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