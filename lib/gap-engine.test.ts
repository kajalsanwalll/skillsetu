import {
  calculateSkillGaps,
  calculateReadiness,
} from "./gap-engine";

const studentSkills = [
  {
    skillId: "node",
    skillName: "Node.js",
    proficiency: 85,
  },
  {
    skillId: "express",
    skillName: "Express",
    proficiency: 78,
  },
  {
    skillId: "postgres",
    skillName: "PostgreSQL",
    proficiency: 55,
  },
  {
    skillId: "docker",
    skillName: "Docker",
    proficiency: 25,
  },
];

const targetSkills = [
  {
    skillId: "node",
    skillName: "Node.js",
    minimumProficiency: 80,
    weight: 1,
    required: true,
  },
  {
    skillId: "express",
    skillName: "Express",
    minimumProficiency: 70,
    weight: 1,
    required: true,
  },
  {
    skillId: "postgres",
    skillName: "PostgreSQL",
    minimumProficiency: 70,
    weight: 1,
    required: true,
  },
  {
    skillId: "docker",
    skillName: "Docker",
    minimumProficiency: 50,
    weight: 1,
    required: false,
  },
];

const gaps = calculateSkillGaps(
  studentSkills,
  targetSkills
);

console.log(gaps);

const readiness = calculateReadiness(gaps);

console.log("Readiness:", readiness);