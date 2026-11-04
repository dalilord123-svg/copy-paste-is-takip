import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalJobs,
    activeJobs,
    archivedJobs,
    customers,
    employees,
    todayDeliveries,
    overdueJobs,
    recentJobs,
    productionSteps,
    jobStatistics,
    productionStatistics,
  ] = await Promise.all([
    prisma.job.count(),

    prisma.job.count({
      where: {
        isArchived: false,
      },
    }),

    prisma.job.count({
      where: {
        isArchived: true,
      },
    }),

    prisma.customer.count(),

    prisma.employee.count({
      where: {
        isActive: true,
      },
    }),

    prisma.job.count({
      where: {
        deliveryDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.job.count({
      where: {
        isArchived: false,
        status: {
          not: "TESLIM",
        },
        deliveryDate: {
          lt: todayStart,
        },
      },
    }),

    prisma.job.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
      },
    }),

    prisma.productionStep.findMany({
      orderBy: {
        stepOrder: "asc",
      },
      include: {
        station: true,
        leader: true,

        job: {
          include: {
            customer: true,
          },
        },

        assignments: {
          include: {
            employee: true,
          },
        },
      },
    }),

    prisma.job.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),

    prisma.productionStep.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
  ]);

  return {
    totalJobs,
    activeJobs,
    archivedJobs,

    customers,
    employees,

    todayDeliveries,
    overdueJobs,

    recentJobs,

    productionSteps,

    jobStatistics,

    productionStatistics,
  };
}