import { PROJECT, rec, rows, list, str, num, instant, syntheticId } from './common.mjs';
import { posix, win32 } from 'node:path';
import { eligibility } from './data.mjs';
import { parisDate } from '../marketing-local.mjs';
/** Structural comparison only: authenticity can only come from a future trusted service.
 * @param {unknown} input @param {unknown} authorityFixture @param {Date} now */
export function checkMandate(input,authorityFixture,now) {
  const a=rec(input), g=rec(authorityFixture), errors=[];
  /** Exact names avoid silently widening a fixture's scope through normalization. @param {unknown} value */
  const name=value=>typeof value==='string' && value.length>0 && value===value.trim();
  /** Validate the entire list, including sparse slots, before checking membership. @param {unknown} value */
  const names=value=>Array.isArray(value) && value.length>0 && value.length<=1000 && Array.from(value).every(name);
  if(a.project!==PROJECT || g.project!==PROJECT || a.environment!=='simulation' || g.environment!=='simulation') errors.push('SCOPE');
  if(g.issuer!=='fixture-authority' || g.validity!=='fixture-only' || !syntheticId(g.id) ||
    !syntheticId(g.approver) || !syntheticId(a.actor) || a.actor!==g.actor) errors.push('AUTHORITY_UNVERIFIED');
  if(g.revoked!==false || !(instant(g.startsAt)<=now.getTime() && instant(g.expiresAt)>now.getTime())) errors.push('EXPIRED_OR_REVOKED');
  if(g.timeZone!=='Europe/Paris' || !syntheticId(a.account) || g.account!==a.account ||
    !name(a.channel) || g.channel!==a.channel || g.currency!=='EUR' || a.currency!=='EUR') errors.push('ACCOUNT_CHANNEL');
  for(const [singular,plural] of [['operation','operations'],['family','families'],['template','templates'],['revision','revisions']]) {
    if(!singular || !plural || !name(a[singular]) || !names(g[plural]) || !list(g[plural]).includes(a[singular])) errors.push('VERSION_OR_OPERATION');
  }
  if(!name(a.audienceRule) || a.audienceRule!==g.audienceRule || !names(g.exclusions) || !names(a.exclusions) ||
    !list(g.exclusions).every(e=>list(a.exclusions).includes(e))) errors.push('AUDIENCE_EXPANDED');
  for(const [actual,cap] of [['contacts','maxContacts'],['cost','maxCost'],['frequency','maxFrequency']]) {
    if(!actual || !cap || num(a[actual])===null || num(g[cap])===null || Number(a[actual])<0 ||
      Number(g[cap])<0 || Number(a[actual])>Number(g[cap]) ||
      (actual!=='cost' && (!Number.isSafeInteger(a[actual]) || !Number.isSafeInteger(g[cap])))) errors.push('LIMIT');
  }
  if(!names(g.stopConditions)) errors.push('STOP_RULE');
  return {scopeMatches:errors.length===0,errors:[...new Set(errors)],permissionVerified:false,
    canExecute:false,requires:'Trusted account-side authorization adapter; fixture matching is not approval.'};
}
/** One in-memory planning batch, NOT a concurrent quota reservation service.
 * @param {unknown} input @param {unknown} historical @param {unknown} policy @param {Date} now */
export function arbitrate(input,historical,policy,now) {
  const p=rec(policy);
  /** @type {Record<string, unknown>[]} */
  const items=rows(input).map(a=>({...a,id:str(a.id),account:str(a.account),channel:str(a.channel)}));
  const valid=['contactCap','accountCap','channelCap'].every(k=>num(p[k])!==null && Number.isSafeInteger(p[k]) && Number(p[k])>=0) &&
    num(p.costCap)!==null && Number(p.costCap)>=0 &&
    ['calendar-day','rolling'].includes(str(p.window)) && list(p.hours).length===2 &&
    list(p.hours).every(h=>num(h)!==null && Number(h)>=0 && Number(h)<=24) &&
    Number(list(p.hours)[0])<Number(list(p.hours)[1]) &&
    (str(p.window)!=='rolling' || (num(p.hoursBack)!==null && Number(p.hoursBack)>0));
  if(!valid || !Array.isArray(input) || items.length>1000 || !Number.isFinite(now.getTime())) return {decisions:[],errors:['POLICY_OR_LIMIT'],atomicReservation:false};
  const keys=new Set();
  for(const a of items) {
    if(syntheticId(a.id) && keys.has(a.id)) return {decisions:[],errors:['DUPLICATE_CANDIDATE'],atomicReservation:false};
    keys.add(a.id);
  }
  if(!Array.isArray(historical) || historical.length>1000 ||
    rows(historical).some(h=>!(instant(h.at)<=now.getTime()) || num(h.cost)===null || Number(h.cost)<0 ||
    !['accepted','processed','uncertain','pending','proposed','scheduled','rejected','cancelled'].includes(str(h.status)) ||
    !syntheticId(h.subject) || !syntheticId(h.account) || !str(h.channel)))
    return {decisions:[],errors:['HISTORY_UNKNOWN'],atomicReservation:false};
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const clock=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  const hour=Number(clock.hour)+Number(clock.minute)/60+(Number(clock.second)+now.getUTCMilliseconds()/1000)/3600;
  const start=now.getTime()-Number(p.hoursBack??24)*3600000;
  /** @type {Record<string, unknown>[]} */
  const history=rows(historical).filter(h=>['accepted','processed','uncertain','pending','proposed','scheduled'].includes(str(h.status)) &&
    instant(h.at)<=now.getTime() && (str(p.window)==='calendar-day'?parisDate(new Date(instant(h.at)))===parisDate(now):instant(h.at)>=start))
    .map(h=>({...h,subject:str(h.subject),account:str(h.account),channel:str(h.channel)}));
  const reserved=[...history], decisions=[];
  for(const a of items.sort((x,y)=>Number(y.priority??0)-Number(x.priority??0)||str(x.id).localeCompare(str(y.id)))) {
    const person=rec(a.person), subject=str(person.id), cost=num(a.cost);
    let reason='AVAILABLE',decision='propose';
    if(!eligibility(person,str(a.channel),'marketing',now).eligible || a.stop===true) {decision='exclude';reason='PREFERENCE_OR_STOP';}
    else if(!syntheticId(a.id) || !syntheticId(a.account) || cost===null || cost<0) {decision='human';reason='UNKNOWN_COST_OR_ACCOUNT';}
    else if(hour<Number(list(p.hours)[0]) || hour>=Number(list(p.hours)[1])) {decision='defer';reason='HOURS_PARIS';}
    else if(reserved.filter(h=>h.subject===subject).length>=Number(p.contactCap) ||
      reserved.filter(h=>h.account===a.account).length>=Number(p.accountCap) ||
      reserved.filter(h=>h.channel===a.channel && h.account===a.account).length>=Number(p.channelCap) ||
      reserved.filter(h=>h.account===a.account).reduce((sum,h)=>sum+Number(h.cost??Infinity),0)+cost>Number(p.costCap)) {decision='defer';reason='SHARED_CAP';}
    decisions.push({id:a.id,subjectRef:subject,decision,reason});
    if(decision==='propose') reserved.push({subject,account:a.account,channel:a.channel,cost,at:now.toISOString(),status:'proposed'});
  }
  return {decisions,errors:[],atomicReservation:false,limit:'In-memory batch only; shared durable reservation required before real concurrent sends.'};
}
/** @param {unknown} input @param {string} object @param {Date} now */
export function foldEvents(input,object,now) {
  /** @type {Map<string, {id:string,object:string,kind:string,occurredAt:string,receivedAt:string,version:string|null}>} */
  const byId=new Map();
  const errors=[],target=str(object);
  const stopKinds=['reply','refused','sale','closed','opt-out','withdrawn','collected','cancelled'];
  const knownKinds=new Set(['request','quote',...stopKinds]);
  if(!Array.isArray(input) || input.length>1000 || !syntheticId(object) || !Number.isFinite(now.getTime()))
    return {events:[],errors:['EVENT_HISTORY_UNKNOWN'],stop:null};
  for(const raw of input) {
    const e=rec(raw);
    if(!syntheticId(e.object)) {errors.push('EVENT_TIME_OR_SCHEMA');continue;}
    if(str(e.object)!==target) continue;
    const id=str(e.id),kind=str(e.kind),occurred=instant(e.occurredAt),received=instant(e.receivedAt);
    const version=Object.hasOwn(e,'version')?str(e.version):null;
    if(!syntheticId(id) || !knownKinds.has(kind) || version==='' ||
      !(occurred<=received && received<=now.getTime())) {errors.push('EVENT_TIME_OR_SCHEMA');continue;}
    const normalized={id,object:target,kind,version,occurredAt:new Date(occurred).toISOString(),receivedAt:new Date(received).toISOString()};
    const old=byId.get(id);
    if(old && (old.kind!==kind || old.occurredAt!==normalized.occurredAt || old.version!==version)) errors.push('EVENT_CONFLICT');
    // Repeated receipt of the same fact: retain its earliest observed reception, never input order.
    else if(!old || normalized.receivedAt<old.receivedAt) byId.set(id,normalized);
  }
  if(errors.length) return {events:[],errors:[...new Set(errors)].sort(),stop:null};
  const events=[...byId.values()].sort((a,b)=>instant(a.occurredAt)-instant(b.occurredAt)||
    instant(a.receivedAt)-instant(b.receivedAt)||a.id.localeCompare(b.id));
  return {events,errors:[],stop:events.some(e=>stopKinds.includes(e.kind))};
}
/** There is deliberately no real transport in this build. @param {unknown} _input */
export function realAction(_input) {return {status:'unavailable',reason:'No verified provider or authorization service connected.',externalCalls:0};}
/** Simulated receipt test adapter, no persistence and no network. @param {unknown} input @param {unknown} prior */
export function simulateProvider(input,prior) {
  const v=rec(input),key=str(v.key),outcome=str(v.outcome);
  const base={key:syntheticId(key)?key:null,externalCalls:0,retryAllowed:false,simulation:true};
  if(!syntheticId(key) || !['accepted','rejected','uncertain','quota','timeout'].includes(outcome))
    return {...base,status:'blocked',errors:['PROVIDER_ACTION_INVALID']};
  if(!Array.isArray(prior) || prior.length>1000)
    return {...base,status:'blocked',errors:['PROVIDER_HISTORY_INVALID']};
  const history=Array.from(prior,rec);
  if(history.some(r=>!syntheticId(r.key) ||
    !['pending','uncertain','accepted','processed','rejected','cancelled','quota'].includes(str(r.status)) ||
    (Object.hasOwn(r,'providerId') && !syntheticId(r.providerId))))
    return {...base,status:'blocked',errors:['PROVIDER_HISTORY_INVALID']};
  // This input is an unordered snapshot, not an ordered journal of provider transitions.
  /** @type {Map<string, {status:string, providerId:string}>} */
  const byKey=new Map();
  for(const r of history) {
    const id=str(r.key),status=str(r.status),providerId=str(r.providerId),old=byKey.get(id);
    if(old && (old.status!==status || (old.providerId && providerId && old.providerId!==providerId)))
      return {...base,status:'blocked',errors:['PROVIDER_HISTORY_CONFLICT']};
    byKey.set(id,{status,providerId:old?.providerId||providerId});
  }
  const previous=byKey.get(key);
  if(previous) return {...base,status:['uncertain','pending'].includes(previous.status)?'reconcile-required':'duplicate',errors:[]};
  return {...base,status:outcome==='timeout'?'uncertain':outcome,errors:[]};
}
/** Receipt proof is a fixture, not signature verification. @param {unknown} previous @param {unknown} receipt */
export function reconcile(previous,receipt) {
  const p=rec(previous),r=rec(receipt),key=str(p.key),before=str(p.status),after=str(r.status);
  if(!syntheticId(key) || key!==str(r.key) || !syntheticId(r.providerId) || !str(r.proof) ||
    !['pending','uncertain','accepted','processed','rejected','cancelled','quota'].includes(before) ||
    (Object.hasOwn(p,'providerId') && !syntheticId(p.providerId)) ||
    !['accepted','processed','rejected','cancelled'].includes(after))
    return {key,status:'uncertain',errors:['RECEIPT_OR_PREVIOUS_INVALID'],retryAllowed:false,simulation:true};
  if(Object.hasOwn(p,'providerId') && str(p.providerId)!==str(r.providerId))
    return {key,status:'conflict',errors:['PROVIDER_CONFLICT'],retryAllowed:false,simulation:true};
  // Without ordered provider evidence, never overwrite a known terminal state or regress processing.
  if(before!==after && !['pending','uncertain'].includes(before) && !(before==='accepted' && after==='processed'))
    return {key,status:'conflict',errors:['STATE_CONFLICT'],retryAllowed:false,simulation:true};
  return {key,status:after,providerId:str(r.providerId),errors:[],retryAllowed:false,simulation:true,
    meaning:'Provider state only, not human reading, physical visit or sale.'};
}
/** @param {unknown} input @param {unknown} action @param {unknown} grant @param {Date} now */
export function suspendSimulation(input,action,grant,now) {
  const a=rec(action),check=checkMandate(action,grant,now);
  const base={realEffects:0,recallGuaranteed:false,permissionVerified:false};
  if(a.operation!=='suspend' || !check.scopeMatches)
    return {...base,status:'blocked',items:[],error:'MANDATE',errors:['MANDATE']};
  if(!Array.isArray(input) || input.length>1000)
    return {...base,status:'blocked',items:[],errors:['SUSPENSION_INPUT']};
  const pending=['pending','proposed','scheduled'];
  const known=new Set([...pending,'accepted','processed','uncertain','rejected','cancelled','quota']);
  const scope=['project','account','channel','family','template','revision','audienceRule'];
  /** @type {Map<string,string>} */
  const byKey=new Map();
  const errors=[];
  for(const raw of input) {
    const r=rec(raw),key=str(r.key),status=str(r.status);
    if(!syntheticId(key) || !known.has(status)) {errors.push('SUSPENSION_INPUT');continue;}
    if(scope.some(field=>Object.hasOwn(r,field) && str(r[field])!==str(a[field]))) errors.push('SUSPENSION_SCOPE');
    const previous=byKey.get(key);
    if(previous && previous!==status) errors.push('SUSPENSION_CONFLICT');
    else byKey.set(key,status);
  }
  if(errors.length) return {...base,status:'blocked',items:[],errors:[...new Set(errors)].sort()};
  return {...base,status:'simulated',errors:[],items:[...byKey].sort(([a],[b])=>a.localeCompare(b))
    .map(([key,status])=>({key,status:pending.includes(status)?'cancelled':status})),
    requires:'Provider reconciliation for accepted or uncertain messages; item ownership and authority remain unverified.'};
}
/** @param {unknown} input @param {unknown} verifiedContext */
export function validateJob(input,verifiedContext) {
  const j=rec(input),c=rec(verifiedContext),errors=[];
  const workdir=str(c.workdir);
  const absolute=posix.isAbsolute(workdir) || (win32.isAbsolute(workdir) && win32.parse(workdir).root.length>1);
  if(j.project!==PROJECT || c.project!==PROJECT || !absolute || workdir.includes('\0') ||
    c.workdir!==workdir || j.workdir!==workdir) errors.push('WORKDIR');
  if(j.trusted!==true || c.trusted!==true || !syntheticId(c.account) || j.account!==c.account) errors.push('TRUST_OR_ACCOUNT');
  if(j.timeZone!=='Europe/Paris' || (j.command!=='report' && j.command!=='capabilities') || j.llm!==false) errors.push('JOB_SCOPE');
  if(!Number.isSafeInteger(j.maxItems) || Number(j.maxItems)<1 || Number(j.maxItems)>1000 ||
    !Number.isSafeInteger(j.timeoutMs) || Number(j.timeoutMs)<1 || Number(j.timeoutMs)>30000 || j.costCap!==0) errors.push('BUDGET');
  return {valid:!errors.length,errors,activated:false,permissionVerified:false,contextAuthenticity:'must be verified by runtime, not this document'};
}
/** GSM 03.38 basic and extension characters; UCS-2 charged in UTF-16 units. @param {string} message */
export function smsUnits(message) {
  const basic="@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
  const extended='^{}\\[~]|€\f';
  const gsm=[...message].every(c=>basic.includes(c)||extended.includes(c));
  const units=gsm?[...message].reduce((n,c)=>n+(extended.includes(c)?2:1),0):message.length;
  const single=gsm?160:70,concat=gsm?153:67;
  return {encoding:gsm?'GSM-7':'UCS-2',units,segments:units===0?0:units<=single?1:Math.ceil(units/concat),price:null};
}
/** Preconditions only, availability stays false for every real channel. @param {unknown} input @param {Date} now */
export function channelCheck(input,now) {
  const c=rec(input),errors=[];
  if(!Number.isFinite(now.getTime())) errors.push('CLOCK');
  if(!syntheticId(c.account) || c.account!==c.expectedAccount) errors.push('ACCOUNT');
  if(c.opposed===true) errors.push('OPPOSITION');
  if(c.channel==='whatsapp') {
    if(c.optIn!==true) errors.push('OPTIN');
    const within=instant(c.lastInboundAt)<=now.getTime() && now.getTime()-instant(c.lastInboundAt)<=24*3600000;
    if(!within && c.templateApproved!==true) errors.push('TEMPLATE_WINDOW');
  } else if(c.channel==='email') {
    if(c.senderVerified!==true || c.unsubscribeVerified!==true || c.suppressionChecked!==true) errors.push('EMAIL_READINESS');
  } else if(c.channel==='sms') {
    if(c.eligible!==true || c.stopVerified!==true || c.senderVerified!==true || num(c.costCap)===null || Number(c.costCap)<0) errors.push('SMS_READINESS');
  } else if(c.channel==='google-post') {
    if(c.formatVerified!==true || c.rightsVerified!==true) errors.push('SOCIAL_READINESS');
  } else errors.push('CHANNEL');
  return {ready:!errors.length,errors,connected:false,canExecute:false};
}

/** Audit supplied observations, no DNS query or warm-up activation. @param {unknown} input @param {Date} now */
export function auditDelivery(input,now) {
  const r=rec(input),errors=[],clock=now.getTime(),observed=instant(r.observedAt);
  const validClock=Number.isFinite(clock),validTime=Number.isFinite(observed) && (!validClock || observed<=clock);
  const fresh=validClock && validTime && clock-observed<=86400000;
  if(!validClock) errors.push('CLOCK');
  if(!validTime) errors.push('OBSERVATION_TIME');
  else if(validClock && !fresh) errors.push('OBSERVATION_STALE');
  const counts=[r.hardBounces,r.complaints];
  const validCounts=counts.map(value=>Number.isSafeInteger(value) && Number(value)>=0);
  if(!validCounts.every(Boolean)) errors.push('INCIDENT_COUNTS');
  // A declared incident remains a stop signal even when the other evidence is incomplete.
  const incident=counts.some((value,index)=>validCounts[index] && Number(value)>0);
  const stop=incident?true:validCounts.every(Boolean) && fresh?false:null;
  if(r.spf!=='pass' || r.dkim!=='pass' || r.dmarc!=='pass' || r.alignment!==true) errors.push('AUTHENTICATION');
  if(r.senderVerified!==true || r.unsubscribeVerified!==true) errors.push('SENDER_READINESS');
  return {preconditionsMet:!errors.length && stop===false,errors,stop,inboxGuaranteed:false,observationFresh:fresh,
    observationVerified:false,policy:'Fixture audit horizon 24h; real policy requires approval.',queriedDns:false};
}
/** Input is an observed index; this does not implement runtime routing. @param {unknown} input @param {unknown} context */
export function inspectSkillIndex(input,context) {
  const c=rec(context),root=str(c.root),errors=[];
  const expected=['ape-campagnes-locales','ape-avis-google','ape-audience-preferences','ape-revue-mesure'];
  const absolute=posix.isAbsolute(root) || (win32.isAbsolute(root) && win32.parse(root).root.length>1);
  if(c.project!==PROJECT || !absolute || root.includes('\0') || c.root!==root) errors.push('CONTEXT');
  const bounded=Array.isArray(input) && input.length<=1000;
  if(!bounded) errors.push('INDEX_INPUT');
  const entries=bounded?Array.from(input,rec):[];
  const names=new Set();
  for(const e of entries) {
    const name=str(e.name);
    if(names.has(name)) errors.push('DUPLICATE');
    names.add(name);
    if(!expected.includes(name) ||
      e.version!=='2.0.0' || e.referencesValid!==true ||
      str(e.path).replaceAll('\\','/')!==root.replaceAll('\\','/').replace(/\/$/,'')+'/.agents/skills/'+name+'/SKILL.md') errors.push('PATH_VERSION_OR_REFERENCE');
  }
  if(bounded && !entries.length) errors.push('EMPTY');
  const missingSkills=expected.filter(name=>!names.has(name)).sort();
  return {valid:!errors.length,errors:[...new Set(errors)].sort(),complete:!errors.length && !missingSkills.length,
    expectedCount:expected.length,missingSkills,referencesVerified:false,implicitRoutingVerified:false};
}
