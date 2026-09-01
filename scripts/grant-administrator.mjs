import { PrismaClient } from '@prisma/client';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Kullanım: pnpm run admin:grant -- user@example.com');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) {
    console.error(`Kullanıcı bulunamadı: ${email}`);
    process.exitCode = 1;
  } else {
    await prisma.userRoleAssignment.upsert({
      where: { userId_roleId: { userId: user.id, roleId: 'role_administrator' } },
      create: { userId: user.id, roleId: 'role_administrator' },
      update: {},
    });
    console.log(`Administrator rolü verildi: ${user.email}`);
  }
} finally {
  await prisma.$disconnect();
}
