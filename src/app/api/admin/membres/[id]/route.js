import { adminCrud } from "@/lib/admin-crud";
import { updateMembre, deleteMembre, getMembreById } from "@/lib/db";
export const { PUT, DELETE } = adminCrud({ kind: "membres", update: updateMembre, remove: deleteMembre, find: getMembreById });
