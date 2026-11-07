export default function AdminSidebarIcon({ type }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    projects: <><path d="M3 8a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 12h18"/></>,
    team: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/></>,
    announcements: <><path d="m4 10 15-6v16L4 14Z"/><path d="M7 15v6h4l-1-5M3 10v4M22 9v6"/></>,
    partners: <><path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/></>,
    messages: <><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3 7 9 6 9-6"/></>,
    media: <><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 5 5 3-3 5 5"/></>,
    settings: <><path d="m10 3-.5 2-2 .9-1.9-.6-2 3.4 1.4 1.6v2.4L3.6 14l2 3.4 1.9-.6 2 .9.5 2.3h4l.5-2.3 2-.9 1.9.6 2-3.4-1.4-1.3v-2.4l1.4-1.6-2-3.4-1.9.6-2-.9L14 3Z"/><circle cx="12" cy="11.5" r="3"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
    logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M9 12h12m-4-4 4 4-4 4"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg data-sidebar-icon={type} aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[type] || paths.dashboard}</svg>;
}
