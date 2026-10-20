import { adminCrud } from "@/lib/admin-crud";
import { updateAnnonce, deleteAnnonce, getAnnonceById } from "@/lib/db";
export const { PUT, DELETE } = adminCrud({ kind: "annonces", update: updateAnnonce, remove: deleteAnnonce, find: getAnnonceById });
