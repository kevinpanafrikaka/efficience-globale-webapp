import { adminPageAllowed } from "@/lib/admin-page";
import { getAllMessages } from "@/lib/db";
import AdminMessages from "@/components/admin/AdminMessages";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  if (!(await adminPageAllowed())) return null;
  try {
    return <AdminMessages messages={await getAllMessages()} />;
  } catch {
    return <p role="alert">Les messages ne sont pas disponibles pour le moment. Réessayez dans quelques instants.</p>;
  }
}
