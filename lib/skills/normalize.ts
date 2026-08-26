const SKILL_ALIASES: Record<string, string> = {
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  "postgre sql": "PostgreSQL",

  js: "JavaScript",
  javascript: "JavaScript",

  ts: "TypeScript",
  typescript: "TypeScript",

  node: "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",

  reactjs: "React",
  "react.js": "React",

  mongodb: "MongoDB",
  mongo: "MongoDB",

  "rest api": "REST APIs",
  "rest apis": "REST APIs",

  "system design": "System Design",
};

export function normalizeSkillName(
  name: string
) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return (
    SKILL_ALIASES[normalized] ??
    name.trim()
  );
}