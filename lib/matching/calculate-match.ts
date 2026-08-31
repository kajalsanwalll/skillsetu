type StudentSkill = {
  skillId: string;
  proficiency: number;
};

type OpportunitySkill = {
  skillId: string;
  required: boolean;
  weight: number;
  requiredLevel:
    | "EXPOSURE"
    | "FOUNDATIONAL"
    | "INTERMEDIATE"
    | "ADVANCED"
    | "EXPERT";
};

/**
 * Maps competency levels to the proficiency scale used
 * by StudentSkill.proficiency (0–100).
 */
const COMPETENCY_THRESHOLDS: Record<
  OpportunitySkill["requiredLevel"],
  number
> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 95,
};

export function calculateMatchScore(
  studentSkills: StudentSkill[],
  opportunitySkills: OpportunitySkill[]
): number {
  if (opportunitySkills.length === 0) {
    return 0;
  }

  const studentSkillMap = new Map(
    studentSkills.map((skill) => [
      skill.skillId,
      skill.proficiency,
    ])
  );

  let totalWeight = 0;
  let achievedWeight = 0;

  for (const requirement of opportunitySkills) {
    const weight =
      requirement.weight > 0
        ? requirement.weight
        : 1;

    const requiredProficiency =
      COMPETENCY_THRESHOLDS[
        requirement.requiredLevel
      ];

    const studentProficiency =
      studentSkillMap.get(requirement.skillId) ?? 0;

    /**
     * How much of the required proficiency
     * the student currently has.
     *
     * Example:
     * Required = ADVANCED (80)
     * Student = 60
     * Ratio = 60 / 80 = 0.75
     */
    const proficiencyRatio = Math.min(
      studentProficiency /
        Math.max(requiredProficiency, 1),
      1
    );

    totalWeight += weight;

    achievedWeight +=
      proficiencyRatio * weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(
    (achievedWeight / totalWeight) * 100
  );
}