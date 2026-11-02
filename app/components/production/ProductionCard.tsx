type Props = {
  summary: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    waitingSteps: number;
    activeSteps: number;
  };
};

export default function ProductionCards({ summary }: Props) {
  const cards = [
    {
      title: "Toplam İş",
      value: summary.totalJobs,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: "📦",
    },
    {
      title: "Aktif İş",
      value: summary.activeJobs,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: "🚧",
    },
    {
      title: "Devam Eden",
      value: summary.activeSteps,
      color: "text-green-600",
      bg: "bg-green-50",
      icon: "▶️",
    },
    {
      title: "Bekleyen",
      value: summary.waitingSteps,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: "⏳",
    },
    {
      title: "Tamamlanan",
      value: summary.completedJobs,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      icon: "✅",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.bg} rounded-xl border shadow-sm p-5`}
        >
          <div className="flex items-center justify-between">
            <div className="text-3xl">
              {card.icon}
            </div>

            <div
              className={`text-4xl font-bold ${card.color}`}
            >
              {card.value}
            </div>
          </div>

          <div className="mt-4 text-gray-600 font-semibold">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}