import { adminPageAllowed } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import { getAllMessages } from "@/lib/db";
import AdminMessages from "@/components/admin/AdminMessages";

export const dynamic = "force-dynamic";

export default async function AdminMessagePage({ params }) {
  if (!(await adminPageAllowed())) return null;
  const { id } = await params;
  const messages = await getAllMessages();
  if (!messages.some(message => message.id === id)) notFound();
  return <AdminMessages messages={messages} initialSelectedId={id} />;
}
