"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import PublicationPdfUpload from "./PublicationPdfUpload";
import MediaDialog from "./MediaDialog";
export default function MediaUpload() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false), [type, setType] = useState("image"), [uploading, setUploading] = useState(false);
  const router = useRouter();
  const added = url => { setValue(url); router.refresh(); };
  return <><button type="button" className="eg-button eg-button--primary" onClick={() => { setValue(""); setOpen(true); }}>+ Ajouter un fichier</button><MediaDialog open={open} title="Ajouter un fichier" onClose={() => { if (!uploading) setOpen(false); }} busy={uploading}><div className="media-dialog-scroll media-upload-content"><div className="media-usage-filters" role="group" aria-label="Format à ajouter">{[["image", "Image"], ["pdf", "PDF"]].map(([id, label]) => <button key={id} type="button" disabled={uploading} aria-pressed={type === id} onClick={() => { setType(id); setValue(""); }}>{label}</button>)}</div>{type === "image" ? <ImageUpload value={value} onChange={added} onUploadingChange={setUploading} allowLibrary={false} showPreview={!!value}/> : <PublicationPdfUpload value={value} onChange={added} onUploadingChange={setUploading} allowLibrary={false}/>} {value && <p className="media-feedback" role="status">Fichier ajouté à la médiathèque.</p>}</div></MediaDialog></>;
}
