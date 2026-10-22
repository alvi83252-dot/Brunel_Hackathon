export const AWARD_DEFINITIONS = [
  {
    type: "OVERALL_WINNER",
    title: "Overall Winner",
    rule: "Highest average weighted score. Eligible teams have a final submission and at least one submitted judge score.",
  },
  {
    type: "RUNNER_UP",
    title: "Runner Up",
    rule: "Second highest average weighted score among eligible teams.",
  },
  {
    type: "SECOND_RUNNER_UP",
    title: "Second Runner Up",
    rule: "Third highest average weighted score among eligible teams.",
  },
  {
    type: "BEST_TECHNICAL",
    title: "Best Technical Solution",
    rule: "Highest average Technical Complexity score among eligible teams.",
    criterion: "technical",
  },
  {
    type: "MOST_INNOVATIVE",
    title: "Most Innovative Project",
    rule: "Highest average Innovation & Novelty score among eligible teams.",
    criterion: "innovation",
  },
  {
    type: "BEST_AI",
    title: "Best AI Project",
    rule: "Highest average weighted score in AI & Machine Learning.",
    trackSlug: "ai",
  },
  {
    type: "BEST_SUSTAINABILITY",
    title: "Best Sustainability Project",
    rule: "Highest average weighted score in Sustainability & Green Technology.",
    trackSlug: "sustainability",
  },
  {
    type: "BEST_HEALTH",
    title: "Best Health Solution",
    rule: "Highest average weighted score in Health & Wellbeing.",
    trackSlug: "health",
  },
  {
    type: "BEST_UI_UX",
    title: "Best UI/UX",
    rule: "Highest average Solution Quality score among eligible teams.",
    criterion: "solution",
  },
  {
    type: "HIGHEST_BUSINESS",
    title: "Highest Business Potential",
    rule: "Highest average Business Viability score among eligible teams.",
    criterion: "business",
  },
  {
    type: "SPONSORS_CHOICE",
    title: "Sponsor's Choice Award",
    rule: "Highest average Sponsor / Industry Relevance score among eligible teams.",
    criterion: "sponsor",
  },
] as const;

export type AwardTypeName = (typeof AWARD_DEFINITIONS)[number]["type"];

export const TRACKS = [
  {
    slug: "ai",
    name: "AI & Machine Learning",
    summary: "Intelligent systems, applied models, and responsible uses of machine learning.",
  },
  {
    slug: "sustainability",
    name: "Sustainability & Green Technology",
    summary: "Climate, energy, waste, and tools that help the university operate more lightly.",
  },
  {
    slug: "health",
    name: "Health & Wellbeing",
    summary: "Student health, care access, and products that support everyday wellbeing.",
  },
  {
    slug: "education",
    name: "Education Technology",
    summary: "Learning, teaching, and assessment tools built for real university life.",
  },
  {
    slug: "campus",
    name: "Smart Campus Solutions",
    summary: "Wayfinding, estates, safety, and services that make campus easier to use.",
  },
  {
    slug: "open",
    name: "Open Innovation",
    summary: "A brief of your own, provided the problem and the beneficiary are specific.",
  },
] as const;
