import { adminCrud } from "@/lib/admin-crud";
import { createProjet } from "@/lib/db";
export const { POST } = adminCrud({ kind: "projets", create: createProjet });
