import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminAuthenticated } from "@/lib/adminAuth";

// Each data-bearing page checks its session before reading private data.
// The parent layout then renders the login form for an anonymous visitor.
export async function adminPageAllowed() {
  const { env } = await getCloudflareContext({ async: true });
  return isAdminAuthenticated(env);
}
