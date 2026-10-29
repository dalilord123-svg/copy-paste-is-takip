type Props = {
  status: string;
};

export default function JobStatusBadge({ status }: Props) {
  let color =
    "bg-gray-100 text-gray-800";

  switch (status) {
    case "BEKLIYOR":
      color = "bg-yellow-100 text-yellow-800";
      break;

    case "TASARIM":
      color = "bg-blue-100 text-blue-800";
      break;

    case "BASKI":
      color = "bg-purple-100 text-purple-800";
      break;

    case "KESIM":
      color = "bg-orange-100 text-orange-800";
      break;

    case "MONTAJ":
      color = "bg-cyan-100 text-cyan-800";
      break;

    case "TAMAMLANDI":
      color = "bg-green-100 text-green-800";
      break;

    case "TESLIM":
      color = "bg-emerald-600 text-white";
      break;
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}
    >
      {status}
    </span>
  );
}