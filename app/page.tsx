import Sidebar from "./components/layout/Sidebar";

import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardCards from "./components/dashboard/DashboardCards";
import QuickActions from "./components/dashboard/QuickActions";
import ProductionStatus from "./components/dashboard/ProductionStatus";
import RecentJobs from "./components/dashboard/RecentJobs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">

        <DashboardHeader />

        <DashboardCards />

        <QuickActions />

        <ProductionStatus />

        <RecentJobs />

      </main>

    </div>
  );
}