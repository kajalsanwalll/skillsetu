// ============================================================
// SKILLSETU — GAP ENGINE
// ============================================================
//
// Converts a student's current skill proficiency into:
// 1. Skill gaps
// 2. Skill strength status
// 3. Overall readiness score
//
// Competency levels used by SkillSetu:
//
// EXPOSURE       = 20
// FOUNDATIONAL   = 40
// INTERMEDIATE   = 60
// ADVANCED       = 80
// EXPERT         = 100
//
// ============================================================


// ============================================================
// COMPETENCY LEVEL
// ============================================================

export type CompetencyLevel =
  | "EXPOSURE"
  | "FOUNDATIONAL"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";


// ============================================================
// STUDENT SKILL INPUT
// ============================================================

export type StudentSkillInput = {
  skillId: string;
  skillName: string;
  proficiency: number;
};


// ============================================================
// TARGET / OPPORTUNITY SKILL INPUT
// ============================================================
//
// This matches the NEW SkillSetu opportunity model.
//
// We no longer store minimumProficiency directly.
// Instead, opportunities specify requiredLevel.
//
// Example:
//
// requiredLevel: "ADVANCED"
//        ↓
// requiredProficiency: 80
//
// ============================================================

export type TargetSkillInput = {
  skillId: string;
  skillName: string;
  requiredLevel: CompetencyLevel;
  weight: number;
  required: boolean;
};


// ============================================================
// GAP RESULT
// ============================================================

export type SkillGap = {
  skillId: string;
  skillName: string;

  // Student's current proficiency
  currentProficiency: number;

  // Numeric proficiency required by the opportunity
  requiredProficiency: number;

  // Competency level required by the opportunity
  requiredLevel: CompetencyLevel;

  // Difference between required and current proficiency
  gap: number;

  // Importance weight of the skill
  weight: number;

  // Whether the skill is mandatory
  required: boolean;

  // Overall skill status
  status: "STRONG" | "MODERATE" | "CRITICAL";
};


// ============================================================
// COMPETENCY → NUMERIC PROFICIENCY
// ============================================================

export const competencyToProficiency: Record<
  CompetencyLevel,
  number
> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 100,
};


// ============================================================
// NUMERIC PROFICIENCY → COMPETENCY
// ============================================================
//
// Useful when displaying a student's proficiency level.
//
// Example:
//
// 75 → INTERMEDIATE
// 85 → ADVANCED
//
// ============================================================

export function proficiencyToCompetency(
  proficiency: number
): CompetencyLevel {
  if (proficiency >= 90) {
    return "EXPERT";
  }

  if (proficiency >= 70) {
    return "ADVANCED";
  }

  if (proficiency >= 50) {
    return "INTERMEDIATE";
  }

  if (proficiency >= 30) {
    return "FOUNDATIONAL";
  }

  return "EXPOSURE";
}


// ============================================================
// CALCULATE SKILL GAPS
// ============================================================

export function calculateSkillGaps(
  studentSkills: StudentSkillInput[],
  targetSkills: TargetSkillInput[]
): SkillGap[] {
  return targetSkills.map((target) => {
    // Find the student's version of this skill.
    const studentSkill = studentSkills.find(
      (skill) => skill.skillId === target.skillId
    );

    // If the student doesn't have the skill,
    // their current proficiency is treated as 0.
    const currentProficiency = Math.max(
      0,
      Math.min(studentSkill?.proficiency ?? 0, 100)
    );

    // Convert the opportunity's competency level
    // into the numeric proficiency used by the engine.
    const requiredProficiency =
      competencyToProficiency[target.requiredLevel];

    // Calculate how much the student is missing.
    const gap = Math.max(
      requiredProficiency - currentProficiency,
      0
    );

    // Determine skill status.
    //
    // STRONG:
    // Student already meets/exceeds requirement.
    //
    // MODERATE:
    // Student is within 15 proficiency points.
    //
    // CRITICAL:
    // Student is more than 15 points below requirement.
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

      requiredProficiency,

      requiredLevel: target.requiredLevel,

      gap,

      weight: Math.max(0, target.weight),

      required: target.required,

      status,
    };
  });
}


// ============================================================
// CALCULATE READINESS
// ============================================================
//
// Readiness is calculated using a weighted skill ratio.
//
// Example:
//
// Student proficiency = 60
// Required proficiency = 80
//
// Ratio = 60 / 80 = 0.75
//
// If weight = 1:
//
// Contribution = 0.75 × 1
//
// The final weighted average is converted to 0–100.
//
// A student cannot receive more than 100% credit for
// exceeding a skill requirement.
//
// ============================================================

export function calculateReadiness(
  gaps: SkillGap[]
): number {
  if (gaps.length === 0) {
    return 0;
  }

  let weightedScore = 0;
  let totalWeight = 0;

  for (const skill of gaps) {
    // Prevent division by zero.
    if (skill.requiredProficiency <= 0) {
      continue;
    }

    const currentRatio = Math.min(
      skill.currentProficiency /
        skill.requiredProficiency,
      1
    );

    const weight = Math.max(
      0,
      skill.weight
    );

    weightedScore +=
      currentRatio * weight;

    totalWeight += weight;
  }

  // Avoid division by zero if every skill has
  // a zero weight.
  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(
    (weightedScore / totalWeight) * 100
  );
}


// ============================================================
// OPTIONAL: CALCULATE GAP SUMMARY
// ============================================================
//
// Gives the frontend a simple summary without having to
// repeatedly filter the gaps array.
//
// ============================================================

export function calculateGapSummary(
  gaps: SkillGap[]
) {
  const strong = gaps.filter(
    (gap) => gap.status === "STRONG"
  );

  const moderate = gaps.filter(
    (gap) => gap.status === "MODERATE"
  );

  const critical = gaps.filter(
    (gap) => gap.status === "CRITICAL"
  );

  const required = gaps.filter(
    (gap) => gap.required
  );

  const criticalRequired = critical.filter(
    (gap) => gap.required
  );

  return {
    totalSkills: gaps.length,

    strong: strong.length,

    moderate: moderate.length,

    critical: critical.length,

    requiredSkills: required.length,

    criticalRequiredSkills:
      criticalRequired.length,
  };
}