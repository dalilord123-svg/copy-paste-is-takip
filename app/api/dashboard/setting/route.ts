import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("employee_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Oturum geçersiz." },
        { status: 401 }
      );
    }

    let settings = await prisma.dashboardSetting.findUnique({
      where: {
        employeeId: payload.id,
      },
    });

    if (!settings) {
      settings = await prisma.dashboardSetting.create({
        data: {
          employeeId: payload.id,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("DASHBOARD SETTINGS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ayarlar alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("employee_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Oturum geçersiz." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "jobs",
      "production",
      "employees",
      "customers",
      "deliveries",
      "reports",
      "photos",
      "files",
      "notes",
      "calendar",
    ] as const;

    const data: Partial<Record<(typeof allowedFields)[number], boolean>> = {};

    for (const field of allowedFields) {
      if (typeof body[field] === "boolean") {
        data[field] = body[field];
      }
    }

    const updated = await prisma.dashboardSetting.upsert({
      where: {
        employeeId: payload.id,
      },
      update: data,
      create: {
        employeeId: payload.id,
        ...data,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("DASHBOARD SETTINGS PUT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ayarlar kaydedilemedi." },
      { status: 500 }
    );
  }
}