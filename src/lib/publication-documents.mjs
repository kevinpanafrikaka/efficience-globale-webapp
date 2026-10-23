import { PUBLICATION_PDF_LIMIT } from "./announcement-fields.mjs";
export const PUBLICATION_DOCUMENT_PREFIX="publication-documents/";
export function publicationDocumentUrl(key){
 const match=/^publication-documents\/([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})\.pdf$/.exec(key);
 return match?`/documents/${match[1]}`:"";
}
export class PublicationDocumentError extends Error {constructor(message,status=400){super(message);this.status=status;}}
export async function readPublicationPdf(request){
 const max=PUBLICATION_PDF_LIMIT+1024*1024;
 if(Number(request.headers.get("content-length"))>max)throw new PublicationDocumentError("Le PDF dépasse 8 Mo.",413);
 if(!request.body)throw new PublicationDocumentError("Aucun fichier reçu.");
 const reader=request.body.getReader(),chunks=[];let length=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new PublicationDocumentError("Le PDF dépasse 8 Mo.",413);}chunks.push(value);}}
 finally{reader.releaseLock();}
 let form;try{form=await new Response(Buffer.concat(chunks),{headers:{"content-type":request.headers.get("content-type")||""}}).formData();}catch{throw new PublicationDocumentError("Fichier illisible.");}
 const file=form.get("file");
 if(form.getAll("file").length!==1||!file||typeof file==="string"||!file.size||!/\.pdf$/i.test(file.name)||!["application/pdf","application/octet-stream",""].includes(file.type))throw new PublicationDocumentError("Choisissez un fichier PDF.");
 if(file.size>PUBLICATION_PDF_LIMIT)throw new PublicationDocumentError("Le PDF dépasse 8 Mo.",413);
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(Buffer.from(bytes.subarray(0,5)).toString()!=="%PDF-"||!Buffer.from(bytes.subarray(-1024)).toString().includes("%%EOF"))throw new PublicationDocumentError("Le fichier n’est pas un PDF valide.");
 return {bytes,nom:file.name.replace(/[\x00-\x1f\x7f]/g,"").slice(0,200)};
}
