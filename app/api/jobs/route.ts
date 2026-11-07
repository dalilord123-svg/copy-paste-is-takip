import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobPriority, JobStatus, ProductionStepStatus } from "@prisma/client";

type CreateJobStep = {
  stationId: string;
  stationName?: string;
  employeeIds?: string[];
};

type CreateJobRequest = {
  customerId: string;
  title: string;
  leaderId: string;
  description?: string;
  width?: string | number;
  height?: string | number;
  quantity?: string | number;
  material?: string;
  machine?: string;
  deliveryDate?: string | null;
  priority?: JobPriority;
  steps?: CreateJobStep[];
  productionSteps?: CreateJobStep[];
};

const jobInclude = {
  customer: true,
  productionSteps: {
    orderBy: { stepOrder: "asc" as const },
    include: {
      station: true,
      leader: true,
      assignments: { include: { employee: true } },
    },
  },
  files: true,
  notes: {
    include: { employee: true },
    orderBy: { createdAt: "desc" as const },
  },
  photos: { include: { employee: true } },
  history: { orderBy: { createdAt: "desc" as const } },
};

function parseNumber(value?: string | number): number | null {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function generateJobNo(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const year = new Date().getFullYear();
  const count = await tx.job.count({
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
      where: { isArchived: false },
      include: jobInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("GET JOBS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "İşler getirilemedi." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateJobRequest;

    if (!body.customerId) {
      return NextResponse.json({ error: "Müşteri seçiniz." }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "İş adı zorunludur." }, { status: 400 });
    }
    if (!body.leaderId) {
      return NextResponse.json({ error: "Genel ustabaşı seçiniz." }, { status: 400 });
    }

    const steps = body.steps ?? body.productionSteps;
    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ error: "En az bir üretim adımı seçiniz." }, { status: 400 });
    }
    if (!Object.values(JobPriority).includes(body.priority ?? JobPriority.NORMAL)) {
      return NextResponse.json({ error: "Geçersiz iş önceliği." }, { status: 400 });
    }
    if (body.deliveryDate && Number.isNaN(new Date(body.deliveryDate).getTime())) {
      return NextResponse.json({ error: "Geçersiz teslim tarihi." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
      select: { id: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const stationIds = steps.map((step) => step.stationId);
    if (stationIds.some((id) => !id) || new Set(stationIds).size !== stationIds.length) {
      return NextResponse.json(
        { error: "Üretim kademelerini kontrol edin. Aynı istasyon iki kez seçilemez." },
        { status: 400 }
      );
    }

    for (const step of steps) {
      if (!Array.isArray(step.employeeIds) || step.employeeIds.length === 0) {
        return NextResponse.json(
          { error: `${step.stationName ?? "Üretim adımı"} için en az bir personel seçiniz.` },
          { status: 400 }
        );
      }
      if (new Set(step.employeeIds).size !== step.employeeIds.length) {
        return NextResponse.json(
          { error: "Aynı personel bir adımda birden fazla seçilemez." },
          { status: 400 }
        );
      }
    }

    const stations = await prisma.station.findMany({
      where: { id: { in: stationIds }, isActive: true },
      select: { id: true },
    });
    if (stations.length !== stationIds.length) {
      return NextResponse.json(
        { error: "Seçilen kademelerden biri bulunamadı veya pasif." },
        { status: 400 }
      );
    }

    const employeeIds = [...new Set([
      body.leaderId,
      ...steps.flatMap((step) => step.employeeIds ?? []),
    ])];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, isActive: true },
      select: { id: true },
    });
    if (employees.length !== employeeIds.length) {
      return NextResponse.json(
        { error: "Seçilen personellerden biri bulunamadı veya pasif." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const jobNo = await generateJobNo(tx);
      const job = await tx.job.create({
        data: {
          jobNo,
          title: body.title.trim(),
          description: body.description || null,
          width: parseNumber(body.width),
          height: parseNumber(body.height),
          quantity: parseNumber(body.quantity),
          material: body.material || null,
          machine: body.machine || null,
          deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
          priority: body.priority ?? JobPriority.NORMAL,
          status: JobStatus.DEVAM_EDIYOR,
          customerId: body.customerId,
        },
      });

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await tx.productionStep.create({
          data: {
            jobId: job.id,
            stationId: step.stationId,
            leaderId: body.leaderId,
            stepOrder: i + 1,
            status: i === 0 ? ProductionStepStatus.DEVAM_EDIYOR : ProductionStepStatus.BEKLIYOR,
            progress: i === 0 ? 1 : 0,
            startedAt: i === 0 ? new Date() : null,
            assignments: {
              create: (step.employeeIds ?? []).map((employeeId) => ({
                employeeId,
                status: i === 0 ? ProductionStepStatus.DEVAM_EDIYOR : ProductionStepStatus.BEKLIYOR,
                startedAt: i === 0 ? new Date() : null,
              })),
            },
          },
        });
      }

      await tx.jobHistory.create({
        data: {
          jobId: job.id,
          action: "JOB_CREATED",
          description: `İş oluşturuldu (${job.jobNo}). İşe özel üretim akışı, genel ustabaşı ve personeller atandı.`,
        },
      });

      const createdJob = await tx.job.findUnique({
        where: { id: job.id },
        include: jobInclude,
      });
      if (!createdJob) throw new Error("Oluşturulan iş okunamadı.");
      return createdJob;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("JOB CREATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "İş oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
