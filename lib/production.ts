import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ProductionFilters = {
  q?: string;
  station?: string;
  employee?: string;
  status?: string;
};

export async function getProductionData(
  filters: ProductionFilters = {}
) {
  const { q, station, employee, status } = filters;

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

    ...(station && {
      productionSteps: {
        some: {
          stationId: station,
        },
      },
    }),

    ...(employee && {
      productionSteps: {
        some: {
          employeeId: employee,
        },
      },
    }),

    ...(status && {
      productionSteps: {
        some: {
          status: status as any,
        },
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
            employee: true,
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