// Only controlled diagnostic codes are retained: never provider bodies or credentials.
const OAUTH_CODES = ['invalid_client','invalid_grant','invalid_request','unauthorized_client','deleted_client'];
const STAGES = ['connection','credentials','authorization','recipients','sending','confirmation'];
export async function ensureMailDelivery(env) {
 await env.DB.prepare(`CREATE TABLE IF NOT EXISTS message_delivery (
 message_id TEXT PRIMARY KEY, provider TEXT NOT NULL, status TEXT NOT NULL,
 error_code TEXT, stage TEXT, http_status INTEGER, checked_le TEXT NOT NULL
 )`).run();
}
export function mailFailure(error) {
 const stage=STAGES.includes(error?.mailStage)?error.mailStage:null;
 const http=Number.isInteger(error?.httpStatus)&&error.httpStatus>=400&&error.httpStatus<=599?error.httpStatus:null;
 const oauth=OAUTH_CODES.includes(error?.oauthCode)?error.oauthCode:null;
 const code=oauth || (stage==='credentials'?'credentials_unreadable':stage==='recipients'?'invalid_recipients':error?.name==='TimeoutError'||error?.name==='AbortError'?'timeout':http===401?'authentication':http===403?'permission':http===429?'quota':http>=500?'provider_unavailable':http?'request_rejected':stage==='confirmation'?'missing_confirmation':'unknown');
 return {error_code:code,stage,http_status:http};
}
export async function recordMailDelivery(env,id,provider,{sent=false,error=null,code=null}={}) {
 try {
  const failure=sent?{error_code:null,stage:'confirmation',http_status:null}:code==='no_provider'?{error_code:code,stage:'connection',http_status:null}:mailFailure(error);
  await ensureMailDelivery(env);
  await env.DB.prepare('INSERT INTO message_delivery(message_id,provider,status,error_code,stage,http_status,checked_le) VALUES(?,?,?,?,?,?,?) ON CONFLICT(message_id) DO UPDATE SET provider=excluded.provider,status=excluded.status,error_code=excluded.error_code,stage=excluded.stage,http_status=excluded.http_status,checked_le=excluded.checked_le').bind(id,['gmail','brevo','resend'].includes(provider)?provider:'none',sent?'accepted':'unconfirmed',failure.error_code,failure.stage,failure.http_status,new Date().toISOString()).run();
 } catch { console.warn('mail_diagnostic_storage_unavailable'); }
}
export async function getMailDelivery(env,id) {
 await ensureMailDelivery(env);
 return env.DB.prepare('SELECT provider,status,error_code,stage,http_status,checked_le FROM message_delivery WHERE message_id=?').bind(id).first();
}
export function deliveryDescription(row) {
 if(!row)return 'La cause n’a pas été enregistrée pour cet ancien envoi.';
 return {
 invalid_grant:'L’autorisation Google n’est plus valide. Reconnectez Gmail dans Réglages.',
 invalid_client:'Google ne reconnaît pas les identifiants de l’application. Vérifiez la configuration Google.',
 deleted_client:'L’application Google a été supprimée. Vérifiez la configuration Google.',
 unauthorized_client:'Google n’autorise pas cette application à envoyer des emails.',
 invalid_request:'Google a refusé la demande d’autorisation.',
 credentials_unreadable:'La connexion Gmail enregistrée ne peut plus être lue. Reconnectez Gmail dans Réglages.',
 invalid_recipients:'Les adresses de notification sont invalides. Vérifiez Réglages.',
 no_provider:'Aucun service d’envoi utilisable n’a été trouvé. Vérifiez la connexion Gmail dans Réglages.',
 timeout:'Le service n’a pas répondu à temps. Vérifiez les emails envoyés avant toute nouvelle tentative.',
 authentication:'Le service a refusé l’authentification. Vérifiez sa connexion.',
 permission:'Le service a refusé l’envoi pour un problème d’autorisation. Vérifiez les droits de l’application.',
 quota:'Le service a limité les envois. Vérifiez les quotas et les emails envoyés.',
 provider_unavailable:'Le service d’envoi a rencontré une erreur temporaire.',
 request_rejected:'Le service a refusé la demande d’envoi.',
 missing_confirmation:'Le service a répondu sans confirmer l’envoi. Vérifiez les emails envoyés avant de réessayer.',
 unknown:'Une erreur non identifiée a interrompu l’envoi. Aucun détail sensible n’a été conservé.'
 }[row.error_code]||'Le service a accepté l’email ; cela ne confirme pas sa réception dans la boîte du destinataire.';
}
