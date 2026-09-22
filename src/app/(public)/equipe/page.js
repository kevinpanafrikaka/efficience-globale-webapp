import Image from "next/image";
import { fondateur, equipeStats } from "@/data/team";

export const metadata = {
  title: "Équipe",
  description: "L'équipe pluridisciplinaire d'Efficience Globale — 15 personnes au service de la gouvernance, de la digitalisation et de l'intelligence artificielle en Guinée.",
};

export default function EquipePage() {
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
        <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-10 md:gap-14 items-start">
          <div className="bg-cream rounded-xl p-7">
            <Image
              src={`/img/${fondateur.photo}`}
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

        <p className="text-[13.5px] text-ink-faint mt-10">
          Les fiches des autres membres de l&apos;équipe seront ajoutées ici au fur et à mesure, via l&apos;espace
          admin.
        </p>
      </section>
    </>
  );
}
