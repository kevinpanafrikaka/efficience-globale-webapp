import { adminPageAllowed } from "@/lib/admin-page";
import Link from "next/link";
import { getDashboardStats } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatCard({ href, label, publies, brouillons }) {
  return (
    <Link href={href} className="border border-line rounded-lg bg-white p-5 hover:border-lime transition-colors">
      <div className="text-[12px] font-bold tracking-wide text-ink-faint mb-2">{label}</div>
      <div className="text-[32px] leading-none font-extrabold text-dark-2 tabular-nums mb-1.5">{publies}</div>
      <div className="text-[12.5px] text-ink-soft">
        publié{publies > 1 ? "s" : ""}
        {brouillons > 0 && ` · ${brouillons} brouillon${brouillons > 1 ? "s" : ""}`}
      </div>
    </Link>
  );
}

const SHORTCUTS = [
  { href: "/admin/projets/nouveau", label: "+ Nouveau projet" },
  { href: "/admin/annonces/nouveau", label: "+ Nouvelle annonce" },
  { href: "/admin/membres/nouveau", label: "+ Nouveau membre" },
  { href: "/admin/partenaires/nouveau", label: "+ Nouveau partenaire" },
];

export default async function AdminHomePage() {
  if (!(await adminPageAllowed())) return null;
  const s = await getDashboardStats();

  return (
    <div className="max-w-4xl">
      <div className="admin-dashboard-heading"><p className="admin-dashboard-eyebrow">EFFICIENCE GLOBALE · ADMINISTRATION</p><h1 className="text-[24px] mb-3">Votre site, en un regard.</h1><p className="text-[15px] text-ink-soft mb-8">Retrouvez vos contenus, préparez vos prochaines publications et suivez les demandes reçues.</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard href="/admin/projets" label="PROJETS" {...s.projets} />
        <StatCard href="/admin/membres" label="MEMBRES" {...s.membres} />
        <StatCard href="/admin/annonces" label="ANNONCES" {...s.annonces} />
        {s.partenaires ? (
          <StatCard href="/admin/partenaires" label="PARTENAIRES" {...s.partenaires} />
        ) : (
          <div className="border border-dashed border-line rounded-lg p-5 text-[12.5px] text-ink-faint">
            Partenaires et messages : appliquez la migration 001 sur D1.
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        {SHORTCUTS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center rounded border border-line px-4 py-2 text-[13px] font-semibold text-dark-2 hover:border-lime hover:text-lime transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {s.messagesNonLus !== null && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[16px]">
              Derniers messages
              {s.messagesNonLus > 0 && <span className="ml-2 text-[13px] font-semibold text-lime">{s.messagesNonLus} non lu{s.messagesNonLus > 1 ? "s" : ""}</span>}
            </h2>
            <Link href="/admin/messages" className="text-[13px] font-semibold text-dark-2 hover:text-lime transition-colors">
              Tout voir →
            </Link>
          </div>
          {s.derniersMessages.length === 0 ? (
            <p className="admin-empty text-[14px] text-ink-soft">Aucun message reçu pour le moment. Les demandes envoyées depuis Contact apparaîtront ici.</p>
          ) : (
            <div className="border border-line rounded-lg overflow-hidden bg-white">
              {s.derniersMessages.map((m, i) => (
                <Link
                  key={m.id}
                  href={`/admin/messages/${m.id}`}
                  className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-cream transition-colors ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <span className={`text-[14px] truncate ${m.lu ? "text-dark" : "font-semibold text-dark"}`}>
                    {m.nom} — {m.sujet || "(sans sujet)"}
                  </span>
                  <span className="text-[12px] text-ink-faint shrink-0">{formatDate(m.cree_le)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
