import { adminPageAllowed } from "@/lib/admin-page";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessageById } from "@/lib/db";
import MessageActions from "@/components/admin/MessageActions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminMessagePage({ params }) {
  if (!(await adminPageAllowed())) return null;
  const { id } = await params;
  const message = await getMessageById(id);
  if (!message) notFound();


  const sujetReponse = encodeURIComponent(`Re: ${message.sujet || "Votre message"}`);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/messages" className="text-[13px] font-semibold text-ink-soft hover:text-lime transition-colors">
        ← Tous les messages
      </Link>
      <h1 className="text-[22px] mt-4 mb-1">{message.sujet || "(sans sujet)"}</h1>
      <div className="text-[13px] text-ink-faint mb-6">
        {message.nom} · {message.email} · {formatDate(message.cree_le)}
      </div>

      <div className="border border-line rounded-lg bg-white p-5 text-[14.5px] leading-relaxed text-dark whitespace-pre-wrap break-words">
        {message.message}
      </div>

      <div className="flex items-center justify-between mt-5">
        <a
          href={`mailto:${message.email}?subject=${sujetReponse}`}
          className="inline-flex items-center rounded bg-lime px-5 py-2.5 text-[14px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
        >
          Répondre par email
        </a>
        <MessageActions id={message.id} lu={!!message.lu} markOnOpen redirectAfterDelete="/admin/messages" />
      </div>
    </div>
  );
}
