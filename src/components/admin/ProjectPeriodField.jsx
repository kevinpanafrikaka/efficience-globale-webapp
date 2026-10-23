"use client";
import { useState } from "react";
import EditorSelect from "./EditorSelect";
import { MONTHS, parseProjectPeriod, projectPeriodResult } from "@/lib/project-period.mjs";

export default function ProjectPeriodField({ value, onChange, onValidityChange, disabled = false }) {
  const initial = parseProjectPeriod(value);
  const [range, setRange] = useState(initial || parseProjectPeriod(""));
  const [manual, setManual] = useState(initial === null);
  const [error, setError] = useState("");
  function update(field, v) {
    const next = { ...range, [field]: v };
    setRange(next);
    const result = projectPeriodResult(next);
    setError(result.error); onValidityChange(result.error); onChange(result.value);
  }
  function toggle() {
    if (manual) {
      const parsed = parseProjectPeriod(value);
      if (!parsed) { setError("Cette période utilise un format libre. Effacez-la pour choisir des mois et années."); return; }
      setRange(parsed);
    }
    setManual(!manual); setError(""); onValidityChange("");
  }
  const options = MONTHS.map((label,i) => ({ value: String(i+1), label }));
  return <fieldset className="editor-period"><legend>Période</legend>
    {manual ? <div className="editor-field"><label htmlFor="projetform-7" className="sr-only">Période en saisie libre</label><input id="projetform-7" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} /></div> : <>
      <div className="editor-period-dates">
        <div><label htmlFor="period-start-month">Début</label><div className="editor-period-pair"><EditorSelect id="period-start-month" value={range.startMonth} options={options} onChange={v => update("startMonth",v)} placeholder="Mois" disabled={disabled} /><input aria-label="Année de début" type="text" inputMode="numeric" maxLength={4} placeholder="Année" value={range.startYear} disabled={disabled} onChange={e => update("startYear",e.target.value.replace(/\D/g,""))} /></div></div>
        <div><label htmlFor="period-end-month">Fin</label><div className="editor-period-pair"><EditorSelect id="period-end-month" value={range.endMonth} options={options} onChange={v => update("endMonth",v)} placeholder="Mois" disabled={disabled} /><input aria-label="Année de fin" type="text" inputMode="numeric" maxLength={4} placeholder="Année" value={range.endYear} disabled={disabled} onChange={e => update("endYear",e.target.value.replace(/\D/g,""))} /></div></div>
      </div>
      {value && <p className="editor-help">{value}</p>}
    </>}
    {error && <p className="editor-period-error" role="alert">{error}</p>}
    <button type="button" disabled={disabled} className="editor-period-mode" onClick={toggle}>{manual ? "Choisir les mois et années" : "Utiliser une saisie libre"}</button>
  </fieldset>;
}
