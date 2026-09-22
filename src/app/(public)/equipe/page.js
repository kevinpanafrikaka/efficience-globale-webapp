import Image from "next/image";
import { getMembres } from "@/lib/db";
import { equipeStats } from "@/data/team";

export const metadata = {
  title: "Équipe",
  description: "L'équipe pluridisciplinaire d'Efficience Globale — 15 personnes au service de la gouvernance, de la digitalisation et de l'intelligence artificielle en Guinée.",
};

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const membres = await getMembres();
  const [fondateur, ...autres] = membres;

  return (
    <>
      <section className="py-14 md:py-16" style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">NOTRE ÉQUIPE</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight">
            Une équipe pluridisciplinaire de 15 personnes
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
        {fondateur ? (
          <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 md:gap-14 items-start">
            <div className="bg-cream rounded-xl p-7">
              <Image
                src={fondateur.photo_url}
                alt={fondateur.nom}
                width={76}
                height={76}
                className="rounded-full object-cover mb-5 h-[76px] w-[76px]"
              />
              <h2 className="text-[20px] mb-1">{fondateur.nom}</h2>
              <div className="text-[13.5px] font-semibold text-lime mb-4">{fondateur.role}</div>
              <p className="text-[14px] leading-relaxed text-ink-soft">{fondateur.bio}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {equipeStats.map((s) => (
                <div key={s.label} className="bg-cream rounded-xl p-6">
                  <div className="text-[26px] font-extrabold text-dark-2 mb-1.5" style={{ fontFamily: "var(--font-head)" }}>
                    {s.nombre}
                  </div>
                  <p className="text-[14px] text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-ink-soft py-14">Aucun membre publié pour le moment.</p>
        )}

        {autres.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {autres.map((m) => (
              <div key={m.id} className="bg-cream rounded-xl p-6">
                <Image
                  src={m.photo_url}
                  alt={m.nom}
                  width={64}
                  height={64}
                  className="rounded-full object-cover mb-4 h-[64px] w-[64px]"
                />
                <h3 className="text-[16px] mb-1">{m.nom}</h3>
                <div className="text-[13px] font-semibold text-lime mb-3">{m.role}</div>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">{m.bio}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-[13.5px] text-ink-faint mt-10">
          Les fiches des autres membres de l&apos;équipe seront ajoutées ici au fur et à mesure, via l&apos;espace
          admin.
        </p>
      </section>
    </>
  );
}
