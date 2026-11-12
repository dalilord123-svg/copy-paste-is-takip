import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  console.log("ROUTE VERSION: YENI");
  try {
    const body = await req.json();

    const {
      customerId,
      title,
      description,
      priority,
      deliveryDate,
      templateId,
      
      steps,
    } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Müşteri seçiniz." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "İş adı gerekli." },
        { status: 400 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Şablon seçiniz." },
        { status: 400 }
      );
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: "Üretim akışı boş." },
        { status: 400 }
      );
    }

    //-------------------------------------------------------

    const totalJobs = await prisma.job.count();

    const jobNo =
      `CP-${new Date().getFullYear()}-${String(totalJobs + 1).padStart(5, "0")}`;

    //-------------------------------------------------------

    const job = await prisma.job.create({
      data: {
        jobNo,
        title,
        description,
        customerId,
        templateId,
        priority,
        deliveryDate: deliveryDate
          ? new Date(deliveryDate)
          : null,
      },
    });

    //-------------------------------------------------------

    for (const step of steps) {
      if (!step.enabled) continue;

      const productionStep =
        await prisma.productionStep.create({
          data: {
            jobId: job.id,

            stationId: step.stationId,

            

            stepOrder: step.stepOrder,

            estimatedMinutes:
              step.estimatedMinutes,

            requirePhotoCount:
              step.requirePhotoCount,

            requireFile:
              step.requireFile,

            requireNote:
              step.requireNote,

            status: "BEKLIYOR",
          },
        });

      if (
        step.employeeIds &&
        step.employeeIds.length > 0
      ) {
        for (const employeeId of step.employeeIds) {
          await prisma.productionAssignment.create({
            data: {
              productionStepId:
                productionStep.id,

              employeeId,

              status: "BEKLIYOR",
            },
          });
        }
      }
    }

    //-------------------------------------------------------

    await prisma.jobHistory.create({
      data: {
        jobId: job.id,
        action: "İş oluşturuldu.",
      },
    });

    //-------------------------------------------------------

    return NextResponse.json(job);
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