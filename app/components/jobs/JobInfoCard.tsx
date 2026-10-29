type Props = {
  title: string;
  value: string;
};

export default function JobInfoCard({
  title,
  value,
}: Props) {
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">

      <div className="text-gray-500 text-sm mb-2">
        {title}
      </div>

      <div className="font-semibold text-lg">
        {value || "-"}
      </div>

    </div>
  );
}