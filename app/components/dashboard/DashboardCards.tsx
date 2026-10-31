import { prisma } from "../../../lib/prisma";

export default async function DashboardCards() {
  const [
    totalJobs,
    activeJobs,
    totalCustomers,
    totalEmployees,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({
      where: {
        isArchived: false,
      },
    }),
    prisma.customer.count(),
    prisma.employee.count(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <Card title="Toplam İş" value={totalJobs} />
      <Card title="Aktif İş" value={activeJobs} />
      <Card title="Müşteri" value={totalCustomers} />
      <Card title="Personel" value={totalEmployees} />
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-gray-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}