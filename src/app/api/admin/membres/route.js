import { adminCrud } from "@/lib/admin-crud";
import { createMembre } from "@/lib/db";
export const { POST } = adminCrud({ kind: "membres", create: createMembre });
