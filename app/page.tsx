
import { redirect } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import ProductionStatus from "@/components/dashboard/ProductionStatus";
import RecentJobs from "@/components/dashboard/RecentJobs";

import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 lg:p-8 space-y-6">
        <DashboardHeader />

        <StatsCards />

        <QuickActions />

        <ProductionStatus />

        <RecentJobs />
      </main>
    </div>
  );
}
