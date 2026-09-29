import Image from "next/image";

// Carte partenaire (logo + nom au survol). `className` règle la taille selon le contexte.
export default function PartnerCard({ partenaire, className = "" }) {
  const { nom, logo_url: logo, site_web: site } = partenaire;

  const content = (
    <>
      <div className="w-full h-full flex items-center justify-center px-6">
        {logo ? (
          <Image src={logo} alt={nom} width={160} height={90} className="max-h-[78px] w-auto object-contain" />
        ) : (
          <span className="text-[15px] font-bold tracking-[0.02em] text-dark-2 text-center">{nom}</span>
        )}
      </div>
      {logo && (
        <div className="partner-card-name absolute inset-x-0 bottom-0 h-9 bg-darker flex items-center justify-center px-2">
          <span className="text-white text-[11.5px] font-semibold text-center leading-tight">{nom}</span>
        </div>
      )}
    </>
  );

  const cls = `partner-card relative h-[124px] border border-line overflow-hidden block ${className}`;

  return site ? (
    <a href={site} target="_blank" rel="noopener noreferrer" className={cls}>
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}
