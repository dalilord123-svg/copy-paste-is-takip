
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const employeeSelect = {
  id: true,
  name: true,
  username: true,
  phone: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// PERSONEL GETİR
export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      select: employeeSelect,
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Personel bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Personel getirme hatası:", error);

    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
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

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Personel bulunamadı." },
        { status: 404 }
      );
    }

    const data: {
      name?: string;
      username?: string;
      phone?: string | null;
      email?: string | null;
      role?: "ADMIN" | "YONETICI" | "PERSONEL";
      isActive?: boolean;
    } = {};

    if (typeof body.name === "string") {
      data.name = body.name.trim();
    }

    if (typeof body.username === "string") {
      const username = body.username.trim();

      const usernameExists = await prisma.employee.findFirst({
        where: {
          username,
          NOT: { id },
        },
      });

      if (usernameExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Bu kullanıcı adı kullanılmaktadır.",
          },
          { status: 400 }
        );
      }

      data.username = username;
    }

    if (typeof body.phone === "string" || body.phone === null) {
      data.phone = body.phone;
    }

    if (typeof body.email === "string" || body.email === null) {
      data.email = body.email;
    }

    if (
      body.role === "ADMIN" ||
      body.role === "YONETICI" ||
      body.role === "PERSONEL"
    ) {
      data.role = body.role;
    }

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    const updated = await prisma.employee.update({
      where: { id },
      data,
      select: employeeSelect,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Personel güncelleme hatası:", error);

    return NextResponse.json(
      { success: false, error: "Güncelleme başarısız." },
      { status: 500 }
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

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Personel bulunamadı." },
        { status: 404 }
      );
    }

    const activeJobs = await prisma.productionAssignment.count({
      where: {
        employeeId: id,
        productionStep: {
          status: {
            in: [
              "BEKLIYOR",
              "HAZIR",
              "DEVAM_EDIYOR",
              "BEKLEMEDE",
            ],
          },
        },
      },
    });

    if (activeJobs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu personelin üzerinde aktif işler bulunmaktadır.",
        },
        { status: 400 }
      );
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Personel silindi.",
    });
  } catch (error) {
    console.error("Personel silme hatası:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Personel silinemedi. İlişkili geçmiş kayıtları olabilir.",
      },
      { status: 500 }
    );
  }
}
