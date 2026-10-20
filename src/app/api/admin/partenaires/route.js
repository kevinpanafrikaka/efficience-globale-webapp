import { adminCrud } from "@/lib/admin-crud";
import { createPartenaire } from "@/lib/db";
export const { POST } = adminCrud({ kind: "partenaires", create: createPartenaire });
