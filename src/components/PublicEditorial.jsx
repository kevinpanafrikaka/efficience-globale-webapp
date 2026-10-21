import Link from "next/link";

export function PageIntro({ id, label, title, description, children }) {
  return <div className="eg-page-intro">
    <div>{label && <p className="eg-eyebrow">{label}</p>}<h2 id={id}>{title}</h2>{description && <p className="eg-lead">{description}</p>}</div>
    {children}
  </div>;
}

export function PageCTA({ title = <>Donnons une suite<br /><em>à vos ambitions.</em></>, description = "Un besoin à préciser, une transformation à engager : construisons la prochaine étape ensemble.", label = "Discutons de votre projet", href = "/contact" }) {
  return <section className="eg-page-cta eg-container" aria-label="Poursuivre la conversation"><div><p className="eg-eyebrow">Le prochain pas</p><h2>{title}</h2><p className="eg-lead">{description}</p></div><Link href={href} className="eg-button eg-button--primary">{label}</Link></section>;
}
