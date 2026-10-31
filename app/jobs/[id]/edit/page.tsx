import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import JobEditForm from "../../../components/jobs/JobEditForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditJobPage({
  params,
}: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-8">
        İşi Düzenle
      </h1>

      <JobEditForm
        jobId={job.id}
      />

    </main>
  );
}