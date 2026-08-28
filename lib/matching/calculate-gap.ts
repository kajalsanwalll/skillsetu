export type StudentSkillInput = {
  skillId: string;
  proficiency: number;
};

export type OpportunitySkillInput = {
  skillId: string;
  required: boolean;
  weight: number;
  minimumProficiency: number;
};

export type SkillGapResult = {
  skillId: string;
  studentProficiency: number;
  requiredProficiency: number;
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
      opportunitySkill.minimumProficiency;

    const gap = Math.max(
      0,
      requiredProficiency - studentProficiency
    );

    /*
     * How well the student satisfies this requirement.
     *
     * Example:
     * student = 80
     * required = 70
     *
     * requirementScore = 100
     *
     * If student = 35 and required = 70:
     *
     * requirementScore = 50
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

    weightedScore +=
      requirementScore * opportunitySkill.weight;

    totalWeight += opportunitySkill.weight;

    let status: SkillGapResult["status"];

    if (
      studentProficiency >=
      requiredProficiency
    ) {
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
      weight: opportunitySkill.weight,
      required: opportunitySkill.required,
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