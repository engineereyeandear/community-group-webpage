import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const [, , email, ...groupNameParts] = process.argv;
  const groupName = groupNameParts.join(" ");

  if (!email || !groupName) {
    console.error('Usage: npx tsx prisma/promote-leader.ts <email> "<Group Name>"');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}. Sign up in the app first.`);
    process.exit(1);
  }

  const group = await prisma.group.findFirst({ where: { name: groupName } });
  if (!group) {
    console.error(`No group found named "${groupName}".`);
    process.exit(1);
  }

  await prisma.membership.upsert({
    where: { userId_groupId: { userId: user.id, groupId: group.id } },
    update: { role: "LEADER", status: "ACTIVE" },
    create: { userId: user.id, groupId: group.id, role: "LEADER", status: "ACTIVE" },
  });

  console.log(`${user.displayName} (${email}) is now the leader of "${group.name}".`);
}

main().finally(() => prisma.$disconnect());
