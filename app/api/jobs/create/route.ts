import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const job = await createJob(body);

    return NextResponse.json(
      {
        success: true,
        job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "İş oluşturulamadı.",
      },
      { status: 500 }
    );
  }
}