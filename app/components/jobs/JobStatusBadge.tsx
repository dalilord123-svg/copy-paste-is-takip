import { ProductionStepStatus } from "@prisma/client";

type Props = {
  status: ProductionStepStatus;
};

export default function JobStatusBadge({ status }: Props) {
  switch (status) {
    case ProductionStepStatus.BEKLIYOR:
      return (
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
          Bekliyor
        </span>
      );

    case ProductionStepStatus.HAZIR:
      return (
        <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-sm font-medium">
          Hazır
        </span>
      );

    case ProductionStepStatus.DEVAM_EDIYOR:
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 text-sm font-medium">
          Devam Ediyor
        </span>
      );

    case ProductionStepStatus.BEKLEMEDE:
      return (
        <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-800 text-sm font-medium">
          Beklemede
        </span>
      );

    case ProductionStepStatus.TAMAMLANDI:
      return (
        <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-sm font-medium">
          Tamamlandı
        </span>
      );

    case ProductionStepStatus.IPTAL:
      return (
        <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 text-sm font-medium">
          İptal
        </span>
      );

    default:
      return (
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
          Bilinmiyor
        </span>
      );
  }
}