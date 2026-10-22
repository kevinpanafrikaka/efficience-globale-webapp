export default function DashboardIcon({ type, size = 22 }) {
  const shapes = {
    projets: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M3 10h18" /></>,
    membres: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2" /></>,
    annonces: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M8 2v4M16 2v4M8 10h8M8 14h8M8 18h5" /></>,
    partenaires: <><path d="m9 15 6-6M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(0 0) scale(.95)" /></>,
    messages: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    draft: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M14 3v6h6" /><path d="m12 15 7-7 2 2-7 7-3 1Z" /></>,
  };
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{shapes[type] || shapes.draft}</svg>;
}
