import { adminCrud } from "@/lib/admin-crud";
import { updateProjet, deleteProjet, getProjetById } from "@/lib/db";
export const { PUT, DELETE } = adminCrud({ kind: "projets", update: updateProjet, remove: deleteProjet, find: getProjetById });
