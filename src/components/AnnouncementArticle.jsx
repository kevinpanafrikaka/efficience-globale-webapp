import { announcementArticleContent, announcementDate } from "@/lib/announcements.mjs";

function Blocks({ blocks }) {
  return <div className="announcement-prose">{blocks.map((block,i) => block.type === "list"
    ? <ul key={i}>{block.items.map((text,j) => <li key={j}>{text}</li>)}</ul>
    : <p key={i}>{block.text}</p>)}</div>;
}

export default function AnnouncementArticle({ annonce, action, expired }) {
  const { lead, preamble, sections } = announcementArticleContent(annonce.texte, annonce.resume);
  const hasFacts = Boolean(annonce.lieu || annonce.echeance);
  const hasAction = Boolean(action && annonce.action_label);
  return <>
    {lead && <p className="announcement-detail-intro">{lead}</p>}
    {(hasFacts || hasAction) && <aside className="announcement-practical" aria-label="Informations utiles">
      {hasFacts && <dl>
        {annonce.lieu && <div><dt>Lieu</dt><dd>{annonce.lieu}</dd></div>}
        {annonce.echeance && <div><dt>Date limite</dt><dd><time dateTime={annonce.echeance}>{announcementDate(annonce.echeance)}</time></dd></div>}
      </dl>}
      {(expired || hasAction) && <div className="announcement-practical-action">{expired
        ? <p className="announcement-expired">La date limite est dépassée.</p>
        : <a href={action} className="eg-button eg-button--primary" rel="noopener noreferrer">{annonce.action_label}</a>}</div>}
    </aside>}
    {preamble.length > 0 && <div className="announcement-preamble"><Blocks blocks={preamble}/></div>}
    {sections.length > 0 && <div className="announcement-sections">{sections.map((section,i) => {
      const closing = sections.length > 2 && i === sections.length - 1;
      const wide = sections.length === 1 || i > 1;
      return <section key={i} className={`announcement-article-section${wide ? " is-wide" : ""}${closing ? " is-closing" : ""}`} aria-labelledby={`announcement-section-${i}`}>
        <h2 id={`announcement-section-${i}`}>{section.title}</h2>
        <Blocks blocks={section.blocks}/>
      </section>;
    })}</div>}
  </>;
}
