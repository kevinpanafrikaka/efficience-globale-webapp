// Shared offer settings; contains no private application data.
export const MAX_APPLICATION_DOCUMENTS = 5;
export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
export const DEFAULT_APPLICATION_DOCUMENTS = [
 {id:"cv",label:"CV",required:true},
 {id:"lettre",label:"Lettre de motivation",required:false},
];
export function validateApplicationDocuments(value) {
 if(!Array.isArray(value)||!value.length||value.length>MAX_APPLICATION_DOCUMENTS)throw new Error("Choisissez entre 1 et 5 documents demandés.");
 const ids=new Set(),labels=new Set();
 const reserved=new Set(["nom","email","telephone","message","request_id","site_web","constructor","prototype","__proto__"]);
 return value.map(doc=>{
  if(!doc||typeof doc!=="object"||Array.isArray(doc)||typeof doc.id!=="string"||!/^[a-z][a-z0-9_-]{0,59}$/.test(doc.id)||typeof doc.label!=="string"||typeof doc.required!=="boolean")throw new Error("Un document demandé est invalide.");
  if(reserved.has(doc.id))throw new Error("Identifiant de document réservé.");
  const label=doc.label.trim(),normalized=label.toLocaleLowerCase("fr-FR");
  if(!label||label.length>80||/[\r\n\x00-\x1f\x7f]/.test(label))throw new Error("Chaque document doit avoir un nom de 80 caractères maximum.");
  if(ids.has(doc.id)||labels.has(normalized))throw new Error("Chaque document doit avoir un nom distinct.");
  ids.add(doc.id);labels.add(normalized);
  return {id:doc.id,label,required:doc.required};
 });
}
export function applicationRequirements(value) {
 if(value===undefined||value===null)return DEFAULT_APPLICATION_DOCUMENTS.map(doc=>({...doc}));
 return validateApplicationDocuments(typeof value==="string"?JSON.parse(value):value);
}
export function applicationDocumentFilename(doc) {
 if(doc.id==="cv"&&doc.label==="CV")return "CV.pdf";
 if(doc.id==="lettre"&&doc.label==="Lettre de motivation")return "Lettre-motivation.pdf";
 const stem=doc.label.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"Document";
 return `${stem}-${doc.id}.pdf`;
}
