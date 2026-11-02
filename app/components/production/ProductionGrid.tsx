```tsx
import ProductionJobCard from "./ProductionJobCard";

type Props = {
  jobs: any[];
};

export default function ProductionGrid({
  jobs,
}: Props) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-16 text-center">
        <div className="text-6xl mb-4">
          📦
        </div>

        <h2 className="text-2xl font-bold">
          Aktif üretim bulunamadı
        </h2>

        <p className="text-gray-500 mt-2">
          Üretime alınmış iş bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
      {jobs.map((job) => (
        <ProductionJobCard
          key={job.id}
          job={job}
        />
      ))}
    </div>
  );
}
```