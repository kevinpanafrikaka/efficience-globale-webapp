import { adminCrud } from "@/lib/admin-crud";
import { updatePartenaire, deletePartenaire, getPartenaireById } from "@/lib/db";
export const { PUT, DELETE } = adminCrud({ kind: "partenaires", update: updatePartenaire, remove: deletePartenaire, find: getPartenaireById });
