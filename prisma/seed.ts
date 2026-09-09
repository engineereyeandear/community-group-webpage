import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const groups = [
    {
      name: "Grace Community Church",
      description:
        "A welcoming church community meeting weekly for worship and discussion.",
    },
    {
      name: "Riverside Fellowship",
      description:
        "A small group focused on Bible study and community outreach.",
    },
    {
      name: "St. Andrew's Youth Group",
      description:
        "A group for younger members to explore faith and life topics together.",
    },
  ];

  for (const g of groups) {
    const existing = await prisma.group.findFirst({ where: { name: g.name } });
    if (!existing) {
      await prisma.group.create({ data: g });
      console.log(`Created group: ${g.name}`);
    } else {
      console.log(`Group already exists: ${g.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
