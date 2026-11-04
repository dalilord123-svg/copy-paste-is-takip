import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { EmployeeRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const employee = await getCurrentUser();

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    let jobId = "";
    let productionStepId = "";
    let note = "";

    const contentType = req.headers.get("content-type") ?? "";

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();

      const jobIdValue = formData.get("jobId");
      const stepIdValue = formData.get("productionStepId");
      const noteValue = formData.get("note");

      jobId = typeof jobIdValue === "string" ? jobIdValue.trim() : "";
      productionStepId =
        typeof stepIdValue === "string" ? stepIdValue.trim() : "";
      note = typeof noteValue === "string" ? noteValue.trim() : "";
    } else {
      const body = await req.json();

      jobId =
        typeof body.jobId === "string" ? body.jobId.trim() : "";

      productionStepId =
        typeof body.productionStepId === "string"
          ? body.productionStepId.trim()
          : "";

      note =
        typeof body.note === "string" ? body.note.trim() : "";
    }

    if (!jobId || !productionStepId || !note) {
      return NextResponse.json(
        {
          success: false,
          message: "İş, üretim aşaması ve not bilgisi zorunludur.",
        },
        { status: 400 }
      );
    }

    if (note.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Not en fazla 5000 karakter olabilir.",
        },
        { status: 400 }
      );
    }

    const productionStep = await prisma.productionStep.findUnique({
      where: { id: productionStepId },
      include: {
        job: true,
        station: true,
        assignments: {
          select: {
            employeeId: true,
          },
        },
      },
    });

    if (!productionStep || productionStep.jobId !== jobId) {
      return NextResponse.json(
        {
          success: false,
          message: "İş veya üretim aşaması bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (productionStep.job.isArchived) {
      return NextResponse.json(
        {
          success: false,
          message: "Arşivlenmiş işe not eklenemez.",
        },
        { status: 400 }
      );
    }

    const isManager =
      employee.role === EmployeeRole.ADMIN ||
      employee.role === EmployeeRole.YONETICI;

    const isLeader = productionStep.leaderId === employee.id;

    const isAssigned = productionStep.assignments.some(
      (assignment) => assignment.employeeId === employee.id
    );

    if (!isManager && !isLeader && !isAssigned) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu üretim aşamasına not ekleme yetkiniz yok.",
        },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.jobNote.create({
        data: {
          jobId,
          employeeId: employee.id,
          note,
        },
      });

      await tx.productionStep.update({
        where: { id: productionStepId },
        data: {
          noteCount: {
            increment: 1,
          },
        },
      });

      await tx.jobHistory.create({
        data: {
          jobId,
          employeeId: employee.id,
          action: "NOTE_ADDED",
          description: `${productionStep.station.name} aşamasına not eklendi.`,
        },
      });
    });

    return NextResponse.redirect(
      new URL(`/mobile/jobs/${productionStepId}`, req.url)
    );
  } catch (error) {
    console.error("NOT EKLEME HATASI:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Not eklenemedi.",
      },
      { status: 500 }
    );
  }
}