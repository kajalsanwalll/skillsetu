export type CompetencyLevel =
  | "EXPOSURE"
  | "FOUNDATIONAL"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export type StudentSkillInput = {
  skillId: string;
  competencyLevel: CompetencyLevel | null;
};

export type OpportunitySkillInput = {
  skillId: string;
  required: boolean;
  weight: number;
  requiredLevel: CompetencyLevel;
};

export type SkillGapResult = {
  skillId: string;
  studentLevel: CompetencyLevel | null;
  requiredLevel: CompetencyLevel;
  gap: number;
  weight: number;
  required: boolean;
  status: "STRONG" | "MODERATE" | "GAP";
};

export type GapAnalysisResult = {
  readinessScore: number;
  skills: SkillGapResult[];
  strongSkills: SkillGapResult[];
  moderateSkills: SkillGapResult[];
  gapSkills: SkillGapResult[];
};

const LEVEL_SCORE: Record<CompetencyLevel, number> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 100,
};

function getLevelScore(
  level: CompetencyLevel | null
): number {
  if (!level) {
    return 0;
  }

  return LEVEL_SCORE[level];
}

export function calculateMatchScore(
  studentSkills: StudentSkillInput[],
  opportunitySkills: OpportunitySkillInput[]
): number {
  if (opportunitySkills.length === 0) {
    return 0;
  }

  const studentSkillMap = new Map(
    studentSkills.map((skill) => [
      skill.skillId,
      skill.competencyLevel,
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

    const studentLevel =
      studentSkillMap.get(requirement.skillId) ?? null;

    const studentScore =
      getLevelScore(studentLevel);

    const requiredScore =
      getLevelScore(requirement.requiredLevel);

    const ratio =
      requiredScore > 0
        ? Math.min(
            studentScore / requiredScore,
            1
          )
        : 1;

    achievedWeight += ratio * weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(
    (achievedWeight / totalWeight) * 100
  );
}

export function calculateGapAnalysis(
  studentSkills: StudentSkillInput[],
  opportunitySkills: OpportunitySkillInput[]
): GapAnalysisResult {
  const studentSkillMap = new Map(
    studentSkills.map((skill) => [
      skill.skillId,
      skill.competencyLevel,
    ])
  );

  let weightedScore = 0;
  let totalWeight = 0;

  const results: SkillGapResult[] = [];

  for (const requirement of opportunitySkills) {
    const studentLevel =
      studentSkillMap.get(requirement.skillId) ?? null;

    const studentScore =
      getLevelScore(studentLevel);

    const requiredScore =
      getLevelScore(requirement.requiredLevel);

    const gap = Math.max(
      requiredScore - studentScore,
      0
    );

    const requirementScore =
      requiredScore > 0
        ? Math.min(
            (studentScore / requiredScore) * 100,
            100
          )
        : 100;

    const weight =
      requirement.weight > 0
        ? requirement.weight
        : 1;

    weightedScore +=
      requirementScore * weight;

    totalWeight += weight;

    let status: SkillGapResult["status"];

    if (studentScore >= requiredScore) {
      status = "STRONG";
    } else if (
      studentScore >= requiredScore * 0.7
    ) {
      status = "MODERATE";
    } else {
      status = "GAP";
    }

    results.push({
      skillId: requirement.skillId,
      studentLevel,
      requiredLevel: requirement.requiredLevel,
      gap,
      weight,
      required: requirement.required,
      status,
    });
  }

  const readinessScore =
    totalWeight > 0
      ? Math.round(
          weightedScore / totalWeight
        )
      : 0;

  return {
    readinessScore,
    skills: results,
    strongSkills: results.filter(
      (skill) => skill.status === "STRONG"
    ),
    moderateSkills: results.filter(
      (skill) => skill.status === "MODERATE"
    ),
    gapSkills: results.filter(
      (skill) => skill.status === "GAP"
    ),
  };
}