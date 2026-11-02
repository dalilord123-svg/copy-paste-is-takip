import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Briefcase,
  Users,
  Building2,
  Truck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default async function StatsCards() {
  const [
    totalJobs,
    activeJobs,
    completedJobs,
    totalEmployees,
    totalCustomers,
    todayDeliveries,
  ] = await Promise.all([
    prisma.job.count(),

    prisma.job.count({
      where: {
        status: {
          not: "TESLIM",
        },
      },
    }),

    prisma.job.count({
      where: {
        status: "TESLIM",
      },
    }),

    prisma.employee.count({
      where: {
        isActive: true,
      },
    }),

    prisma.customer.count(),

    prisma.job.count({
      where: {
        deliveryDate: {
          gte: new Date(
            new Date().setHours(0, 0, 0, 0)
          ),
          lt: new Date(
            new Date().setHours(23, 59, 59, 999)
          ),
        },
      },
    }),
  ]);

  const cards = [
    {
      title: "Toplam İş",
      value: totalJobs,
      color: "bg-blue-600",
      icon: Briefcase,
      href: "/jobs",
    },
    {
      title: "Aktif İş",
      value: activeJobs,
      color: "bg-orange-500",
      icon: AlertTriangle,
      href: "/jobs",
    },
    {
      title: "Teslim Edilen",
      value: completedJobs,
      color: "bg-green-600",
      icon: CheckCircle2,
      href: "/jobs/archive",
    },
    {
      title: "Personel",
      value: totalEmployees,
      color: "bg-purple-600",
      icon: Users,
      href: "/employees",
    },
    {
      title: "Müşteri",
      value: totalCustomers,
      color: "bg-cyan-600",
      icon: Building2,
      href: "/customers",
    },
    {
      title: "Bugünkü Teslimat",
      value: todayDeliveries,
      color: "bg-red-600",
      icon: Truck,
      href: "/deliveries",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl bg-white shadow hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between p-6">

              <div>

                <div className="text-gray-500 text-sm">
                  {card.title}
                </div>

                <div className="mt-3 text-4xl font-bold">
                  {card.value}
                </div>

              </div>

              <div
                className={`h-16 w-16 rounded-2xl ${card.color} flex items-center justify-center`}
              >
                <Icon
                  className="text-white"
                  size={30}
                />
              </div>

            </div>
          </Link>
        );
      })}
    </div>
  );
}