import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PROJECT, VERSION, rec, rows, list, str, instant, envelopeErrors, noPrivateText } from './marketing/common.mjs';
import { importSimulation, evaluateSegment, eligibility, scoreProfile, privacyPlan } from './marketing/data.mjs';
import { prepareContent, qualifyRequest, prepareQuote, reviewReply, neutralInvitation, qrBrief, compareBusinessFacts } from './marketing/studio.mjs';
import { compareSources, commercialReport, loyaltyProposal, experimentReport, forecast, paidPlan, groupAlerts } from './marketing/insights.mjs';
import { arbitrate, checkMandate, realAction, simulateProvider, reconcile, suspendSimulation, validateJob, channelCheck, smsUnits, auditDelivery, inspectSkillIndex } from './marketing/operations.mjs';
import { simulateJourney } from './marketing/journeys.mjs';
import { parseStoreHours } from './store-hours.mjs';
import { loadAllowedLinks, reviewDossier, renderNewsletter } from './marketing-local.mjs';
export const commands=['capabilities','demo','import','segment','score','prepare','qualify','quote','review','invite','qr',
  'journey','preflight','mandate','execute','provider-test','reconcile','suspend','arbitrate','plan-job','channel',
  'report','privacy','compare','loyalty','experiment','forecast','paid','alerts','render','delivery-audit','skill-index','business-facts'];
/** JSON is unknown until the operation validates its schema. @param {string|URL} file */
async function readJson(file) {
  const pathname=file instanceof URL?file.pathname:file;
  if(!pathname.endsWith('.json') || (await stat(file)).size>1048576) throw new Error('INPUT');
  /** @type {unknown} */ const value=JSON.parse(await readFile(file,'utf8'));
  return value;
}
/** @returns {Promise<{now:Date,hours:import('./store-hours.mjs').StoreHours,allowed:Set<string>}>} */
async function context() {
  return {now:new Date(),hours:parseStoreHours(await readJson(new URL('../data/store-hours.json',import.meta.url))),allowed:await loadAllowedLinks()};
}
/** Deterministic, no network or state writes. @param {string} command @param {unknown} input @param {Awaited<ReturnType<typeof context>>} ctx @returns {unknown} */
export function dispatch(command,input,ctx) {
  const r=rec(input),{now,allowed}=ctx;
  if(command==='capabilities') return {
    local:{implementation:'candidate',data:'synthetic-only',externalCalls:0},
    connections:[{name:'Places diagnostic',read:'implemented, access not verified',write:'absent'},
      {name:'email/sms/whatsapp/GBP/ads',read:'not connected',write:'unavailable'},
      {name:'CRM/reservations/subscribers/mandates',read:'not established',write:'unavailable'}],
    runtime:{hermes:'not tested in Hermes',codex:'see VALIDATION-V2.md for discovery vs invocation'},
    activation:false,commands
  };
  const gate=envelopeErrors(r);
  if(gate.length || r.schemaVersion!==VERSION || !str(r.runId) || !noPrivateText(r)) return {status:'blocked',errors:[...gate,'SCHEMA_OR_PRIVACY']};
  switch(command) {
    case 'import': {
      const out=importSimulation(r,list(r.existing));
      return {created:out.created,count:out.records.length,errors:out.errors,executed:false,
        references:out.records.map(p=>p.id),rollback:'No persistence performed.'};
    }
    case 'segment': {
      const imported=importSimulation(r);
      if(imported.errors.length) return {status:'blocked',errors:imported.errors};
      const results=imported.records.map(p=>({subjectRef:p.id,...evaluateSegment(p,r.rule,now),
        eligibility:eligibility(p,str(r.channel)||'email','marketing',now)}));
      return {mode:['estimate','snapshot','dynamic'].includes(str(r.mode))?r.mode:'estimate',
        count:results.filter(x=>x.match===true && x.eligibility.eligible).length,
        unknown:results.filter(x=>x.match===null).length,results,
        nextCheck:'Dynamic/snapshot audiences both require fresh preferences and bounds at execution.'};
    }
    case 'score': return scoreProfile(r.person,now,r.policy);
    case 'prepare':return prepareContent(r,now,allowed);
    case 'qualify':return qualifyRequest(r.request);
    case 'quote':return prepareQuote(r.quote,now);
    case 'review':return reviewReply(r.review);
    case 'invite':return {text:neutralInvitation(r.experience)};
    case 'qr':return qrBrief(r.qr,now,allowed);
    case 'journey':return simulateJourney(r,ctx);
    case 'preflight':return reviewDossier(r.dossier,{now,allowedLinks:allowed});
    case 'mandate':return checkMandate(r.action,r.grant,now);
    case 'execute':return realAction(r.action);
    case 'provider-test':return simulateProvider(r.action,r.prior);
    case 'reconcile':return reconcile(r.previous,r.receipt);
    case 'suspend':return suspendSimulation(r.items,r.action,r.grant,now);
    case 'arbitrate':return arbitrate(r.items,r.history,r.policy,now);
    case 'plan-job':return validateJob(r.job,r.context);
    case 'channel':return {check:channelCheck(r.channel,now),sms:r.message?smsUnits(str(r.message)):null};
    case 'report':return commercialReport(r.report);
    case 'privacy':return privacyPlan(r.person,str(r.operation),now,Number(r.retentionDays));
    case 'compare':return compareSources(r.sources,now);
    case 'loyalty':return loyaltyProposal(r.sales,r.policy);
    case 'experiment':return experimentReport(r.participants,r.plan,now);
    case 'forecast':return forecast(r.observations,r.policy);
    case 'paid':return paidPlan(r.paid,allowed);
    case 'alerts':return groupAlerts(r.alerts);
    case 'render':return renderNewsletter(r.dossier,{now,allowedLinks:allowed});
    case 'delivery-audit':return auditDelivery(r.observations,now);
    case 'skill-index':return inspectSkillIndex(r.index,r.context);
    case 'business-facts':return compareBusinessFacts(r.authoritative,r.observations);
    default:throw new Error('COMMAND');
  }
}
/** @param {string[]} args */
async function main(args) {
  const command=args[0];
  if(command==='--help' && args.length===1) {
    console.log('Usage: node scripts/marketing-workbench.mjs COMMAND [synthetic.json] [--now ISO_WITH_OFFSET]\n'+
      commands.join(', ')+'\nSimulation only. demo uses anchored synthetic corpus, fixed 2026-10-02 clock. No network, credentials or persistence.');return;
  }
  if(!command || !commands.includes(command)) throw new Error('COMMAND');
  const ctx=await context();
  const expected=command==='demo' || command==='capabilities'?1:2;
  if(args.length!==expected && !(args.length===expected+2 && args[expected]==='--now')) throw new Error('ARGS');
  if(args.length>expected) {
    if(!Number.isFinite(instant(args[expected+1]))) throw new Error('TIME');
    ctx.now=new Date(str(args[expected+1]));
  } else if(command==='demo') ctx.now=new Date('2026-10-02T10:00:00Z');
  /** @type {unknown} */ let result;
  if(command==='demo') {
    const fixtures=await readJson(new URL('../marketing/assistant-local/recette-v2/scenarios.json',import.meta.url));
    result=list(fixtures).map(f=>simulateJourney(f,ctx));
  } else {
    const input=command==='capabilities'?{}:await readJson(args[1]??'');
    result=dispatch(command,input,ctx);
  }
  const check=command==='channel'?rec(rec(result).check):rec(result);
  const failed=rec(result).status==='blocked' || ['blocked','unverified-reception'].includes(str(rec(result).decision)) ||
    Boolean(str(rec(result).error)) || check.ready===false || check.valid===false ||
    check.preconditionsMet===false || check.draftReady===false || check.scopeMatches===false ||
    (Array.isArray(rec(result).errors) && list(rec(result).errors).length>0) ||
    (Array.isArray(result) && rows(result).some(r=>r.decision==='blocked'));
  const status=failed?'blocked':rec(result).status==='unavailable'?'unavailable':'completed-simulation';
  console.log(JSON.stringify({project:PROJECT,environment:'simulation',schemaVersion:VERSION,
    canExecute:false,externalCalls:0,status,result},null,2));
  process.exitCode=status==='blocked'?1:status==='unavailable'?2:0;
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(()=>{console.error(JSON.stringify({error:'INVALID_REQUEST',externalCalls:0,canExecute:false}));process.exitCode=1;});
}
