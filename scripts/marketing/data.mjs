import { PROJECT, rec, rows, list, str, num, instant, syntheticId, envelopeErrors, noPrivateText } from './common.mjs';

/** @param {unknown} v */
export function normalizeEmail(v) {
  const s=str(v); const at=s.lastIndexOf('@');
  return at>0 ? s.slice(0,at)+'@'+s.slice(at+1).toLowerCase() : '';
}
/** Pure import proposal; records never persisted, external IDs never merged by address.
 * @param {unknown} input @param {unknown[]} [existing] */
export function importSimulation(input,existing=[]) {
  /** @type {{row:number,code:string}[]} */ const errors=[];
  const gate=envelopeErrors(input);
  if(gate.length) return {records:[],created:0,errors:gate.map(code=>({row:0,code})),executed:false};
  const incoming=list(rec(input).records);
  if(incoming.length>1000 || existing.length>1000) return {records:[],created:0,errors:[{row:0,code:'LIMIT'}],executed:false};
  /** @type {Map<string,Record<string,unknown>>} */ const byId=new Map();
  let created=0;
  for (const [i,value] of [...existing,...incoming].entries()) {
    const r=rec(value), id=str(r.id), email=normalizeEmail(r.email);
    let code='';
    if(r.project!==PROJECT) code='PROJECT';
    else if(!syntheticId(id) || !/^[^\s@]+@[^\s@]+\.invalid$/.test(email) || !noPrivateText(r)) code='SYNTHETIC_ONLY';
    else if([...byId.values()].some(p=>p.email===email && p.id!==id)) code='AMBIGUOUS';
    else if(byId.has(id) && byId.get(id)?.email!==email) code='IDENTITY_CHANGED';
    if(code) { errors.push({row:i+1,code}); continue; }
    const old=byId.get(id);
    // No stale import can remove a suppression or silently update business relations.
    const preferences=[...rows(old?.preferences),...rows(r.preferences)];
    const unique=[...new Map(preferences.map(p=>[JSON.stringify(p),p])).values()];
    byId.set(id,{...(old??r),id,project:PROJECT,email,preferences:unique});
    if(!old && i>=existing.length) created++;
  }
  return {records:[...byId.values()],created,errors,executed:false};
}
/** @param {unknown} person @param {string} channel @param {string} purpose @param {Date} now */
export function eligibility(person,channel,purpose,now) {
  const p=rec(person);
  if(!Array.isArray(p.preferences) || rows(p.preferences).some(v=>!str(v.channel) || !str(v.purpose) || !str(v.brand)))
    return {eligible:false,reason:'PREFERENCE_UNKNOWN'};
  const prefs=rows(p.preferences).filter(v=>v.channel===channel && v.purpose===purpose && v.brand==='APE');
  if(prefs.some(v=>!Number.isFinite(instant(v.at)) || !['allowed','denied','paused','complaint','hard-bounce'].includes(str(v.state))))
    return {eligible:false,reason:'PREFERENCE_UNKNOWN'};
  const known=p.project===PROJECT && syntheticId(p.id) && Number.isFinite(now.getTime());
  const past=prefs.filter(v=>instant(v.at)<=now.getTime());
  // Explicit suppression is sticky until the authoritative source resolves it; imports never resolve it.
  if(past.some(v=>['denied','paused','complaint','hard-bounce'].includes(str(v.state)))) return {eligible:false,reason:'SUPPRESSED'};
  const latest=past.sort((a,b)=>instant(b.at)-instant(a.at))[0];
  if(!known || !latest || latest.state!=='allowed' || !str(latest.evidence) ||
    latest.country!=='FR' || !(instant(latest.expiresAt)>now.getTime())) return {eligible:false,reason:'UNKNOWN_OR_STALE'};
  return {eligible:true,reason:'SIMULATED_EVIDENCE'};
}
/** @typedef {{match:boolean|null,reasons:string[]}} Match */
/** Three-valued logic preserves unknown history under NOT. @param {unknown} person @param {unknown} rule @param {Date} now @param {number} [depth] @returns {Match} */
export function evaluateSegment(person,rule,now,depth=0) {
  const p=rec(person), r=rec(rule);
  /** @param {boolean|null} match @param {string} reason @returns {Match} */
  const out=(match,reason)=>({match,reasons:[reason]});
  if(p.project!==PROJECT || !syntheticId(p.id)) return out(false,'PROJECT_OR_ID');
  if(depth>12 || !Number.isFinite(now.getTime())) return out(null,'LIMIT_OR_TIME');
  const ops=['all','any','not','field','event','sequence','relation'].filter(k=>Object.hasOwn(r,k));
  if(ops.length!==1) return out(null,'RULE_SCHEMA');
  if('all' in r || 'any' in r) {
    const children=list(r.all??r.any);
    if(!children.length || children.length>30) return out(null,'RULE_SCHEMA');
    const results=children.map(c=>evaluateSegment(p,c,now,depth+1));
    const values=results.map(v=>v.match);
    const match='all' in r ? (values.includes(false)?false:values.includes(null)?null:true) :
      (values.includes(true)?true:values.includes(null)?null:false);
    return {match,reasons:results.flatMap(v=>v.reasons)};
  }
  if('not' in r) { const result=evaluateSegment(p,r.not,now,depth+1);
    return {match:result.match===null?null:!result.match,reasons:['NOT',...result.reasons]}; }
  if('field' in r) {
    if(!['kind','need','zone','language'].includes(str(r.field))) return out(null,'FIELD_NOT_ALLOWED');
    const value=p[str(r.field)];
    return out(value===undefined || value===null ? null : value===r.equals,'FIELD:'+str(r.field));
  }
  if('relation' in r) {
    const target=rec(r.relation);
    if(!syntheticId(target.id) || !str(target.type)) return out(null,'RELATION_SCHEMA');
    if(!Array.isArray(p.relations) || rows(p.relations).some(v=>!syntheticId(v.id) || !str(v.type)))
      return out(null,'RELATIONS_UNKNOWN');
    return out(rows(p.relations).some(v=>v.id===target.id && v.type===target.type &&
      (target.category===undefined || v.category===target.category)),'EXACT_OBJECT');
  }
  const since=instant(r.since), until=r.until===undefined?now.getTime():instant(r.until);
  if(!Number.isFinite(since) || !Number.isFinite(until) || until>now.getTime() || since>until) return out(null,'WINDOW');
  const history=instant(p.historyFrom);
  if(!Number.isFinite(history) || history>since) return out(null,'HISTORY_UNKNOWN');
  const observed=observedEvents(p.events,now);
  if(observed.errors.length) return out(null,observed.errors[0]??'HISTORY_UNKNOWN');
  const events=observed.events.filter(e=>instant(e.at)>=since && instant(e.at)<=until)
    .sort((a,b)=>instant(a.at)-instant(b.at)||str(a.id).localeCompare(str(b.id)));
  if('sequence' in r) {
    const sequence=list(r.sequence).map(str);
    if(!sequence.length || sequence.some(v=>!v)) return out(null,'SEQUENCE_SCHEMA');
    let index=0, last=-Infinity;
    for(const e of events) if(e.kind===sequence[index] && instant(e.at)>last) { index++; last=instant(e.at); }
    return out(index===sequence.length,'ORDERED_SEQUENCE');
  }
  const min=num(r.min), max=r.max===undefined?Infinity:num(r.max);
  if(min===null || min<0 || max===null || max<min || !str(r.event)) return out(null,'COUNT_SCHEMA');
  const count=new Set(events.filter(e=>e.kind===r.event).map(e=>str(e.id))).size;
  return out(count>=min && count<=max,'EVENT_COUNT:'+count);
}
/** Validate complete supplied history before deriving absence or totals.
 * @param {unknown} input @param {Date} now */
function observedEvents(input,now) {
  /** @type {Map<string,Record<string,unknown>>} */ const byId=new Map();
  const errors=[];
  if(!Array.isArray(input) || input.length>1000 || !Number.isFinite(now.getTime()))
    return {events:[],errors:['HISTORY_UNKNOWN']};
  for(const e of rows(input)) {
    if(!syntheticId(e.id) || !str(e.kind) || !(instant(e.at)<=now.getTime())) {
      errors.push('EVENT_SCHEMA');continue;
    }
    const old=byId.get(str(e.id));
    if(old && (old.kind!==e.kind || instant(old.at)!==instant(e.at) || old.amount!==e.amount || old.currency!==e.currency))
      errors.push('EVENT_CONFLICT');
    else byId.set(str(e.id),e);
  }
  return {events:[...byId.values()],errors:[...new Set(errors)]};
}
/** Observed bounded-window score, weights are hypotheses. @param {unknown} person @param {Date} now @param {unknown} policy */
export function scoreProfile(person,now,policy) {
  const p=rec(person), w=rec(policy), observed=observedEvents(p.events,now), events=observed.events;
  const known=p.project===PROJECT && syntheticId(p.id) && !observed.errors.length &&
    Number.isFinite(instant(p.historyFrom)) && instant(p.historyFrom)<=now.getTime() &&
    !events.some(e=>e.kind==='sale' && (num(e.amount)===null || Number(e.amount)<0 || e.currency!=='EUR'));
  const sales=[...new Map(events.filter(e=>e.kind==='sale' && syntheticId(e.id) &&
    instant(e.at)>=instant(p.historyFrom) && instant(e.at)<=now.getTime() && num(e.amount)!==null &&
    Number(e.amount)>=0 && e.currency==='EUR').map(e=>[str(e.id),e])).values()];
  const recency=known && sales.length ? (now.getTime()-Math.max(...sales.map(e=>instant(e.at))))/86400000 : null;
  const halfLife=num(w.halfLifeDays);
  const fit=p.kind==='professional'?(num(w.professional)??0):0;
  const engagement=recency!==null && halfLife!==null && halfLife>0 ? (num(w.engagement)??0)*2**(-recency/halfLife):0;
  return {version:'2.0.0',hypotheticalWeights:true,score:fit+engagement,
    contributions:[{name:'declared-public',value:fit},{name:'observed-recency',value:engagement}],
    recencyDays:recency,frequency:known?sales.length:null,amount:known?sales.reduce((s,e)=>s+Number(e.amount),0):null,
    currency:'EUR',windowFrom:known?p.historyFrom:null,predictedLtv:null,
    missing:known?[]:['purchase-history'],limitations:['Observed window only; no calibrated propensity or lifetime prediction.']};
}
/** Documentary erasure/export plan, not a deletion service. @param {unknown} person @param {string} operation @param {Date} now @param {number} retentionDays */
export function privacyPlan(person,operation,now,retentionDays) {
  const p=rec(person);
  if(p.project!==PROJECT || !syntheticId(p.id) || !['erase','export'].includes(operation) ||
    !Number.isFinite(retentionDays) || retentionDays<0) return {error:'PRIVACY_SCHEMA',executed:false};
  return {subjectRef:p.id,operation,deleteProfile:operation==='erase',executed:false,
    fields:operation==='export'?['identity','preferences','relations','source-references']:[],
    suppressionRequired:rows(p.preferences).some(v=>['denied','complaint','hard-bounce'].includes(str(v.state))),
    retentionReviewAt:new Date(now.getTime()+retentionDays*86400000).toISOString(),
    retentionIsHypothesis:true,requires:'Authorised source owner, policy and identity verification; preserve minimal suppression externally.'};
}
