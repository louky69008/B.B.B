export const RELATIONSHIP_INTENTS = {
  serious: "Sérieuse",
  friends: "Amicale",
  casual: "Sans prise de tête",
  other: "Autre",
} as const;

export function relationshipIntentLabel(value: string | null) {
  if (!value || !Object.hasOwn(RELATIONSHIP_INTENTS, value)) return null;
  return RELATIONSHIP_INTENTS[value as keyof typeof RELATIONSHIP_INTENTS];
}
