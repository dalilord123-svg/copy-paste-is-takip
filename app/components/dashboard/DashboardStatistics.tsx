type Props = {
  data: {
    jobStatistics: {
      status: string;
      _count: {
        status: number;
      };
    }[];

    productionStatistics: {
      status: string;
      _count: {
        status: number;
      };
    }[];
  };
};

export default function DashboardStatistics({ data }: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">
          İş Durumları
        </h2>

        <div className="space-y-4">
          {data.jobStatistics.map((item) => (
            <div
              key={item.status}
              className="flex justify-between border-b pb-3"
            >
              <div className="font-semibold">
                {item.status}
              </div>

              <div className="text-blue-600 font-bold">
                {item._count.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">
          Üretim Adımları
        </h2>

        <div className="space-y-4">
          {data.productionStatistics.map((item) => (
            <div
              key={item.status}
              className="flex justify-between border-b pb-3"
            >
              <div className="font-semibold">
                {item.status}
              </div>

              <div className="text-green-600 font-bold">
                {item._count.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}