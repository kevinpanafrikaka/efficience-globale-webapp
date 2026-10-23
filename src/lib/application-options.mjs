export const APPLICATION_STATUSES = [
 { value: "nouvelle", label: "Nouvelle" }, { value: "en_cours", label: "À étudier" },
 { value: "retenue", label: "Retenue" }, { value: "non_retenue", label: "Non retenue" },
];
export const applicationEmailLabel = value => ({sent:"Email transmis",sending:"Envoi en cours",pending:"Email en attente",failed:"Envoi non confirmé"})[value] || "Envoi non confirmé";
