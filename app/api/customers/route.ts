
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        company: true,
      },
      orderBy: {
        company: "asc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Müşteriler alınamadı.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const company =
      typeof body.company === "string" ? body.company.trim() : "";

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Firma adı zorunludur.",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        company,
        contact:
          typeof body.contact === "string"
            ? body.contact.trim() || null
            : null,
        phone:
          typeof body.phone === "string"
            ? body.phone.trim() || null
            : null,
        email:
          typeof body.email === "string"
            ? body.email.trim() || null
            : null,
        address:
          typeof body.address === "string"
            ? body.address.trim() || null
            : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Müşteri başarıyla kaydedildi.",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Müşteri kaydedilemedi.",
      },
      { status: 500 }
    );
  }
}
