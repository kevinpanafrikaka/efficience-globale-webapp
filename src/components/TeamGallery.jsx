"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/SiteImage";
import { expertiseTags } from "@/lib/member-expertises.mjs";
import { memberOffset, wrapMember } from "@/lib/team-carousel.mjs";
import "./team-gallery.css";

function Portrait({ member, priority }) {
  const [failed, setFailed] = useState(false);
  const initials = member.nom.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("");
  return member.photo_url && !failed ? (
    <Image src={member.photo_url} alt="" fill sizes="(max-width: 767px) 85vw, 360px"
      priority={priority} draggable={false} className="team-portrait" onError={() => setFailed(true)} />
  ) : <span className="team-initials" aria-hidden="true">{initials}</span>;
}

export default function TeamGallery({ members, initialMemberId }) {
  const [selected, setSelected] = useState(() => Math.max(0, members.findIndex((member) => member.id === initialMemberId)));
  const gesture = useRef(null);
  const ignoreClick = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const carousel = members.length > 1;
  const activeIndex = wrapMember(selected, members.length);
  const autoRunning = carousel && playing && !reducedMotion && pageVisible;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => setReducedMotion(media.matches);
    const visibilityChanged = () => setPageVisible(!document.hidden);
    motionChanged();
    visibilityChanged();
    media.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      media.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (!autoRunning) return;
    const timer = window.setTimeout(() => setSelected((index) => wrapMember(index + 1, members.length)), 5000);
    return () => window.clearTimeout(timer);
  }, [autoRunning, selected, members.length]);

  if (!members.length) return <p className="text-ink-soft py-12">Les portraits de notre équipe seront bientôt disponibles.</p>;
  const active = members[activeIndex];
  function move(direction) { setSelected((index) => wrapMember(index + direction, members.length)); }
  function handleKey(event) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  }
  function finishGesture(event) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || !carousel) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      ignoreClick.current = true;
      move(dx < 0 ? 1 : -1);
    }
  }

  return (
    <div className="team-gallery" onKeyDown={handleKey}
      onFocusCapture={(event) => {
        // Un clic souris ne suspend pas la rotation. Au clavier, on laisse le temps de lire.
        if (event.target.matches(":focus-visible")) setPlaying(false);
      }}>
      <div className={carousel ? "team-stage" : "team-grid"} role="group"
        aria-label={carousel ? "Portraits de l’équipe, utilisez les flèches pour naviguer" : "Choisir un membre de l’équipe"}
        onPointerDown={(event) => { ignoreClick.current = false; gesture.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={finishGesture} onPointerCancel={() => { gesture.current = null; }}>
        {members.map((member, index) => {
          const offset = carousel ? memberOffset(index, activeIndex, members.length) : 0;
          const hidden = carousel && Math.abs(offset) > 1;
          return (
            <button key={member.id} type="button"
              className={`team-card ${activeIndex === index ? "is-selected" : ""}`}
              style={carousel ? { "--offset": offset, "--depth": Math.abs(offset), zIndex: members.length - Math.abs(offset) } : undefined}
              aria-pressed={activeIndex === index} aria-controls="team-biography" aria-hidden={hidden || undefined}
              tabIndex={hidden ? -1 : 0} onClick={() => {
                if (ignoreClick.current) { ignoreClick.current = false; return; }
                setSelected(index);
              }}>
              <Portrait member={member} priority={index === 0} />
              <span className="team-card-shade" aria-hidden="true" />
              <span className="team-card-caption">
                <span className="team-card-name">{member.nom}</span>
                {member.role && <span className="team-card-role">{member.role}</span>}
              </span>
              <span className="team-card-mark" aria-hidden="true">{activeIndex === index ? "−" : "+"}</span>
            </button>
          );
        })}
      </div>

      {carousel && <div className="team-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Membre précédent">←</button>
        <span className="tabular-nums" aria-label={`Membre ${activeIndex + 1} sur ${members.length}`}>{String(activeIndex + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(members.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => move(1)} aria-label="Membre suivant">→</button>
        {!reducedMotion && <button type="button" className="team-play-toggle" onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "Mettre en pause le défilement automatique" : "Reprendre le défilement automatique"}>
          {playing ? "Pause" : "Reprendre"}
        </button>}
      </div>}

      {carousel && <div className={`team-progress ${autoRunning ? "is-running" : ""}`} aria-hidden="true">
        <span key={`${active.id}-${autoRunning}`} />
      </div>}

      <div id="team-biography" className="team-biography" role="region" aria-label="Biographie du membre sélectionné" aria-live={autoRunning ? "off" : "polite"} aria-atomic="true">
        <div key={active.id} className="team-biography-content">
          <div>
            <h2>{active.nom}</h2>
            {active.role && <p className="team-bio-role">{active.role}</p>}
            {expertiseTags(active.expertises).length > 0 && (
              <ul className="team-expertises" aria-label="Domaines d’expertise">
                {expertiseTags(active.expertises).map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            )}
          </div>
          <p className="team-bio-text">{active.bio || "Découvrez prochainement le parcours de ce membre de notre équipe."}</p>
        </div>
      </div>
    </div>
  );
}
