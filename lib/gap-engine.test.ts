// ============================================================
// SkillSetu — Gap Intelligence Engine
// ============================================================
//
// Converts competency levels into numeric proficiency values,
// calculates skill gaps, and calculates overall readiness.
//
// Competency scale:
//
// EXPOSURE      = 20
// FOUNDATIONAL  = 40
// INTERMEDIATE  = 60
// ADVANCED      = 80
// EXPERT        = 100
//
// ============================================================

export type CompetencyLevel =
  | "EXPOSURE"
  | "FOUNDATIONAL"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

// ============================================================
// Competency → numeric proficiency
// ============================================================

export const COMPETENCY_VALUES: Record<
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
// Student skill input
// ============================================================

export type StudentSkillInput = {
  skillId: string;
  skillName: string;
  proficiency: number;
};

// ============================================================
// Target / opportunity skill input
// ============================================================

export type TargetSkillInput = {
  skillId: string;
  skillName: string;

  /**
   * Minimum competency level expected
   * for this opportunity.
   */
  requiredLevel: CompetencyLevel;

  /**
   * Importance of this skill in the
   * overall readiness calculation.
   */
  weight: number;

  /**
   * Whether this is a mandatory skill.
   */
  required: boolean;
};

// ============================================================
// Skill gap result
// ============================================================

export type SkillGap = {
  skillId: string;

  skillName: string;

  /**
   * Student's current proficiency.
   */
  currentProficiency: number;

  /**
   * Numeric proficiency corresponding
   * to the required competency level.
   */
  requiredProficiency: number;

  /**
   * Required competency level.
   */
  requiredLevel: CompetencyLevel;

  /**
   * Difference between required and
   * current proficiency.
   */
  gap: number;

  /**
   * Importance weight.
   */
  weight: number;

  /**
   * Whether this skill is mandatory.
   */
  required: boolean;

  /**
   * Overall status of the skill.
   */
  status:
    | "STRONG"
    | "MODERATE"
    | "CRITICAL";
};

// ============================================================
// Calculate skill gaps
// ============================================================

export function calculateSkillGaps(
  studentSkills: StudentSkillInput[],
  targetSkills: TargetSkillInput[]
): SkillGap[] {
  return targetSkills.map((target) => {
    // --------------------------------------------------------
    // Find student's corresponding skill
    // --------------------------------------------------------

    const studentSkill = studentSkills.find(
      (skill) =>
        skill.skillId === target.skillId
    );

    // If the student doesn't have the skill,
    // their proficiency is considered 0.
    const currentProficiency =
      studentSkill?.proficiency ?? 0;

    // --------------------------------------------------------
    // Convert competency level → numeric proficiency
    // --------------------------------------------------------

    const requiredProficiency =
      COMPETENCY_VALUES[target.requiredLevel];

    // --------------------------------------------------------
    // Calculate gap
    // --------------------------------------------------------

    const gap = Math.max(
      requiredProficiency -
        currentProficiency,
      0
    );

    // --------------------------------------------------------
    // Determine status
    // --------------------------------------------------------

    let status: SkillGap["status"];

    if (gap === 0) {
      status = "STRONG";
    } else if (gap <= 15) {
      status = "MODERATE";
    } else {
      status = "CRITICAL";
    }

    // --------------------------------------------------------
    // Return normalized skill gap
    // --------------------------------------------------------

    return {
      skillId: target.skillId,

      skillName: target.skillName,

      currentProficiency,

      requiredProficiency,

      requiredLevel: target.requiredLevel,

      gap,

      weight: target.weight,

      required: target.required,

      status,
    };
  });
}

// ============================================================
// Calculate overall readiness
// ============================================================
//
// Readiness is a weighted percentage of how close the
// student's proficiency is to each opportunity requirement.
//
// Example:
//
// Student = 60
// Required = 80
//
// Ratio = 60 / 80 = 0.75
// Contribution = 75%
//
// A skill cannot contribute more than 100% even if the
// student exceeds the requirement.
//
// ============================================================

export function calculateReadiness(
  gaps: SkillGap[]
): number {
  // No target skills means no meaningful readiness score.
  if (gaps.length === 0) {
    return 0;
  }

  let weightedScore = 0;

  let totalWeight = 0;

  for (const skill of gaps) {
    // --------------------------------------------------------
    // Avoid division by zero
    // --------------------------------------------------------

    if (skill.requiredProficiency <= 0) {
      continue;
    }

    // --------------------------------------------------------
    // Calculate current proficiency ratio
    // --------------------------------------------------------

    const currentRatio = Math.min(
      skill.currentProficiency /
        skill.requiredProficiency,
      1
    );

    // --------------------------------------------------------
    // Apply skill weight
    // --------------------------------------------------------

    weightedScore +=
      currentRatio * skill.weight;

    totalWeight += skill.weight;
  }

  // ----------------------------------------------------------
  // Prevent division by zero
  // ----------------------------------------------------------

  if (totalWeight === 0) {
    return 0;
  }

  // ----------------------------------------------------------
  // Convert to percentage
  // ----------------------------------------------------------

  return Math.round(
    (weightedScore / totalWeight) * 100
  );
}