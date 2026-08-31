/**
 * One-time backfill: derive competencyLevel from the legacy proficiency
 * float for any StudentSkill row that predates the CompetencyLevel enum.
 *
 * Run once with:  npx tsx scripts/backfill-competency-level.ts
 * (or ts-node / node --loader ts-node/esm, whatever your project uses)
 *
 * Safe to re-run: it only touches rows where competencyLevel is null.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function levelFromProficiency(
  proficiency: number
): "EXPOSURE" | "FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" {
  if (proficiency >= 90) return "EXPERT";
  if (proficiency >= 75) return "ADVANCED";
  if (proficiency >= 50) return "INTERMEDIATE";
  if (proficiency >= 25) return "FOUNDATIONAL";
  return "EXPOSURE";
}

async function main() {
  const rows = await prisma.studentSkill.findMany({
    where: { competencyLevel: null },
    select: { id: true, proficiency: true },
  });

  console.log(`Found ${rows.length} skill(s) with no competency level.`);

  for (const row of rows) {
    const level = levelFromProficiency(row.proficiency);

    await prisma.studentSkill.update({
      where: { id: row.id },
      data: { competencyLevel: level },
    });

    console.log(`  ${row.id}: proficiency ${row.proficiency} -> ${level}`);
  }

  console.log("Backfill complete.");
}

main()
  .catch((error) => {
    console.error("BACKFILL_ERROR:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });