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
        importance: "CORE",
        required: true,
      });
    }

    if (text.includes("express")) {
      skills.push({
        name: "Express",
        category: "Backend",
        importance: "CORE",
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
        importance: "CORE",
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
        importance: "CORE",
        required: true,
      });
    }

    if (text.includes("docker")) {
      skills.push({
        name: "Docker",
        category: "DevOps",
        importance: "USEFUL",
        required: false,
      });
    }

    if (text.includes("redis")) {
      skills.push({
        name: "Redis",
        category: "Backend",
        importance: "USEFUL",
        required: false,
      });
    }

    if (text.includes("git")) {
      skills.push({
        name: "Git",
        category: "Developer Tools",
        importance: "USEFUL",
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