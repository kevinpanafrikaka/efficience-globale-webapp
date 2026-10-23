import { announcementCategory,announcementDate,announcementActionUrl } from "./announcements.mjs";
export const TRAINING_FORMATS=[{value:"presentiel",label:"En présentiel"},{value:"en_ligne",label:"En ligne"},{value:"hybride",label:"Hybride"}];
export const PUBLICATION_TYPES=[{value:"rapport",label:"Rapport"},{value:"etude",label:"Étude"},{value:"guide",label:"Guide"},{value:"article",label:"Article"}];
export const PUBLICATION_PDF_LIMIT=8*1024*1024;
const shapes={
 recrutement:{poste:200},
 formation:{date_debut:10,date_fin:10,heure_debut:5,heure_fin:5,duree:100,public:500,tarif:150,format:20,plateforme:200},
 evenement:{date_activite:10,intervenants:500,bilan:2000},
 actualite:{concernes:500},
 publication:{nature:20,auteurs:500,date_document:10,support:20,fichier_url:2000,fichier_nom:200,source_url:2000},
};
export function announcementInfos(value) {
 const stored=typeof value==="string"?JSON.parse(value):value||{};
 const result={};
 for(const [type,shape] of Object.entries(shapes)){
  result[type]=Object.fromEntries(Object.keys(shape).map(key=>[key,typeof stored?.[type]?.[key]==="string"?stored[type][key]:""]));
 }
 result.formation.format ||= "presentiel";
 result.publication.nature ||= "rapport";result.publication.support ||= "pdf";
 return result;
}
export function validAnnouncementDate(value) {return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function validateAnnouncementInfo(category,value,deadline="") {
 if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Informations de l’annonce invalides.");
 const type=announcementCategory(category),source=value[type]??{};
 if(!source||typeof source!=="object"||Array.isArray(source))throw new Error("Informations de l’annonce invalides.");
 const info={};
 for(const [key,max] of Object.entries(shapes[type])){
  const raw=source[key]??"";
  if(typeof raw!=="string"||raw.trim().length>max)throw new Error("Un champ des informations de l’annonce est invalide ou trop long.");
  info[key]=raw.trim();
 }
 for(const key of ["date_debut","date_fin","date_activite","date_document"])if(info[key]&&!validAnnouncementDate(info[key]))throw new Error("Renseignez une date complète et valide.");
 for(const key of ["heure_debut","heure_fin"])if(info[key]&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(info[key]))throw new Error("Renseignez un horaire valide.");
 if(type==="formation"){
  info.format ||= "presentiel";
  if(!TRAINING_FORMATS.some(o=>o.value===info.format))throw new Error("Format de formation invalide.");
  if(info.date_fin&&(!info.date_debut||info.date_fin<info.date_debut))throw new Error("La fin de la formation doit suivre sa date de début.");
  if(info.heure_fin&&!info.heure_debut)throw new Error("Renseignez l’heure de début.");
  if(info.heure_debut&&info.heure_fin&&(!info.date_fin||info.date_fin===info.date_debut)&&info.heure_fin<=info.heure_debut)throw new Error("L’heure de fin doit suivre l’heure de début.");
  if(deadline&&info.date_debut&&deadline>info.date_debut)throw new Error("La clôture des inscriptions doit précéder ou correspondre au début de la formation.");
 }
 if(type==="publication"){
  info.nature ||= "rapport";info.support ||= "pdf";
  if(!PUBLICATION_TYPES.some(o=>o.value===info.nature)||!["pdf","lien"].includes(info.support))throw new Error("Type de publication invalide.");
  if(info.fichier_url&&!/^\/documents\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(info.fichier_url))throw new Error("Choisissez un PDF depuis votre ordinateur.");
  if(info.source_url&&(!announcementActionUrl(info.source_url)||!/^https?:\/\//i.test(info.source_url)))throw new Error("Le lien de consultation doit commencer par https:// ou http://.");
 }
 return {[type]:info};
}
export function announcementFacts(annonce){
 const type=announcementCategory(annonce.categorie),info=announcementInfos(annonce.informations)[type],facts=[];
 const add=(label,value,date=false)=>{if(value)facts.push({label,value:date?announcementDate(value):value,...(date?{date:value}:{})});};
 if(type==="recrutement")add("Poste",info.poste);
 if(type==="formation"){
  add("Date de début",info.date_debut,true);add("Date de fin",info.date_fin,true);
  add("Horaires",[info.heure_debut,info.heure_fin].filter(Boolean).map(t=>t.replace(":"," h ")).join(" – "));
  add("Durée",info.duree);if(annonce.informations?.formation?.format)add("Format",TRAINING_FORMATS.find(o=>o.value===info.format)?.label);
 }
 if(type==="evenement")add("Date de l’activité",info.date_activite,true);
 if(type!=="publication")add("Lieu",annonce.lieu);
 if(type==="recrutement"||type==="formation")add(type==="formation"?"Clôture des inscriptions":"Date limite",annonce.echeance,true);
 if(type==="formation"){
  if(info.format!=="presentiel")add("Plateforme",info.plateforme);
  add("Public concerné",info.public);add("Tarif",info.tarif);
 }
 if(type==="evenement")add("Intervenants",info.intervenants);
 if(type==="actualite")add("Personnes et organisations concernées",info.concernes);
 if(type==="publication"){
  if(annonce.informations?.publication?.nature)add("Type de ressource",PUBLICATION_TYPES.find(o=>o.value===info.nature)?.label);add("Auteurs",info.auteurs);add("Date du document",info.date_document,true);
 }
 return facts;
}
export function announcementResource(annonce){
 if(announcementCategory(annonce.categorie)!=="publication")return null;
 const info=announcementInfos(annonce.informations).publication;
 if(info.support==="pdf"&&info.fichier_url&&/^\/documents\/[a-f0-9-]+$/.test(info.fichier_url))return {url:info.fichier_url,label:"Télécharger le document",pdf:true};
 if(info.support==="lien"&&/^https?:\/\//i.test(info.source_url)&&announcementActionUrl(info.source_url))return {url:info.source_url,label:"Lire la publication",pdf:false};
 return null;
}
