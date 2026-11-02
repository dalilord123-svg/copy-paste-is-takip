import { PrismaClient, EmployeeRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "123456";

  const existing = await prisma.employee.findUnique({
    where: {
      username,
    },
  });

  if (existing) {
    console.log("Admin kullanıcısı zaten mevcut.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.employee.create({
    data: {
      name: "Sistem Yöneticisi",
      username,
      password: hashedPassword,
      role: EmployeeRole.ADMIN,
      isActive: true,
    },
  });

  console.log("Admin oluşturuldu.");
  console.log("---------------------------");
  console.log("Kullanıcı : admin");
  console.log("Şifre      : 123456");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });