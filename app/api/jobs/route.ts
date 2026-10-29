import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

function generateJobNo() {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(Math.random() * 9000) + 1000;

  return `JOB-${year}${month}${day}-${random}`;
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "İşler alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.customerId) {
      return NextResponse.json(
        {
          error: "İş adı ve müşteri zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.create({
      data: {
        jobNo: generateJobNo(),

        title: body.title,

        description: body.description || null,

        width: body.width ? Number(body.width) : null,

        height: body.height ? Number(body.height) : null,

        quantity: body.quantity ? Number(body.quantity) : null,

        material: body.material || null,

        machine: body.machine || null,

        deliveryDate: body.deliveryDate
          ? new Date(body.deliveryDate)
          : null,

        customerId: body.customerId,

        status: "BEKLIYOR",
      },

      include: {
        customer: true,
      },
    });

    return NextResponse.json(job, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "İş oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}