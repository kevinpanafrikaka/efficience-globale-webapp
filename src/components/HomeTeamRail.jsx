"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "@/components/PublicImage";

function MemberCard({ member }) {
  const [failedSource, setFailedSource] = useState(null);
  const photo = member.photo_url && failedSource !== member.photo_url;
  const initials = member.nom.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  return <Link href={`/equipe?membre=${encodeURIComponent(member.id)}`} className={`home-member-card ${photo ? "has-photo" : ""}`}>
    {photo ? <Image src={member.photo_url} alt="" fill sizes="(min-width: 768px) 260px, 80vw" className="home-member-portrait object-cover" onError={() => setFailedSource(member.photo_url)} /> : <span className="home-member-initials" aria-hidden="true">{initials}</span>}
    <span className="home-member-shade" aria-hidden="true" />
    <span className="home-member-copy"><strong>{member.nom}</strong>{member.role && <span className="home-member-role">{member.role}</span>}<span className="home-member-open">Voir le profil</span></span>
  </Link>;
}

export default function HomeTeamRail({ members }) {
  const track = useRef(null);
  const [bounds, setBounds] = useState({ back: false, next: false });
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    function update() { setBounds({ back: node.scrollLeft > 2, next: node.scrollLeft + node.clientWidth < node.scrollWidth - 2 }); }
    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => { node.removeEventListener("scroll", update); observer.disconnect(); };
  }, [members]);
  function move(direction) {
    const node = track.current;
    if (!node) return;
    const card = node.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 14 : node.clientWidth;
    node.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  if (!members.length) return null;
  return <div className="home-team-roster">
    <div className="home-team-roster-heading"><p>Le collectif</p><div className="home-team-rail-controls">
      <button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={() => move(-1)} disabled={!bounds.back} aria-label="Voir les profils précédents" aria-controls="home-team-track">Précédent</button>
      <button type="button" className="eg-button eg-button--secondary eg-button--compact" onClick={() => move(1)} disabled={!bounds.next} aria-label="Voir les profils suivants" aria-controls="home-team-track">Suivant</button>
    </div></div>
    <div ref={track} id="home-team-track" className="home-team-track" role="region" aria-label="Les membres du collectif, faites défiler pour découvrir les profils" tabIndex={0}>
      {members.map((member) => <MemberCard key={member.id} member={member} />)}
    </div>
  </div>;
}
