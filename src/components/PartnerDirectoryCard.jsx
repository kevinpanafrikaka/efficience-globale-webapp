import Image from "@/components/PublicImage";
import { partnerProjectsHref } from "@/lib/partner-projects.mjs";

export default function PartnerDirectoryCard({ partner, projectCount }) {
  const initials = partner.nom.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  const website = /^https?:\/\//i.test(partner.site_web || "") ? partner.site_web : null;

  return (
    <article className="partner-directory-card flex h-full min-w-0 flex-col rounded-2xl border border-line bg-white p-4 sm:p-6">
      <div className="flex h-28 items-center justify-center px-2 pb-4">
        {partner.logo_url ? (
          <Image src={partner.logo_url} alt="" width={180} height={90} className="h-auto max-h-20 max-w-full w-auto object-contain" />
        ) : (
          <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-2xl bg-cream text-2xl font-semibold text-dark-2">{initials}</span>
        )}
      </div>
      <h3 className="min-h-[44px] text-center font-body text-[14px] sm:text-[16px] font-semibold leading-snug text-dark">{partner.nom}</h3>
      <div className="mt-auto border-t border-line pt-4">
        {projectCount > 0 ? (
          <>
            <p className="mb-3 text-center text-[12px] font-semibold text-dark-2">{projectCount} réalisation{projectCount > 1 ? "s" : ""}</p>
            <a href={partnerProjectsHref(partner)} aria-label={`Voir les réalisations avec ${partner.nom}`} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cream px-2 py-2.5 text-center text-[13px] font-semibold text-dark transition-colors hover:bg-lime-2">
              Voir les projets <span aria-hidden="true">↗</span>
            </a>
          </>
        ) : (
          <p className="flex min-h-[72px] items-center justify-center text-center text-[12px] leading-relaxed text-ink-faint">Les réalisations associées seront publiées ici.</p>
        )}
        {website && <a href={website} target="_blank" rel="noopener noreferrer" aria-label={`Site de ${partner.nom} (nouvel onglet)`} className="mt-2 flex min-h-11 items-center justify-center gap-2 text-[12px] font-semibold text-ink-soft">Site officiel <span aria-hidden="true">↗</span></a>}
      </div>
    </article>
  );
}
