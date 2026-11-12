import { PrismaClient, EmployeeRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedStations() {
  const stations = [
    {
      name: "Grafik",
      icon: "🎨",
      color: "#3B82F6",
      sortOrder: 1,
      requirePhotoCount: 0,
      requireFile: true,
      requireNote: false,
      allowMultipleEmployees: true,
      estimatedMinutes: 60,
    },
    {
      name: "Baskı",
      icon: "🖨️",
      color: "#10B981",
      sortOrder: 2,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
      allowMultipleEmployees: true,
      estimatedMinutes: 60,
    },
    {
      name: "CNC",
      icon: "⚙️",
      color: "#F59E0B",
      sortOrder: 3,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
      allowMultipleEmployees: true,
      estimatedMinutes: 60,
    },
    {
      name: "Elektrik",
      icon: "⚡",
      color: "#EAB308",
      sortOrder: 4,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
      allowMultipleEmployees: true,
      estimatedMinutes: 60,
    },
    {
      name: "Kaynak",
      icon: "🔥",
      color: "#EF4444",
      sortOrder: 5,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
      allowMultipleEmployees: true,
      estimatedMinutes: 60,
    },
    {
      name: "Boya",
      icon: "🎨",
      color: "#8B5CF6",
      sortOrder: 6,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
      allowMultipleEmployees: true,
      estimatedMinutes: 60,
    },
    {
      name: "Montaj",
      icon: "🔧",
      color: "#06B6D4",
      sortOrder: 7,
      requirePhotoCount: 2,
      requireFile: false,
      requireNote: true,
      allowMultipleEmployees: true,
      estimatedMinutes: 120,
    },
    {
      name: "Kalite Kontrol",
      icon: "✅",
      color: "#22C55E",
      sortOrder: 8,
      requirePhotoCount: 1,
      requireFile: false,
      requireNote: true,
      allowMultipleEmployees: false,
      estimatedMinutes: 30,
    },
    {
      name: "Teslim",
      icon: "📦",
      color: "#64748B",
      sortOrder: 9,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
      allowMultipleEmployees: false,
      estimatedMinutes: 15,
    },
  ];

  for (const station of stations) {
    await prisma.station.upsert({
      where: {
        name: station.name,
      },
      update: station,
      create: station,
    });

    console.log("✔", station.name);
  }
}

async function seedAdmin() {
  const password = await bcrypt.hash("123456", 10);

  await prisma.employee.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      name: "Administrator",
      username: "admin",
      password,
      role: EmployeeRole.ADMIN,
      isActive: true,
    },
  });

  console.log("✔ Admin oluşturuldu");
}

async function main() {
  console.log("====================================");
  console.log("COPY PASTE İŞ TAKİP");
  console.log("Seed Başlıyor");
  console.log("====================================");

  await seedStations();
  await seedAdmin();

  console.log("");
  console.log("====================================");
  console.log("Seed Tamamlandı");
  console.log("====================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });