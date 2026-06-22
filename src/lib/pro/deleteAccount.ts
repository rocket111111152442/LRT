import { prisma } from "@/lib/prisma";

/**
 * Supprime un compte pro et toutes les données qui lui sont rattachées.
 *
 * Sur Postgres, les relations sont en cascade ; sur Firestore, il faut purger
 * chaque collection manuellement. On supprime donc explicitement chaque jeu de
 * données scoppé par proAccountId, puis le compte lui-même (la suppression du
 * compte retire aussi ses utilisateurs et rendez-vous d'installation).
 */
export async function deleteProAccountAndData(proAccountId: string) {
  const payroll = await prisma.accountingPayrollEntry.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    payroll.map((row) =>
      prisma.accountingPayrollEntry.delete({ where: { id: row.id } }),
    ),
  );

  const employees = await prisma.accountingEmployee.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    employees.map((row) =>
      prisma.accountingEmployee.delete({ where: { id: row.id } }),
    ),
  );

  const sales = await prisma.accountingSale.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    sales.map((row) => prisma.accountingSale.delete({ where: { id: row.id } })),
  );

  const expenses = await prisma.accountingExpense.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    expenses.map((row) =>
      prisma.accountingExpense.delete({ where: { id: row.id } }),
    ),
  );

  const settings = await prisma.accountingSettings.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    settings.map((row) =>
      prisma.accountingSettings.delete({ where: { id: row.id } }),
    ),
  );

  const inventory = await prisma.inventoryItem.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    inventory.map((row) =>
      prisma.inventoryItem.delete({ where: { id: row.id } }),
    ),
  );

  const repairs = await prisma.repair.findMany({
    where: { proAccountId },
    select: { id: true },
  });
  await Promise.all(
    repairs.map((row) => prisma.repair.delete({ where: { id: row.id } })),
  );

  await prisma.proAccount.delete({ where: { id: proAccountId } });
}
