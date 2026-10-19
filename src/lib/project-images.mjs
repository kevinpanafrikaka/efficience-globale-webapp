// Versions légères des photos publiées ; les originaux restent disponibles.
const PROJECT_IMAGES = {
  "/img/realisations/gavi-mshp.jpg": "/img/realisations/web/gouvernance-pev-lmc.webp",
  "/img/realisations/eval-rh-pev.png": "/img/realisations/web/evaluation-rh-pev.webp",
  "/img/realisations/outils-digitaux-pev.png": "/img/realisations/web/outils-digitaux-pev.webp",
  "/img/realisations/unicef-mshp.jpg": "/img/realisations/web/chaine-froid-pev.webp",
  "/img/realisations/ue-expertise-france.jpg": "/img/realisations/web/cartographie-nutrition-eu4sun.webp",
  "/img/realisations/ia-generative-pev.png": "/img/realisations/web/ia-generative-pev.webp",
  "/img/realisations/institut-francais.jpg": "/img/realisations/web/agents-ia-osc.webp",
  "/img/realisations/station-ia.png": "/img/realisations/web/station-ia.webp",
  "/img/realisations/formation-ia-rtg.png": "/img/realisations/web/formation-ia-rtg.webp",
  "/img/realisations/formation-ia-journalistes.png": "/img/realisations/web/formation-ia-journalistes.webp",
  "/img/realisations/sommet-stein.png": "/img/realisations/web/sommet-stein-ukag.webp",
  "/img/realisations/banque-mondiale-pdaig.jpg": "/img/realisations/web/restructuration-sydam.webp",
  "/img/realisations/genre-equite-mshp.png": "/img/realisations/web/genre-equite-mshp.webp",
  "/img/realisations/guichet-vbg.png": "/img/realisations/web/guichet-vbg-enabel.webp",
  "/img/realisations/rh-cobad.png": "/img/realisations/web/rh-cobad.webp",
  "/img/realisations/passgui-gouvernance.png": "/img/realisations/web/passgui-gouvernance.webp",
  "/img/realisations/assistant-matoto.png": "/img/realisations/web/assistant-pedagogique-matoto.webp",
  "/img/realisations/partenariat-grassroots.png": "/img/realisations/web/partenariat-grassroots.webp",
  "/img/realisations/partenariat-agsp.png": "/img/realisations/web/partenariat-agsp.webp",
  "/img/realisations/partenariat-umi.png": "/img/realisations/web/partenariat-umi.webp",
  "/img/realisations/partenariat-exclusiva.jpg": "/img/realisations/web/partenariat-exclusiva.webp"
};

export function projectImageSource(src) {
  return typeof src === "string" ? (PROJECT_IMAGES[src] || src) : src;
}
