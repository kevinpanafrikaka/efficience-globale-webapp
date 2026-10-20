"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
export default function MediaUpload() {
  const [value, setValue] = useState("");
  const router = useRouter();
  return <details className="admin-note mb-6"><summary className="cursor-pointer font-semibold min-h-11 flex items-center">+ Ajouter une image à la médiathèque</summary><div className="mt-4 max-w-xl"><ImageUpload value={value} onChange={(url) => { setValue(url); router.refresh(); }} />{value && <p role="status" className="mt-3">Image ajoutée. Elle pourra être supprimée tant qu’aucun contenu ne l’utilise.</p>}</div></details>;
}
