type Props = {
  deliveryDate: Date | null;
};

export default function DeliveryBadge({
  deliveryDate,
}: Props) {
  if (!deliveryDate) {
    return (
      <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs">
        Tarih Yok
      </span>
    );
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const delivery = new Date(deliveryDate);

  delivery.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (delivery.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diff < 0) {
    return (
      <span className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold">
        🔴 Gecikti
      </span>
    );
  }

  if (diff === 0) {
    return (
      <span className="px-2 py-1 rounded-lg bg-orange-600 text-white text-xs font-semibold">
        🟠 Bugün
      </span>
    );
  }

  if (diff === 1) {
    return (
      <span className="px-2 py-1 rounded-lg bg-yellow-500 text-black text-xs font-semibold">
        🟡 Yarın
      </span>
    );
  }

  if (diff <= 3) {
    return (
      <span className="px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold">
        🔵 {diff} Gün
      </span>
    );
  }

  return (
    <span className="px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold">
      🟢 {delivery.toLocaleDateString("tr-TR")}
    </span>
  );
}