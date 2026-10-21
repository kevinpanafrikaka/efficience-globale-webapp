import Image from "@/components/PublicImage";
import { partnerProjectsHref } from "@/lib/partner-projects.mjs";

export default function HomePartnerCard({ partner, projectCount }) {
  const website = /^https?:\/\//i.test(partner.site_web || "") ? partner.site_web : null;
  const external = projectCount === 0 && !!website;
  const href = projectCount > 0 ? partnerProjectsHref(partner) : website || "/partenaires";
  const initials = partner.nom.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  return <a href={href} className="home-partner-tile" target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
    aria-label={projectCount > 0 ? `${partner.nom} : ${projectCount} réalisation${projectCount > 1 ? "s" : ""}` : `${partner.nom}${external ? " : site officiel, nouvel onglet" : " : découvrir nos partenaires"}`}>
    <span className="home-partner-logo">{partner.logo_url ? <Image src={partner.logo_url} alt="" width={240} height={120} className="object-contain" /> : <span className="home-partner-initials" aria-hidden="true">{initials}</span>}</span>
    <strong>{partner.nom}</strong>
    <span className="home-partner-foot">{projectCount > 0 ? `${projectCount} réalisation${projectCount > 1 ? "s" : ""}` : external ? "Site officiel" : "Notre réseau"}</span>
  </a>;
}
