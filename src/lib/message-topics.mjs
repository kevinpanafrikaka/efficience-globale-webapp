export const MESSAGE_TOPICS = [
  { id: "projet", label: "Projets" },
  { id: "formation", label: "Formations" },
  { id: "partenariat", label: "Partenariats" },
];

export function validateMessageTopic(value) {
  if (value === undefined || value === null || value === "") return null;
  if (!MESSAGE_TOPICS.some(topic => topic.id === value)) throw new Error("Type de demande invalide.");
  return value;
}
