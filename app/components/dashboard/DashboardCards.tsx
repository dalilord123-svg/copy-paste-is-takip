type Props = {
  data: {
    totalJobs: number;
    activeJobs: number;
    archivedJobs: number;
    customers: number;
    employees: number;
    todayDeliveries: number;
    overdueJobs: number;
  };
};

export default function DashboardCards({
  data,
}: Props) {
  const cards = [
    {
      title: "Toplam İş",
      value: data.totalJobs,
      color: "bg-blue-500",
      icon: "📋",
    },
    {
      title: "Aktif İş",
      value: data.activeJobs,
      color: "bg-green-500",
      icon: "🚀",
    },
    {
      title: "Arşiv",
      value: data.archivedJobs,
      color: "bg-gray-500",
      icon: "📦",
    },
    {
      title: "Bugün Teslim",
      value: data.todayDeliveries,
      color: "bg-indigo-500",
      icon: "📅",
    },
    {
      title: "Geciken İş",
      value: data.overdueJobs,
      color: "bg-red-500",
      icon: "⚠️",
    },
    {
      title: "Müşteri",
      value: data.customers,
      color: "bg-orange-500",
      icon: "🏢",
    },
    {
      title: "Personel",
      value: data.employees,
      color: "bg-purple-500",
      icon: "👷",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mt-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">
                {card.title}
              </div>

              <div className="text-4xl font-bold mt-2">
                {card.value}
              </div>
            </div>

            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white ${card.color}`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}