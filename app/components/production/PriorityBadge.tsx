import { JobPriority } from "@prisma/client";

type Props = {
  priority: JobPriority;
};

export default function PriorityBadge({
  priority,
}: Props) {
  switch (priority) {
    case "ACIL":
      return (
        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">
          🔴 Acil
        </span>
      );

    case "YUKSEK":
      return (
        <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold">
          🟠 Yüksek
        </span>
      );

    case "NORMAL":
      return (
        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
          🔵 Normal
        </span>
      );

    default:
      return (
        <span className="px-3 py-1 rounded-full bg-gray-500 text-white text-xs font-semibold">
          ⚪ Düşük
        </span>
      );
  }
}