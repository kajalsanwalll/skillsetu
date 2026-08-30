export type ExtractedSkill = {
  name: string;
  category: string;

  /**
   * How important this skill is to the opportunity.
   *
   * CORE    → essential for the role
   * IMPORTANT → strongly expected
   * USEFUL  → nice to have
   */
  importance: "CORE" | "IMPORTANT" | "USEFUL";

  /**
   * Whether the skill is required to perform the role.
   */
  required: boolean;
};

export type ExtractedOpportunity = {
  title: string;

  company: string;

  description: string;

  location: string | null;

  type:
    | "INTERNSHIP"
    | "JOB"
    | "PROJECT"
    | "MENTORSHIP"
    | "FDP"
    | "RESEARCH"
    | "CONSULTANCY"
    | "INDUSTRIAL_TRAINING"
    | "GUEST_LECTURE";

  skills: ExtractedSkill[];
};

export interface AIProvider {
  extractOpportunity(
    jobDescription: string
  ): Promise<ExtractedOpportunity>;
}