import { round2 } from "@/lib/utils";

export const CRITERIA = [
  {
    key: "technical",
    label: "Technical Complexity",
    weight: 0.2,
    description: "Engineering complexity, architecture, and implementation depth.",
  },
  {
    key: "innovation",
    label: "Innovation & Novelty",
    weight: 0.2,
    description: "Originality, creativity, and uniqueness.",
  },
  {
    key: "impact",
    label: "Problem Impact",
    weight: 0.15,
    description: "Importance of the problem, potential impact, and value created.",
  },
  {
    key: "solution",
    label: "Solution Quality",
    weight: 0.15,
    description: "UX/UI quality, reliability, completeness, and execution.",
  },
  {
    key: "sponsor",
    label: "Sponsor / Industry Relevance",
    weight: 0.1,
    description: "Real-world applicability, sponsor alignment, and industry value.",
  },
  {
    key: "business",
    label: "Business Viability",
    weight: 0.1,
    description: "Market potential, sustainability, and scalability.",
  },
  {
    key: "presentation",
    label: "Presentation & Demo",
    weight: 0.1,
    description: "Communication, storytelling, and demonstration quality.",
  },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export type CriterionScores = Record<CriterionKey, number | null>;

export const RECOMMENDATIONS = [
  { value: "STRONGLY_RECOMMEND", label: "Strongly Recommend" },
  { value: "RECOMMEND", label: "Recommend" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "DO_NOT_RECOMMEND", label: "Do Not Recommend" },
] as const;

export type RecommendationValue = (typeof RECOMMENDATIONS)[number]["value"];

export function weightedScore(scores: CriterionScores) {
  if (CRITERIA.some((criterion) => scores[criterion.key] == null)) return null;
  const total = CRITERIA.reduce((sum, criterion) => sum + (scores[criterion.key] as number) * criterion.weight, 0);
  return round2(total * 10);
}

export function average(values: number[]) {
  if (values.length === 0) return null;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function recommendationLabel(value: string | null | undefined) {
  return RECOMMENDATIONS.find((item) => item.value === value)?.label ?? "Not set";
}
