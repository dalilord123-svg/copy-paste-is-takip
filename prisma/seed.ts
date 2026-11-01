import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedStations() {
  console.log("");
  console.log("====================================");
  console.log("COPY PASTE İŞ TAKİP");
  console.log("Station Seed Başlıyor...");
  console.log("====================================");
  console.log("");

  const stations = [
    {
      name: "Grafik",
      icon: "🎨",
      color: "#3B82F6",
      sortOrder: 1,
      requirePhotoCount: 0,
      requireFile: true,
      requireNote: false,
    },
    {
      name: "Baskı",
      icon: "🖨️",
      color: "#10B981",
      sortOrder: 2,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
    },
    {
      name: "CNC",
      icon: "⚙️",
      color: "#F59E0B",
      sortOrder: 3,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
    },
    {
      name: "Elektrik",
      icon: "⚡",
      color: "#FACC15",
      sortOrder: 4,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
    },
    {
      name: "Kaynak",
      icon: "🔥",
      color: "#EF4444",
      sortOrder: 5,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
    },
    {
      name: "Boya",
      icon: "🎨",
      color: "#8B5CF6",
      sortOrder: 6,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
    },
    {
      name: "Montaj",
      icon: "🔧",
      color: "#06B6D4",
      sortOrder: 7,
      requirePhotoCount: 2,
      requireFile: false,
      requireNote: true,
    },
    {
      name: "Kalite Kontrol",
      icon: "✅",
      color: "#22C55E",
      sortOrder: 8,
      requirePhotoCount: 1,
      requireFile: false,
      requireNote: true,
    },
    {
      name: "Teslim",
      icon: "📦",
      color: "#64748B",
      sortOrder: 9,
      requirePhotoCount: 0,
      requireFile: false,
      requireNote: false,
    },
  ];

  for (const station of stations) {
    await prisma.station.upsert({
      where: {
        name: station.name,
      },

      update: {
        icon: station.icon,
        color: station.color,
        sortOrder: station.sortOrder,
        requirePhotoCount: station.requirePhotoCount,
        requireFile: station.requireFile,
        requireNote: station.requireNote,
        isActive: true,
      },

      create: {
        name: station.name,
        icon: station.icon,
        color: station.color,
        sortOrder: station.sortOrder,
        requirePhotoCount: station.requirePhotoCount,
        requireFile: station.requireFile,
        requireNote: station.requireNote,
        isActive: true,
      },
    });

    console.log(`✔ ${station.name}`);
  }

  console.log("");
  console.log("====================================");
  console.log("Station Seed Tamamlandı");
  console.log("====================================");
}

async function main() {
  await seedStations();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });