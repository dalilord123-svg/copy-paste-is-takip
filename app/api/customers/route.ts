import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customer = await prisma.customer.create({
      data: {
        company: body.company,
        contact: body.contact,
        phone: body.phone,
        email: body.email,
        address: body.address,
      },
    });

    return NextResponse.json(customer, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Müşteri oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        company: "asc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Müşteriler alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}