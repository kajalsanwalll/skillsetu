export type StudentSkillInput = {
  skillId: string;
  skillName: string;
  proficiency: number;
};

export type TargetSkillInput = {
  skillId: string;
  skillName: string;
  minimumProficiency: number;
  weight: number;
  required: boolean;
};

export type SkillGap = {
  skillId: string;
  skillName: string;
  currentProficiency: number;
  requiredProficiency: number;
  gap: number;
  weight: number;
  required: boolean;
  status: "STRONG" | "MODERATE" | "CRITICAL";
};

export function calculateSkillGaps(
  studentSkills: StudentSkillInput[],
  targetSkills: TargetSkillInput[]
): SkillGap[] {
  return targetSkills.map((target) => {
    const studentSkill = studentSkills.find(
      (skill) => skill.skillId === target.skillId
    );

    const currentProficiency =
      studentSkill?.proficiency ?? 0;

    const gap = Math.max(
      target.minimumProficiency - currentProficiency,
      0
    );

    let status: SkillGap["status"];

    if (gap === 0) {
      status = "STRONG";
    } else if (gap <= 15) {
      status = "MODERATE";
    } else {
      status = "CRITICAL";
    }

    return {
      skillId: target.skillId,
      skillName: target.skillName,
      currentProficiency,
      requiredProficiency: target.minimumProficiency,
      gap,
      weight: target.weight,
      required: target.required,
      status,
    };
  });
}

export function calculateReadiness(
  gaps: SkillGap[]
): number {
  if (gaps.length === 0) {
    return 0;
  }

  let weightedScore = 0;
  let totalWeight = 0;

  for (const skill of gaps) {
    const currentRatio =
      Math.min(
        skill.currentProficiency /
          skill.requiredProficiency,
        1
      );

    weightedScore +=
      currentRatio * skill.weight;

    totalWeight += skill.weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(
    (weightedScore / totalWeight) * 100
  );
}