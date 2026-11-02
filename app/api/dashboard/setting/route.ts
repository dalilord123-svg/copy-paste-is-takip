import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get("employee_token")?.value;

  if (!token)
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );

  const payload = verifyToken(token);

  if (!payload)
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );

  let settings = await prisma.dashboardSetting.findUnique({
    where: {
      employeeId: payload.employeeId,
    },
  });

  if (!settings) {
    settings = await prisma.dashboardSetting.create({
      data: {
        employeeId: payload.employeeId,
      },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();

  const token = cookieStore.get("employee_token")?.value;

  if (!token)
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );

  const payload = verifyToken(token);

  if (!payload)
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );

  const body = await request.json();

  const updated =
    await prisma.dashboardSetting.update({
      where: {
        employeeId: payload.employeeId,
      },
      data: body,
    });

  return NextResponse.json(updated);
}