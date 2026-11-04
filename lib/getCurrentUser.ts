import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "./auth";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("employee_token");

    if (!token?.value) {
      return null;
    }

    const payload = verifyToken(token.value);

    const employee = await prisma.employee.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!employee || !employee.isActive) {
      return null;
    }

    return employee;
  } catch {
    return null;
  }
}