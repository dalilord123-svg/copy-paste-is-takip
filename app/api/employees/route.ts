// app/api/employees/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmployeeRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Personeller alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const role =
      typeof body.role === "string"
        ? body.role
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    if (!name || !username || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ad Soyad, Kullanıcı Adı, Şifre ve Rol zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Object.values(EmployeeRole).includes(role as EmployeeRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Geçersiz personel rolü.",
        },
        {
          status: 400,
        }
      );
    }

    const usernameExists =
      await prisma.employee.findUnique({
        where: {
          username,
        },
      });

    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bu kullanıcı adı zaten kullanılmaktadır.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.create({
      data: {
        name,
        username,
        password: passwordHash,
        role: role as EmployeeRole,
        phone: phone || null,
        email: email || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Personel başarıyla oluşturuldu.",
      employee,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Personel oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}