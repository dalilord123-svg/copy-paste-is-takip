type Props = {
  value: number;
};

export default function ProgressBar({
  value,
}: Props) {
  const progress = Math.max(
    0,
    Math.min(100, value)
  );

  let color = "bg-blue-600";

  if (progress >= 100) {
    color = "bg-green-600";
  } else if (progress >= 70) {
    color = "bg-green-500";
  } else if (progress >= 40) {
    color = "bg-yellow-500";
  } else if (progress >= 20) {
    color = "bg-orange-500";
  } else {
    color = "bg-red-500";
  }

  return (
    <div>

      <div className="flex justify-between text-xs text-gray-500 mb-1">

        <span>İlerleme</span>

        <span>%{progress}</span>

      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
}