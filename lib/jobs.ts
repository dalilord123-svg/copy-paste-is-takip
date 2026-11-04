// lib/jobs.ts

import { prisma } from "@/lib/prisma";
import { JobPriority, JobStatus, ProductionStepStatus } from "@prisma/client";
import { randomUUID } from "crypto";

type StepInput = {
  stationId: string;
  leaderId?: string | null;
  employeeIds: string[];
  estimatedMinutes?: number;
};

type CreateJobInput = {
  customerId: string;
  title: string;
  description?: string;
  templateId: string;
  deliveryDate?: Date | null;
  priority?: JobPriority;
  width?: number;
  height?: number;
  quantity?: number;
  material?: string;
  machine?: string;
  steps: StepInput[];
};

export async function createJob(data: CreateJobInput) {
  return prisma.$transaction(async (tx) => {
    const jobNo = `JOB-${new Date().getFullYear()}-${randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

    const job = await tx.job.create({
      data: {
        jobNo,
        title: data.title,
        description: data.description,
        customerId: data.customerId,
        deliveryDate: data.deliveryDate,
        priority: data.priority ?? JobPriority.NORMAL,
        status: JobStatus.BEKLIYOR,
        width: data.width,
        height: data.height,
        quantity: data.quantity,
        material: data.material,
        machine: data.machine,
      },
    });

    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];

      const productionStep = await tx.productionStep.create({
        data: {
          jobId: job.id,
          stationId: step.stationId,
          leaderId: step.leaderId ?? null,
          stepOrder: i + 1,
          estimatedMinutes: step.estimatedMinutes ?? 0,
          status: ProductionStepStatus.BEKLIYOR,
        },
      });

      if (step.employeeIds.length) {
        await tx.productionAssignment.createMany({
          data: step.employeeIds.map((employeeId) => ({
            productionStepId: productionStep.id,
            employeeId,
          })),
        });
      }
    }

    return job;
  });
}