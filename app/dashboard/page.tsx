import Header from "@/components/dashboard/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentJobs from "@/components/dashboard/RecentJobs";
import EmployeeStatus from "@/components/dashboard/EmployeeStatus";
import ProductionStatus from "@/components/dashboard/ProductionStatus";
import Deliveries from "@/components/dashboard/Deliveries";

export default function DashboardPage() {
  return (
    <main className="p-10 space-y-6">
      <Header />

      <StatsCards />

      <QuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentJobs />
        </div>

        <EmployeeStatus />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProductionStatus />
        <Deliveries />
      </div>
    </main>
  );
}