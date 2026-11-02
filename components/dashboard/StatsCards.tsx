import { prisma } from "@/lib/prisma";

export default async function StatsCards() {
  const employeeCount = await prisma.employee.count();
  const customerCount = await prisma.customer.count();
const jobCount = await prisma.job.count();
  return (
    <div className="bg-green-500 text-white p-10 rounded-xl">
      Personel: {employeeCount}
      <br />
      Müşteri: {customerCount}
    </div>
  );
}