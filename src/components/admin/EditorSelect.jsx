"use client";
import { useEffect, useRef, useState } from "react";

const clean = value => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function EditorSelect({ id, value, options, onChange, placeholder = "Choisir…", multiple = false, searchable = false, allowCustom = false, disabled = false }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState("");
  const [room, setRoom] = useState(280), [above, setAbove] = useState(false);
  const root = useRef(null), trigger = useRef(null), search = useRef(null), optionRefs = useRef([]);
  const selected = multiple ? value : [value];
  const unique = [...new Map([...options, ...selected.filter(Boolean).map(v => ({ value: v, label: options.find(o => o.value === v)?.label || v }))].map(o => [o.value, o])).values()];
  const visible = unique.filter(o => clean(o.label).includes(clean(query)));
  const custom = allowCustom && query.trim() && !unique.some(o => clean(o.label) === clean(query));
  function close(focus = false) { setOpen(false); setQuery(""); if (focus) trigger.current?.focus(); }
  function choose(v) {
    onChange(multiple ? selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v] : v);
    if (!multiple) close(true);
  }
  useEffect(() => {
    if (!open) return;
    function position() {
      const rect = trigger.current?.getBoundingClientRect?.();
      if (!rect) return;
      const viewport = window.visualViewport;
      const bottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
      const header = document.querySelector?.(".editor-header")?.getBoundingClientRect?.();
      const top = Math.max(viewport?.offsetTop || 0, header?.bottom || 0);
      const footer = document.querySelector?.(".editor-mobile-actions")?.getBoundingClientRect?.();
      const limit = footer?.height ? Math.min(bottom, footer.top) : bottom;
      const after = limit - rect.bottom - 14, before = rect.top - top - 14;
      const up = after < 220 && before > after;
      setAbove(up); setRoom(Math.max(0, Math.min(340, up ? before : after)));
    }
    const outside = e => { if (!root.current?.contains(e.target)) close(); };
    position();
    if (searchable) search.current?.focus(); else optionRefs.current[Math.max(0, visible.findIndex(o => selected.includes(o.value)))]?.focus();
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    window.visualViewport?.addEventListener("resize", position);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); window.visualViewport?.removeEventListener("resize", position); };
    // Selection and search updates must not move focus away from the current control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  function keyDown(e) {
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    if ((e.key === "Home" || e.key === "End") && e.target === search.current) return;
    e.preventDefault();
    if (!open) { setOpen(true); return; }
    const count = visible.length + (custom ? 1 : 0);
    if (!count) return;
    const index = optionRefs.current.findIndex(node => node === e.target);
    const next = e.key === "Home" ? 0 : e.key === "End" ? count - 1 : e.key === "ArrowDown" ? (index + 1) % count : (index - 1 + count) % count;
    optionRefs.current[next]?.focus();
  }
  return <div className="editor-select" ref={root} onKeyDown={keyDown} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}>
    <div className="editor-select-control"><button id={id} ref={trigger} type="button" className="editor-select-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} disabled={disabled} onClick={() => open ? close() : setOpen(true)}>
      <span>{multiple ? selected.length ? `${selected.length} organisation${selected.length > 1 ? "s" : ""} sélectionnée${selected.length > 1 ? "s" : ""}` : placeholder : unique.find(o => o.value === value)?.label || placeholder}</span><span aria-hidden="true" className="editor-select-mark">{open ? "−" : "+"}</span>
    </button>
    {open && <div className="editor-select-panel" data-above={above} style={{ maxHeight: `${room}px` }}>
      {searchable && <input ref={search} className="editor-select-search" type="search" value={query} onChange={e => setQuery(e.target.value)} aria-label="Rechercher une organisation" placeholder="Rechercher ou saisir un nom…" />}
      <div id={`${id}-options`} role="listbox" aria-label={multiple ? "Organisations" : "Choix disponibles"} aria-multiselectable={multiple || undefined}>
        {visible.map((o, i) => <button key={o.value} ref={node => { optionRefs.current[i] = node; }} type="button" role="option" aria-selected={selected.includes(o.value)} onClick={() => choose(o.value)}><span>{o.label}</span>{selected.includes(o.value) && <span aria-hidden="true">✓</span>}</button>)}
        {custom && <button ref={node => { optionRefs.current[visible.length] = node; }} type="button" role="option" aria-selected={false} onClick={() => { choose(query.trim()); setQuery(""); search.current?.focus(); }}>Ajouter « {query.trim()} »</button>}
        {!visible.length && !custom && <p className="editor-help">Aucun résultat.</p>}
      </div>
      {multiple && <button type="button" className="editor-select-done" onClick={() => close(true)}>Terminer</button>}
    </div>}
    </div>
    {multiple && selected.length > 0 && <div className="editor-selected-tags">{selected.map(v => <span key={v}>{v}<button type="button" disabled={disabled} aria-label={`Retirer ${v}`} onClick={() => onChange(selected.filter(s => s !== v))}>×</button></span>)}</div>}
  </div>;
}
