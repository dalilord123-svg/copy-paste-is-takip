import Sidebar from "./components/layout/Sidebar";

import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardCards from "./components/dashboard/DashboardCards";
import QuickActions from "./components/dashboard/QuickActions";
import ProductionStatus from "./components/dashboard/ProductionStatus";
import DashboardStatistics from "./components/dashboard/DashboardStatistics";
import RecentJobs from "./components/dashboard/RecentJobs";

import { getDashboardData } from "@/lib/dashboard";

export default async function HomePage() {

  const data =
    await getDashboardData();

  return (

    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">

        <DashboardHeader />

        <DashboardCards data={data} />

        <QuickActions />

        <ProductionStatus data={data} />

        <DashboardStatistics data={data} />

        <RecentJobs jobs={data.recentJobs} />

      </main>

    </div>

  );

}