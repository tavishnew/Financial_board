import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // No seed data needed - categories are auto-seeded on registration
  // and via /api/categories/auto-seed for existing users
  console.log("Database ready - categories auto-seeded on user registration");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
