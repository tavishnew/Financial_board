import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { key: "food", name: "Food", icon: "Utensils", color: "oklch(0.72 0.16 60)" },
  { key: "transport", name: "Transport", icon: "Bus", color: "oklch(0.65 0.16 250)" },
  { key: "shopping", name: "Shopping", icon: "ShoppingBag", color: "oklch(0.62 0.20 300)" },
  { key: "bills", name: "Bills", icon: "FileText", color: "oklch(0.62 0.20 20)" },
  { key: "fun", name: "Fun", icon: "Gamepad2", color: "oklch(0.68 0.18 350)" },
  { key: "health", name: "Health", icon: "HeartPulse", color: "oklch(0.72 0.14 195)" },
  { key: "savings", name: "Savings", icon: "PiggyBank", color: "oklch(0.75 0.15 160)" },
];

async function main() {
  const email = "demo@finboard.app";
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Demo", currency: "INR" },
  });

  await prisma.category.deleteMany({ where: { userId: user.id } });
  const cats = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: { userId: user.id, ...c, isDefault: true } }))
  );

  await prisma.account.deleteMany({ where: { userId: user.id } });
  const accounts = await Promise.all([
    prisma.account.create({ data: { userId: user.id, name: "Salary Account", type: "bank", balance: 184250 } }),
    prisma.account.create({ data: { userId: user.id, name: "Wallet", type: "cash", balance: 4200 } }),
    prisma.account.create({ data: { userId: user.id, name: "Sapphire Card", type: "card", balance: -18200 } }),
    prisma.account.create({ data: { userId: user.id, name: "Emergency Fund", type: "bank", balance: 96000 } }),
  ]);

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  const salary = accounts[0];
  const card = accounts[2];
  const savings = accounts[3];
  const today = new Date();
  for (let m = 2; m >= 0; m--) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "income",
        amount: 145000,
        accountId: salary.id,
        note: "Monthly salary",
        date: new Date(today.getFullYear(), today.getMonth() - m, 1),
        tags: ["salary"],
      },
    });
  }
  const NOTES: Record<string, string[]> = {
    food: ["Grocery run", "Cafe latte", "Dinner out"],
    transport: ["Metro pass", "Cab", "Fuel"],
    shopping: ["Headphones", "Amazon", "Shoes"],
    bills: ["Electricity", "Recharge", "Internet"],
    fun: ["Movie", "Concert", "Game pass"],
    health: ["Pharmacy", "Gym", "Checkup"],
    savings: ["MF SIP", "RD", "Index fund"],
  };
  for (let i = 0; i < 60; i++) {
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const notes = NOTES[cat.key];
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(Math.random() * 70));
    const amount = Math.round((200 + Math.random() * 4000) / 10) * 10;
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "expense",
        amount,
        categoryId: cat.id,
        accountId: cat.key === "savings" ? savings.id : Math.random() > 0.5 ? salary.id : card.id,
        note: notes[Math.floor(Math.random() * notes.length)],
        date: d,
      },
    });
  }

  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await Promise.all(
    cats.slice(0, 6).map((c, i) =>
      prisma.budget.create({
        data: { userId: user.id, categoryId: c.id, limit: [12000, 5000, 9000, 12000, 4000, 3500][i] },
      })
    )
  );

  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await Promise.all([
    prisma.goal.create({ data: { userId: user.id, name: "Japan Trip 2027", targetAmount: 350000, currentAmount: 126000, deadline: new Date(today.getFullYear() + 1, 2, 1) } }),
    prisma.goal.create({ data: { userId: user.id, name: "New Laptop", targetAmount: 150000, currentAmount: 96500 } }),
    prisma.goal.create({ data: { userId: user.id, name: "Emergency Fund", targetAmount: 300000, currentAmount: 96000, accountId: savings.id } }),
  ]);

  console.log(`Seeded user ${email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
