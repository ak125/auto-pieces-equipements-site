import { rec, str, instant, num, syntheticId, envelopeErrors } from './common.mjs';
import { eligibility, evaluateSegment } from './data.mjs';
import { prepareContent, qualifyRequest, prepareQuote, reviewReply, neutralInvitation, qrBrief } from './studio.mjs';
import { paidPlan, commercialReport } from './insights.mjs';
import { foldEvents } from './operations.mjs';
import { openingAt, parisDate, approvalFingerprint } from '../marketing-local.mjs';

/** Snapshot decision calculator. No participant storage, timer, transport or durable execution.
 * @param {unknown} input
 * @param {{now:Date,hours:import('../store-hours.mjs').StoreHours,allowed:Set<string>}} context */
export function simulateJourney(input,context) {
  const v=rec(input),{now,hours,allowed}=context;
  /** @param {string} decision @param {unknown} output @param {string[]} [reasons] */
  const result=(decision,output,reasons=[])=>({
    journey:v.journey,runId:v.runId,decision,output,reasons,metric:v.metric,externalCalls:0,activated:false,
    schemaVersion:'2.0.0',timeZone:'Europe/Paris',decidedAt:now.toISOString(),
    actionKey:approvalFingerprint({project:v.project,journey:v.journey,object:v.object,version:v.version}),
    reentry:'Explicit new source version and reviewed policy only',compensation:'No external effect here; accepted provider messages cannot be recalled by a Git rollback.'
  });
  const errors=envelopeErrors(v);
  if(errors.length || !syntheticId(v.object) || !str(v.source) || !str(v.trigger) ||
    !str(v.metric) || !str(v.version) || !(instant(v.snapshotAt)<=now.getTime())) return result('blocked',null,[...errors,'SNAPSHOT']);
  if(v.version!==v.currentVersion) return result('recheck',null,['SOURCE_VERSION']);
  const events=foldEvents(v.events,str(v.object),now);
  if(events.errors.length) return result('blocked',null,events.errors);
  if(events.stop && !['J12','J15','J18'].includes(str(v.journey))) return result('stop','Aucune relance : réponse, décision ou sortie déjà observée.',['SOURCE_STOP']);
  const marketing=['J07','J08','J09','J10','J11'];
  if(marketing.includes(str(v.journey)) && !eligibility(v.person,'email','marketing',now).eligible) return result('stop','Aucun changement de canal pour contourner une opposition.',['ELIGIBILITY']);
  switch(v.journey) {
    case 'J01': case 'J02': {
      const q=qualifyRequest(v.request);
      return result(q.decision==='unverified-reception'?'blocked':q.decision==='ask'?'ask':'human',q);
    }
    case 'J03': case 'J04': {
      const q=prepareQuote(v.quote,now);
      if(q.errors.length) return result('blocked',q,q.errors);
      if(v.journey==='J03') return result('draft',q);
      const p=rec(v.policy);
      if(num(p.attempts)===null || num(p.maxAttempts)===null || Number(p.attempts)<0 || Number(p.maxAttempts)<1) return result('blocked',null,['REMINDER_POLICY']);
      if(Number(p.attempts)>=Number(p.maxAttempts)) return result('human','Limite atteinte : examiner si un appel humain est pertinent, sans relance automatique.');
      if(!Number.isFinite(instant(p.dueAt))) return result('blocked',null,['DUE_AT']);
      if(instant(p.dueAt)>now.getTime()) return result('defer',{dueAt:p.dueAt});
      return result('propose-reminder',{text:'Souhaitez-vous une précision sur le devis en cours ? Merci de nous indiquer votre décision.',quoteVersion:rec(v.quote).version,stop:'Réponse, refus, vente, indisponibilité, expiration ou nouvelle version.'});
    }
    case 'J05': {
      const a=rec(v.availability);
      if(a.requested!==true || !str(a.evidence) || !(instant(a.confirmedAt)<=now.getTime() && instant(a.expiresAt)>now.getTime()) ||
        !['supplier','store'].includes(str(a.location))) return result('blocked',null,['AVAILABILITY']);
      return result('draft',a.location==='supplier'?'Disponibilité fournisseur confirmée dans la fixture ; délai et stock magasin à vérifier. Aucune réservation.':'Disponibilité magasin déclarée par la source ; recontrôler avant réponse. Aucune réservation.');
    }
    case 'J06': {
      const r=rec(v.reservation);
      if(r.official!==true || r.status!=='reserved' || !str(r.evidence) || !(instant(r.expiresAt)>now.getTime())) return result('blocked',null,['RESERVATION']);
      if(!openingAt(hours,now)) return result('defer','Magasin fermé selon la source des horaires, ne pas annoncer de retrait immédiat.');
      return result('draft','Votre réservation existe dans la source fictive habilitée. Préparer un rappel de retrait après contrôle du créneau et du statut.');
    }
    case 'J07': {
      const s=rec(v.subscription);
      if(s.received!==true || s.confirmed!==true || s.purpose!=='newsletter' || !str(s.evidence)) return result('blocked',null,['RECEPTION_CONFIRMATION']);
      return result('draft','Bienvenue. Vous pourrez choisir vos thèmes, votre langue et votre cadence dans le service de préférences autorisé. Aucun abonnement effectué ici.');
    }
    case 'J08': case 'J09': case 'J14': {
      const content=prepareContent(v.campaign,now,allowed);
      if(v.alreadyPublished===true) return result('stop','Publication déjà rapprochée : aucun second envoi.');
      return result(content.errors.length?'blocked':'draft',content,content.errors);
    }
    case 'J10': {
      const rule={event:'sale',since:rec(v.policy).since,min:0,max:0};
      const segment=evaluateSegment(v.person,rule,now);
      if(segment.match!==true) return result('blocked',segment,['INACTIVITY_NOT_ESTABLISHED']);
      return result('draft',{text:'Avez-vous un besoin de pièce pour lequel le magasin peut vous renseigner ? Aucune offre ni fréquence d’achat n’est déduite.',explanation:segment.reasons,policy:'One candidate contact; stop on reply/refusal/purchase.'});
    }
    case 'J11':
      return rec(v.person).kind==='professional'?result('draft','Auto Pièces Équipements vous propose un échange sur vos besoins de pièces. Les références, disponibilités et éventuelles conditions professionnelles restent à confirmer, sans partenariat présumé.'):result('blocked',null,['DECLARED_PROFESSIONAL']);
    case 'J12': {
      const reply=reviewReply(v.review);return result(reply.decision,reply);
    }
    case 'J13': {
      const invitation=neutralInvitation(v.experience);return result(invitation?'draft':'stop',invitation);
    }
    case 'J15':
      return result('change-proposal',{source:'data/store-hours.json',date:parisDate(now),openNow:openingAt(hours,now),
        text:'Comparer les contenus prévus à la source confirmée ; préparer un lot de correction, sans modifier les informations publiques.'});
    case 'J16': {
      const brief=qrBrief(v.qr,now,allowed);return result(brief.status,brief);
    }
    case 'J17': {
      const plan=paidPlan(v.paid,allowed);return result(plan.status,plan);
    }
    case 'J18': {
      const report=commercialReport(v.report);
      return result(report.status,report,report.errors);
    }
    default:return result('blocked',null,['JOURNEY_UNKNOWN']);
  }
}
