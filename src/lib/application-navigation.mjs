import { APPLICATION_STATUSES } from "./application-options.mjs";

export function applicationListFilters(query = {}) {
 return {
  annonce: typeof query.annonce === "string" ? query.annonce.slice(0,300) : "",
  statut: APPLICATION_STATUSES.some(s=>s.value===query.statut) ? query.statut : "",
  q: typeof query.q === "string" ? query.q.trim().slice(0,120) : "",
  page: Math.max(1,Math.min(10000,Number.parseInt(query.page,10)||1)),
 };
}
export function applicationListHref(query = {}) {
 const values=applicationListFilters(query),p=new URLSearchParams();
 for(const key of ["annonce","statut","q"])if(values[key])p.set(key,values[key]);
 if(values.page>1)p.set("page",String(values.page));
 return `/admin/candidatures${p.size?`?${p}`:""}`;
}
export function applicationDossierHref(id,query = {}) {
 return `/admin/candidatures/${encodeURIComponent(id)}${applicationListHref(query).slice("/admin/candidatures".length)}`;
}
