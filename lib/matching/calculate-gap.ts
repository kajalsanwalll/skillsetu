export type StudentSkillInput = {
  skillId: string;
  proficiency: number;
};

export type OpportunitySkillInput = {
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

export type SkillGapResult = {
  skillId: string;
  studentProficiency: number;
  requiredProficiency: number;
  gap: number;
  weight: number;
  required: boolean;
  requiredLevel: OpportunitySkillInput["requiredLevel"];
  status: "STRONG" | "MODERATE" | "GAP";
};

export type GapAnalysisResult = {
  readinessScore: number;
  skills: SkillGapResult[];
  strongSkills: SkillGapResult[];
  moderateSkills: SkillGapResult[];
  gapSkills: SkillGapResult[];
};

/**
 * Converts the competency level stored on an opportunity
 * into the 0–100 proficiency scale used by StudentSkill.
 */
const COMPETENCY_THRESHOLDS: Record<
  OpportunitySkillInput["requiredLevel"],
  number
> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 95,
};

export function calculateGapAnalysis(
  studentSkills: StudentSkillInput[],
  opportunitySkills: OpportunitySkillInput[]
): GapAnalysisResult {
  const studentSkillMap = new Map(
    studentSkills.map((skill) => [
      skill.skillId,
      skill.proficiency,
    ])
  );

  let weightedScore = 0;
  let totalWeight = 0;

  const results: SkillGapResult[] = [];

  for (const opportunitySkill of opportunitySkills) {
    const studentProficiency =
      studentSkillMap.get(opportunitySkill.skillId) ?? 0;

    const requiredProficiency =
      COMPETENCY_THRESHOLDS[
        opportunitySkill.requiredLevel
      ];

    const gap = Math.max(
      0,
      requiredProficiency - studentProficiency
    );

    /**
     * How well the student satisfies this requirement.
     *
     * Example:
     *
     * required = ADVANCED = 80
     * student = 60
     *
     * requirementScore = 75
     *
     * If student = 80:
     * requirementScore = 100
     */
    const requirementScore =
      requiredProficiency > 0
        ? Math.min(
            100,
            (studentProficiency /
              requiredProficiency) *
              100
          )
        : 100;

    const weight =
      opportunitySkill.weight > 0
        ? opportunitySkill.weight
        : 1;

    weightedScore +=
      requirementScore * weight;

    totalWeight += weight;

    let status: SkillGapResult["status"];

    if (studentProficiency >= requiredProficiency) {
      status = "STRONG";
    } else if (
      studentProficiency >=
      requiredProficiency * 0.7
    ) {
      status = "MODERATE";
    } else {
      status = "GAP";
    }

    results.push({
      skillId: opportunitySkill.skillId,
      studentProficiency,
      requiredProficiency,
      gap,
      weight,
      required: opportunitySkill.required,
      requiredLevel: opportunitySkill.requiredLevel,
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