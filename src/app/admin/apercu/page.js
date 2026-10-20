"use client";

import { useRef, useState } from "react";

export default function AdminApercuPage() {
  const iframeRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  function handleReload() {
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="admin-preview flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[20px] mb-1">Aperçu du site</h1>
          <p className="text-[13px] text-ink-soft">
            Le site public en direct, navigable ci-dessous, sans quitter l&apos;espace admin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="eg-button eg-button--secondary eg-button--compact"
          >
            Actualiser
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="eg-button eg-button--secondary eg-button--compact"
          >
            Ouvrir dans un nouvel onglet ↗
          </a>
        </div>
      </div>
      <iframe
        key={reloadKey}
        ref={iframeRef}
        src="/"
        title="Aperçu du site public"
        className="flex-1 w-full border border-line rounded"
      />
    </div>
  );
}
