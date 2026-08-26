type StudentSkill = {
  skillId: string;
  proficiency: number;
};

type OpportunitySkill = {
  skillId: string;
  required: boolean;
  weight: number;
  minimumProficiency: number;
};

export function calculateMatchScore(
  studentSkills: StudentSkill[],
  opportunitySkills: OpportunitySkill[]
) {
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

    totalWeight += weight;

    const studentProficiency =
      studentSkillMap.get(requirement.skillId) ?? 0;

    const proficiencyRatio = Math.min(
      studentProficiency /
        Math.max(requirement.minimumProficiency, 1),
      1
    );

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