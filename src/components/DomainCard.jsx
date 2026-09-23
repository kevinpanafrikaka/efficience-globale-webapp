import Image from "next/image";

export default function DomainCard({ titre, description, photo, tint, icon }) {
  return (
    <div className="relative h-[260px] md:h-[320px] overflow-hidden flex flex-col justify-end p-6">
      <Image src={photo} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
      <div className="absolute inset-0" style={{ backgroundColor: tint, mixBlendMode: "multiply" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />
      <div className="relative z-10 mb-auto">{icon}</div>
      <div className="relative z-10">
        <h3 className="text-white text-[20px] md:text-[22px] leading-tight tracking-[-0.01em] mb-2">{titre}</h3>
        <p className="text-white/80 text-[13.5px] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
