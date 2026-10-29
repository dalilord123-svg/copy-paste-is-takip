import Link from "next/link";
import JobForm from "../../components/jobs/JobForm";

export default function NewJobPage() {
  return (
    <main className="max-w-5xl mx-auto p-8">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Yeni İş
          </h1>

          <p className="text-gray-500 mt-2">
            Yeni üretim işi oluştur.
          </p>
        </div>

        <Link
          href="/jobs"
          className="text-blue-600 hover:underline"
        >
          ← İş Listesi
        </Link>

      </div>

      <div className="bg-white rounded-xl shadow p-8">

        <JobForm />

      </div>

    </main>
  );
}