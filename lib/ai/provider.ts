export type ExtractedSkill = {
  name: string;
  category: string;
  minimumProficiency: number;
  weight: number;
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