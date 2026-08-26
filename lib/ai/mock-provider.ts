import type {
  AIProvider,
  ExtractedOpportunity,
} from "./provider";

export class MockAIProvider implements AIProvider {
  async extractOpportunity(
    jobDescription: string
  ): Promise<ExtractedOpportunity> {
    const text = jobDescription.toLowerCase();

    const skills = [];

    if (text.includes("node")) {
      skills.push({
        name: "Node.js",
        category: "Backend",
        minimumProficiency: 80,
        weight: 1,
        required: true,
      });
    }

    if (text.includes("express")) {
      skills.push({
        name: "Express",
        category: "Backend",
        minimumProficiency: 70,
        weight: 0.9,
        required: true,
      });
    }

    if (
      text.includes("rest") ||
      text.includes("api")
    ) {
      skills.push({
        name: "REST APIs",
        category: "Backend",
        minimumProficiency: 75,
        weight: 1,
        required: true,
      });
    }

    if (
      text.includes("postgres") ||
      text.includes("postgresql")
    ) {
      skills.push({
        name: "PostgreSQL",
        category: "Database",
        minimumProficiency: 70,
        weight: 0.9,
        required: true,
      });
    }

    if (text.includes("docker")) {
      skills.push({
        name: "Docker",
        category: "DevOps",
        minimumProficiency: 50,
        weight: 0.6,
        required: false,
      });
    }

    if (text.includes("redis")) {
      skills.push({
        name: "Redis",
        category: "Backend",
        minimumProficiency: 40,
        weight: 0.4,
        required: false,
      });
    }

    if (text.includes("git")) {
      skills.push({
        name: "Git",
        category: "Developer Tools",
        minimumProficiency: 60,
        weight: 0.5,
        required: false,
      });
    }

    return {
      title: "Backend Engineer Intern",
      company: "Unknown",
      description: jobDescription,
      location: null,
      type: "INTERNSHIP",
      skills,
    };
  }
}