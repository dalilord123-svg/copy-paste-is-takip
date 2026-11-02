import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      openJobs,
      archivedJobs,
      completedJobs,
      todayDelivery,
      inProduction,
      waiting,
    ] = await Promise.all([
      prisma.job.count({
        where: {
          isArchived: false,
          status: {
            in: ["BEKLIYOR", "DEVAM_EDIYOR"],
          },
        },
      }),

      prisma.job.count({
        where: {
          isArchived: true,
        },
      }),

      prisma.job.count({
        where: {
          status: {
            in: ["TAMAMLANDI", "TESLIM"],
          },
        },
      }),

      prisma.job.count({
        where: {
          isArchived: false,
          deliveryDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      prisma.productionStep.count({
        where: {
          status: "DEVAM_EDIYOR",
        },
      }),

      prisma.productionStep.count({
        where: {
          status: "BEKLEMEDE",
        },
      }),
    ]);

    return NextResponse.json({
      openJobs,
      inProduction,
      waiting,
      todayDelivery,
      completed: completedJobs,
      archived: archivedJobs,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return NextResponse.json(
      {
        error: "Dashboard verileri alınamadı.",
      },
      {
        status: 500,
      }
    );
  }
}