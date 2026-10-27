"use client";
import { useRouter } from "next/navigation";
import EditorSelect from "./EditorSelect";
import "./project-editor.css";

export default function ApplicationOfferFilter({ offers, offer = "", status = "", search = "" }) {
  const router = useRouter();
  const options = [{ value: "", label: "Toutes les offres" }, ...offers];
  if (offer && !offers.some(o => o.value === offer)) options.push({ value: offer, label: "Offre sélectionnée" });
  function choose(value) {
    const query = new URLSearchParams();
    if (value) query.set("annonce", value);
    if (status) query.set("statut", status);
    if (search) query.set("q", search);
    router.push(`/admin/candidatures${query.size ? `?${query}` : ""}`);
  }
  return <div className="project-editor application-offer-filter">
    <label htmlFor="application-offer">Offre de recrutement</label>
    <EditorSelect id="application-offer" value={offer} options={options} onChange={choose} />
  </div>;
}
