import { prisma } from "@/lib/prisma";

export default async function DashboardStatistics() {
  const [
    openJobs,
    productionJobs,
    delayedJobs,
    customers,
    employees,
    todayDeliveries,
  ] = await Promise.all([
    prisma.job.count({
      where: {
        isArchived: false,
        status: {
          notIn: ["TESLIM", "IPTAL"],
        },
      },
    }),

    prisma.job.count({
      where: {
        status: "DEVAM_EDIYOR",
      },
    }),

    prisma.job.count({
      where: {
        deliveryDate: {
          lt: new Date(),
        },
        status: {
          not: "TESLIM",
        },
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
          gte: new Date(
            new Date().setHours(0, 0, 0, 0)
          ),
          lt: new Date(
            new Date().setHours(24, 0, 0, 0)
          ),
        },
      },
    }),
  ]);

  const cards = [
    {
      title: "Açık İş",
      value: openJobs,
      icon: "📋",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Üretimde",
      value: productionJobs,
      icon: "🏭",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Bugün Teslim",
      value: todayDeliveries,
      icon: "📦",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Geciken",
      value: delayedJobs,
      icon: "⚠️",
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Personel",
      value: employees,
      icon: "👷",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Müşteri",
      value: customers,
      icon: "🏢",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow border p-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-sm">
                {card.title}
              </div>

              <div className="text-4xl font-bold mt-2">
                {card.value}
              </div>
            </div>

            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${card.color}`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}