// app/api/customers/route.ts

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
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Müşteriler alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}