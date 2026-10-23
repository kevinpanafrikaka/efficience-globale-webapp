import { announcementFacts,announcementResource,announcementInfos } from "@/lib/announcement-fields.mjs";
import { announcementArticleContent } from "@/lib/announcements.mjs";

function Blocks({ blocks }) {
  return <div className="announcement-prose">{blocks.map((block,i) => block.type === "list"
    ? <ul key={i}>{block.items.map((text,j) => <li key={j}>{text}</li>)}</ul>
    : <p key={i}>{block.text}</p>)}</div>;
}

export default function AnnouncementArticle({ annonce, action, expired }) {
  const { lead, preamble, sections } = announcementArticleContent(annonce.texte, annonce.resume);
  const facts=announcementFacts(annonce),resource=announcementResource(annonce);
  const chosenAction=resource||{url:action,label:annonce.action_label};
  const hasFacts = facts.length>0,hasAction=Boolean(chosenAction.url&&chosenAction.label);
  const bilan=annonce.categorie==="evenement"?announcementInfos(annonce.informations).evenement.bilan:"";
  return <>
    {lead && <p className="announcement-detail-intro">{lead}</p>}
    {(hasFacts || hasAction) && <aside className="announcement-practical" aria-label="Informations utiles">
      {hasFacts && <dl>
        {facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.date?<time dateTime={fact.date}>{fact.value}</time>:fact.value}</dd></div>)}
      </dl>}
      {(expired || hasAction) && <div className="announcement-practical-action">{expired
        ? <p className="announcement-expired">La date limite est dépassée.</p>
        : <a href={chosenAction.url} className="eg-button eg-button--primary" rel="noopener noreferrer" download={resource?.pdf?"":undefined}>{chosenAction.label}</a>}</div>}
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
    {bilan&&<section className="announcement-outcome"><h2>Bilan et points à retenir</h2><p>{bilan}</p></section>}
  </>;
}
