
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ProductionFilters = {
  q?: string;
  station?: string;
  employee?: string;
  status?: string;
};

const STEP_STATUSES = [
  "BEKLIYOR",
  "HAZIR",
  "DEVAM_EDIYOR",
  "BEKLEMEDE",
  "TAMAMLANDI",
  "IPTAL",
] as const;

export async function getProductionData(
  filters: ProductionFilters = {}
) {
  const { q, station, employee, status } = filters;

  const stepWhere: Prisma.ProductionStepWhereInput = {
    ...(station && {
      stationId: station,
    }),

    ...(employee && {
      assignments: {
        some: {
          employeeId: employee,
        },
      },
    }),

    ...(status &&
      STEP_STATUSES.includes(
        status as (typeof STEP_STATUSES)[number]
      ) && {
        status: status as (typeof STEP_STATUSES)[number],
      }),
  };

  const hasStepFilters = Boolean(
    station || employee || (status && STEP_STATUSES.includes(
      status as (typeof STEP_STATUSES)[number]
    ))
  );

  const where: Prisma.JobWhereInput = {
    isArchived: false,

    ...(q && {
      OR: [
        {
          jobNo: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          customer: {
            company: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      ],
    }),

    ...(hasStepFilters && {
      productionSteps: {
        some: stepWhere,
      },
    }),
  };

  const [
    jobs,
    stations,
    employees,
    totalJobs,
    activeJobs,
    completedJobs,
    waitingSteps,
    activeSteps,
  ] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        customer: true,
        productionSteps: {
          include: {
            station: true,
            assignments: {
              include: {
                employee: true,
              },
            },
          },
          orderBy: {
            stepOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.station.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),

    prisma.employee.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.job.count({
      where: {
        isArchived: false,
      },
    }),

    prisma.job.count({
      where: {
        isArchived: false,
        status: "DEVAM_EDIYOR",
      },
    }),

    prisma.job.count({
      where: {
        status: "TAMAMLANDI",
      },
    }),

    prisma.productionStep.count({
      where: {
        status: "BEKLIYOR",
      },
    }),

    prisma.productionStep.count({
      where: {
        status: "DEVAM_EDIYOR",
      },
    }),
  ]);

  return {
    jobs,
    stations,
    employees,

    summary: {
      totalJobs,
      activeJobs,
      completedJobs,
      waitingSteps,
      activeSteps,
    },
  };
}
