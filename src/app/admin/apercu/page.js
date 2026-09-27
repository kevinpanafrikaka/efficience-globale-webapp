"use client";

import { useRef, useState } from "react";

export default function AdminApercuPage() {
  const iframeRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  function handleReload() {
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px-4rem)]">
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
            className="text-[13px] font-semibold text-ink-soft hover:text-dark transition-colors"
          >
            Actualiser
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-line px-3.5 py-2 text-[13px] font-semibold text-dark-2 hover:border-lime hover:text-lime transition-colors"
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
