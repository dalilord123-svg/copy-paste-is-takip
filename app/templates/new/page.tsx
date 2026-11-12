import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import TemplateForm from "@/components/templates/TemplateForm";

export default async function NewTemplatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const stations = await prisma.station.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Yeni Şablon
      </h1>

      <TemplateForm stations={stations} />
    </main>
  );
}