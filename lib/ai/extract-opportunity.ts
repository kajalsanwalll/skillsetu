import OpenAI from "openai";
import {
  extractedOpportunitySchema,
} from "./schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractOpportunity(
  jobDescription: string
) {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content: `
You are SkillSetu's industry skill extraction engine.

Your job is to convert a job description into structured
skill requirements.

Rules:

1. Extract only skills that are relevant to the role.
2. Normalize skill names.
3. Do not invent technologies that are not reasonably implied.
4. minimumProficiency is a 0-100 estimate.
5. weight represents importance from 0-1.
6. required=true means the skill is important for the role.
7. required=false means it is useful but not essential.
8. Return ONLY valid JSON.
        `,
      },
      {
        role: "user",
        content: jobDescription,
      },
    ],
  });

  const raw = response.output_text;

  const parsed = JSON.parse(raw);

  return extractedOpportunitySchema.parse(parsed);
}