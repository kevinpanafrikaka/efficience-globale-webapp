import { adminCrud } from "@/lib/admin-crud";
import { createAnnonce } from "@/lib/db";
export const { POST } = adminCrud({ kind: "annonces", create: createAnnonce });
