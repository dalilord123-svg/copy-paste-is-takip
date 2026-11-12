import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { EmployeeRole } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const employee = await getCurrentUser();

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const photo = await prisma.jobPhoto.findUnique({
      where: { id },
      include: {
        productionStep: {
          include: {
            job: true,
            assignments: {
              select: { employeeId: true },
            },
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { success: false, message: "Fotoğraf bulunamadı." },
        { status: 404 }
      );
    }

    const step = photo.productionStep;

    const isManager =
      employee.role === EmployeeRole.ADMIN ||
      employee.role === EmployeeRole.YONETICI;

    const isLeader = step?.leaderId === employee.id;

    const isAssigned =
      step?.assignments.some(
        (assignment) => assignment.employeeId === employee.id
      ) ?? false;

    if (!isManager && !isLeader && !isAssigned) {
      return NextResponse.json(
        { success: false, message: "Fotoğrafı silme yetkiniz yok." },
        { status: 403 }
      );
    }

    if (step?.job.isArchived) {
      return NextResponse.json(
        { success: false, message: "Arşivlenmiş işin fotoğrafı silinemez." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.jobPhoto.delete({
        where: { id },
      });

      if (photo.productionStepId) {
        await tx.productionStep.updateMany({
          where: {
            id: photo.productionStepId,
            photoCount: { gt: 0 },
          },
          data: {
            photoCount: { decrement: 1 },
          },
        });
      }

      await tx.jobHistory.create({
        data: {
          jobId: photo.jobId,
          employeeId: employee.id,
          action: "PHOTO_DELETE",
          description: `${photo.originalName} fotoğrafı silindi.`,
        },
      });
    });

    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      path.basename(photo.fileName)
    );

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Fotoğraf dosyası silinemedi:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Fotoğraf silindi.",
    });
  } catch (error) {
    console.error("FOTOĞRAF SİLME HATASI:", error);

    return NextResponse.json(
      { success: false, message: "Fotoğraf silinemedi." },
      { status: 500 }
    );
  }
}