import Link from "next/link";
import { getAllMessages } from "@/lib/db";
import { formatDate } from "@/lib/format";
import MessageActions from "@/components/admin/MessageActions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  let messages = [];
  let migrationManquante = false;
  try {
    messages = await getAllMessages();
  } catch {
    migrationManquante = true;
  }
  const nonLus = messages.filter((m) => !m.lu).length;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-[24px]">Messages</h1>
        {nonLus > 0 && <span className="text-[13px] font-semibold text-lime">{nonLus} non lu{nonLus > 1 ? "s" : ""}</span>}
      </div>

      {migrationManquante ? (
        <p className="text-[14.5px] text-red-600">
          La table « messages » n&apos;existe pas encore. Appliquez la migration
          <code className="mx-1">migrations/001_admin_completion.sql</code> sur la base D1.
        </p>
      ) : messages.length === 0 ? (
        <p className="text-[14.5px] text-ink-soft">Aucun message reçu pour le moment.</p>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden bg-white">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-line" : ""} ${
                m.lu ? "" : "bg-cream"
              }`}
            >
              <Link href={`/admin/messages/${m.id}`} className="min-w-0 flex-1 group">
                <div className="flex items-center gap-2 mb-0.5">
                  {!m.lu && <span className="w-2 h-2 rounded-full bg-lime shrink-0" aria-label="Non lu" />}
                  <span className={`text-[14.5px] truncate group-hover:text-lime transition-colors ${m.lu ? "text-dark" : "font-semibold text-dark"}`}>
                    {m.sujet || "(sans sujet)"}
                  </span>
                </div>
                <div className="text-[12.5px] text-ink-faint truncate">
                  {m.nom} · {m.email} · {formatDate(m.cree_le)}
                  {!m.envoye && " · email de notification non envoyé"}
                </div>
              </Link>
              <MessageActions id={m.id} lu={!!m.lu} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
