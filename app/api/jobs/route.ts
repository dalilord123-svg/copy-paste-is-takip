import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  JobPriority,
  ProductionStepStatus,
} from "@prisma/client";

type CreateJobRequest = {
  customerId: string;
  title: string;
  description?: string;
  width?: string;
  height?: string;
  quantity?: string;
  material?: string;
  machine?: string;
  deliveryDate?: string;
  priority?: JobPriority;
  productionSteps: {
    stationId: string;
    name: string;
  }[];
};

async function generateJobNo() {
  const year = new Date().getFullYear();

  const count = await prisma.job.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  return `JOB-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        isArchived: false,
      },

      include: {
        customer: true,

        productionSteps: {
          include: {
            station: true,
            employee: true,
          },

          orderBy: {
            stepOrder: "asc",
          },
        },

        files: true,

        notes: true,

        photos: true,
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
        error: "İşler getirilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {

    const body: CreateJobRequest =
      await request.json();

    if (!body.customerId) {
      return NextResponse.json(
        {
          error:
            "Müşteri seçiniz.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        {
          error:
            "İş adı zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.productionSteps ||
      body.productionSteps.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "En az bir üretim adımı seçiniz.",
        },
        {
          status: 400,
        }
      );
    }

    const jobNo =
      await generateJobNo();    const result = await prisma.$transaction(
      async (tx) => {

        const job = await tx.job.create({
          data: {

            jobNo,

            title: body.title.trim(),

            description:
              body.description || null,

            width: body.width
              ? Number(body.width)
              : null,

            height: body.height
              ? Number(body.height)
              : null,

            quantity: body.quantity
              ? Number(body.quantity)
              : null,

            material:
              body.material || null,

            machine:
              body.machine || null,

            deliveryDate:
              body.deliveryDate
                ? new Date(
                    body.deliveryDate
                  )
                : null,

            priority:
              body.priority ??
              JobPriority.NORMAL,

            customer: {
              connect: {
                id: body.customerId,
              },
            },
          },

          include: {
            customer: true,
          },
        });

        for (
          let i = 0;
          i < body.productionSteps.length;
          i++
        ) {

          const step =
            body.productionSteps[i];

          await tx.productionStep.create({

            data: {

              jobId: job.id,

              stationId:
                step.stationId,

              stepOrder: i + 1,

              status:
                i === 0
                  ? ProductionStepStatus.DEVAM_EDIYOR
                  : ProductionStepStatus.BEKLIYOR,

              progress:
                i === 0
                  ? 1
                  : 0,

              startedAt:
                i === 0
                  ? new Date()
                  : null,
            },
          });

        }

        await tx.jobHistory.create({

          data: {

            jobId: job.id,

            action:
              "JOB_CREATED",

            description:
              `İş oluşturuldu (${job.jobNo})`,

          },

        });        const createdJob = await tx.job.findUnique({
          where: {
            id: job.id,
          },

          include: {
            customer: true,

            productionSteps: {
              include: {
                station: true,
                employee: true,
              },

              orderBy: {
                stepOrder: "asc",
              },
            },

            files: true,

            notes: true,

            photos: true,

            history: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        });

        if (!createdJob) {
          throw new Error(
            "Oluşturulan iş okunamadı."
          );
        }

        return createdJob;
      }
    );

    return NextResponse.json(
      result,
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "JOB CREATE ERROR:",
      error
    );

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,

          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,

        error:
          "İş oluşturulurken beklenmeyen bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}// =============================
// Gelecekte eklenecek modüller
// =============================
//
// TODO:
// İş oluşturulduğunda Bildirim gönder
//
// await notificationService.send({
//   jobId: job.id,
//   message: "Yeni iş oluşturuldu."
// });
//
// --------------------------------
//
// TODO:
// WhatsApp bildirimi
//
// await whatsapp.send({
//   customerId: body.customerId,
//   jobNo: job.jobNo,
// });
//
// --------------------------------
//
// TODO:
// Mail bildirimi
//
// await mail.send(...);
//
// --------------------------------
//
// TODO:
// Activity Log
//
// await tx.activity.create({...});
//
// --------------------------------
//
// TODO:
// Dashboard Cache Refresh
//
// revalidatePath("/");
// revalidatePath("/jobs");
// revalidatePath("/production");
//
// --------------------------------
//
// TODO:
// Socket.IO / WebSocket
//
// io.emit("job-created", job);
//
// --------------------------------
//
// END OF FILE