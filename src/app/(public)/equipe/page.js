import Image from "@/components/SiteImage";
import { getMembres, getEquipeStats } from "@/lib/db";

export const metadata = {
  title: "Équipe",
  description: "L'équipe pluridisciplinaire d'Efficience Globale — 15 personnes au service de la gouvernance, de la digitalisation et de l'intelligence artificielle en Guinée.",
};

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const [membres, equipeStats] = await Promise.all([getMembres(), getEquipeStats()]);
  const [fondateur, ...autres] = membres;

  return (
    <>
      <section className="py-16 md:py-24 bg-darker">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/15 w-fit">
            <span className="text-[12px] font-bold tracking-[0.14em] text-lime-2">NOTRE ÉQUIPE</span>
          </div>
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] max-w-2xl">
            Une équipe pluridisciplinaire de 15 personnes
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {fondateur ? (
          <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 md:gap-14 items-start pb-14 md:pb-16 border-b border-line">
            <div className="flex flex-col gap-5">
              <Image
                src={fondateur.photo_url}
                alt={fondateur.nom}
                width={96}
                height={96}
                className="object-cover h-[96px] w-[96px] grayscale"
              />
              <div>
                <h2 className="text-[22px] mb-1 tracking-[-0.01em]">{fondateur.nom}</h2>
                <div className="text-[13.5px] font-semibold text-lime mb-4">{fondateur.role}</div>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">{fondateur.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-2">
              {equipeStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-5 ${i >= 2 ? "border-t border-line" : ""} ${i % 2 === 1 ? "pl-6" : "pr-6"}`}
                >
                  <div className="text-[32px] leading-none font-extrabold text-dark-2 mb-1.5 tabular-nums" style={{ fontFamily: "var(--font-head)" }}>
                    {s.nombre}
                  </div>
                  <p className="text-[13.5px] text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-ink-soft py-14">Aucun membre publié pour le moment.</p>
        )}

        {autres.length > 0 && (
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-10 mt-14">
            {autres.map((m) => (
              <div key={m.id}>
                <Image
                  src={m.photo_url}
                  alt={m.nom}
                  width={64}
                  height={64}
                  className="object-cover mb-4 h-[64px] w-[64px] grayscale"
                />
                <h3 className="text-[16px] mb-1 tracking-[-0.01em]">{m.nom}</h3>
                <div className="text-[13px] font-semibold text-lime mb-3">{m.role}</div>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">{m.bio}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-[13.5px] text-ink-faint mt-14 border-t border-line pt-6">
          Les fiches des autres membres de l&apos;équipe seront ajoutées ici au fur et à mesure, via l&apos;espace
          admin.
        </p>
      </section>
    </>
  );
}
