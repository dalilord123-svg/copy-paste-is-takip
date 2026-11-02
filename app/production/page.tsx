import { getProductionData } from "@/lib/production";

import ProductionHeader from "@/app/components/production/ProductionHeader";
import ProductionCards from "@/app/components/production/ProductionCards";
import ProductionFilters from "@/app/components/production/ProductionFilters";
import ProductionGrid from "@/app/components/production/ProductionGrid";

type Props = {
  searchParams: Promise<{
    q?: string;
    station?: string;
    employee?: string;
    status?: string;
  }>;
};

export default async function ProductionPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const data = await getProductionData({
    q: params.q,
    station: params.station,
    employee: params.employee,
    status: params.status,
  });

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-6">

      <ProductionHeader />

      <ProductionCards
        summary={data.summary}
      />

      <ProductionFilters
        stations={data.stations}
        employees={data.employees}
      />

      <ProductionGrid
        jobs={data.jobs}
      />

    </main>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;