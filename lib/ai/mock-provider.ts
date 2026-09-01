

import type { ExtractedOpportunity, ExtractedSkill } from "./provider";

export class MockAIProvider {
  async extractOpportunity(
    jobDescription: string
  ): Promise<ExtractedOpportunity> {
    const description =
      jobDescription.trim();

    const skills: ExtractedSkill[] = [
      {
        name: "Node.js",
        category: "Backend",
        importance: "CORE",
        required: true,
        requiredLevel: "ADVANCED",
        weight: 1.0,
      },
      {
        name: "Express",
        category: "Backend",
        importance: "CORE",
        required: true,
        requiredLevel: "ADVANCED",
        weight: 0.9,
      },
      {
        name: "REST APIs",
        category: "Backend",
        importance: "CORE",
        required: true,
        requiredLevel: "ADVANCED",
        weight: 1.0,
      },
      {
        name: "PostgreSQL",
        category: "Database",
        importance: "IMPORTANT",
        required: true,
        requiredLevel: "INTERMEDIATE",
        weight: 0.9,
      },
      {
        name: "Docker",
        category: "DevOps",
        importance: "USEFUL",
        required: false,
        requiredLevel: "FOUNDATIONAL",
        weight: 0.6,
      },
      {
        name: "Redis",
        category: "Backend",
        importance: "USEFUL",
        required: false,
        requiredLevel: "FOUNDATIONAL",
        weight: 0.4,
      },
    ];

    return {
      title: "Backend Engineer Intern",
      company: "TechNova",
      description:
        description ||
        "Backend engineering internship focused on APIs, databases, caching and scalable services.",
      location: "Remote",
      type: "INTERNSHIP",
      skills,
    };
  }
}