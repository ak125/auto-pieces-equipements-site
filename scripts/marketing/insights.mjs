import { createHash } from 'node:crypto';
import { rec, rows, str, num, instant, syntheticId, safeLink } from './common.mjs';
/** @param {unknown} input @param {Date} now */
export function compareSources(input,now) {
  const errors=[], bounded=Array.isArray(input) && input.length<=1000, time=now.getTime();
  if(!bounded) errors.push('SOURCES_UNKNOWN');
  if(!Number.isFinite(time)) errors.push('TIME');
  /** @type {{subject:string,ref:string,value:number,at:number}[]} */ const valid=[];
  let stale=0;
  for(const s of bounded?rows(input):[]) {
    const checked=instant(s.checkedAt), expiry=instant(s.expiresAt), value=num(s.value);
    if(expiry<=time) stale++;
    if(!str(s.ref) || !str(s.subject) || value===null ||
      !(checked<=time && checked<expiry)) {errors.push('SOURCE_SCHEMA');continue;}
    if(expiry>time) valid.push({subject:str(s.subject),ref:str(s.ref),value,at:checked});
  }
  valid.sort((a,b)=>a.subject.localeCompare(b.subject) || a.at-b.at || a.ref.localeCompare(b.ref));
  /** @type {{subject:string,difference:number,before:unknown,after:unknown,uncertainty:string}[]} */ const changes=[];
  /** @type {Map<string,(typeof valid)[number]>} */ const snapshots=new Map(), groups=new Map();
  for(const s of valid) {
    const identity=JSON.stringify([s.subject,s.at]), sameInstant=snapshots.get(identity);
    if(sameInstant) {
      if(sameInstant.value!==s.value) errors.push('SOURCE_CONFLICT');
      continue;
    }
    snapshots.set(identity,s);
    const prev=groups.get(s.subject);
    if(prev) {
      const difference=s.value-prev.value;
      if(!Number.isFinite(difference)) errors.push('DIFFERENCE_RANGE');
      else changes.push({subject:s.subject,difference,before:prev.ref,after:s.ref,uncertainty:'Comparison only; scope and business relevance require review.'});
    }
    groups.set(s.subject,s);
  }
  return {status:errors.length?'blocked':changes.length?'compared':'insufficient-data',errors:[...new Set(errors)].sort(),
    stale,changes:errors.length?[]:changes,collection:'supplied snapshots only',
    recommendation:errors.length?'Corriger ou arbitrer les sources avant comparaison.':changes.length?'Examiner le changement avec le magasin ; aucune copie de contenu concurrent.':'Aucune différence comparable établie.'};
}
/** Exact nonnegative EUR cents; never silently round an input price.
 * @param {unknown} value @returns {number|null} */
function euroCents(value) {
  if(typeof value!=='number' || !Number.isFinite(value) || value<0) return null;
  const cents=Math.round(value*100);
  return Number.isSafeInteger(cents) && cents/100===value?cents:null;
}
/** @param {unknown} input @param {unknown} policy */
export function loyaltyProposal(input,policy) {
  const p=rec(policy), errors=[];
  /** @type {Map<string,{amount:number,refunded:number}>} */ const seen=new Map();
  const historyKnown=Array.isArray(input) && input.length<=1000;
  if(!historyKnown) errors.push('LOYALTY_HISTORY_UNKNOWN');
  const threshold=euroCents(p.threshold), reward=euroCents(p.reward);
  if(threshold===null || threshold===0 || reward===null ||
    !syntheticId(p.referrer) || !syntheticId(p.referred) ||
    (p.currency!==undefined && p.currency!=='EUR')) errors.push('LOYALTY_POLICY');
  let conflict=false;
  for(const r of historyKnown?rows(input):[]) {
    const amount=euroCents(r.amount), refunded=euroCents(r.refunded);
    if(!syntheticId(r.id) || amount===null || refunded===null || refunded>amount ||
      (r.currency!==undefined && r.currency!=='EUR')) {errors.push('LOYALTY_SALE');continue;}
    const id=str(r.id), previous=seen.get(id);
    if(previous && (previous.amount!==amount || previous.refunded!==refunded)) conflict=true;
    else seen.set(id,{amount,refunded});
  }
  if(conflict) errors.push('LOYALTY_CONFLICT');
  const amount=[...seen.values()].reduce((sum,r)=>sum+(r.amount-r.refunded),0);
  if(!Number.isSafeInteger(amount)) errors.push('AMOUNT_RANGE');
  const valid=errors.length===0;
  return {status:valid?'proposal':'blocked',errors:[...new Set(errors)],currency:'EUR',
    observedAmount:valid?amount/100:null,
    proposedReward:!valid?null:str(p.referrer)!==str(p.referred) && threshold!==null && reward!==null && amount>=threshold?reward/100:0,
    issued:false,hypotheticalPolicy:true,requires:'Existing reward service and approval; no third-party subscription.',conflict};
}
/** Deduplicate by business identity, never infer sales from clicks. @param {unknown} input */
export function commercialReport(input) {
  const v=rec(input), errors=[], sales=new Map(), refunds=new Map(), quotes=new Set(), requests=new Set();
  const historyKnown=Array.isArray(v.events) && v.events.length<=1000;
  const events=historyKnown?rows(v.events):[];
  if(!historyKnown) errors.push('EVENT_HISTORY_UNKNOWN');
  const period=rec(v.period);
  const scope=Boolean(str(v.source)) && syntheticId(v.cohort) && instant(period.from)<instant(period.to);
  if(!scope) errors.push('REPORT_SCOPE');
  if(['salesCoverage','quoteCoverage'].some(key=>v[key]!==undefined && typeof v[key]!=='boolean')) errors.push('COVERAGE_SCHEMA');
  const costs=num(v.costs);
  if(v.costCoverage==='complete' && (costs===null || costs<0)) errors.push('COST_SCHEMA');
  let conflict=false;
  for(const e of events) {
    if(typeof e.kind!=='string' || !['request','quote','sale','refund','click','route-click','open'].includes(e.kind) ||
      (['request','quote'].includes(str(e.kind)) && !syntheticId(e.object))) errors.push('EVENT_SCHEMA');
    if(e.kind==='quote' && syntheticId(e.object)) quotes.add(str(e.object));
    if(e.kind==='request' && syntheticId(e.object)) requests.add(str(e.object));
    if(['sale','refund'].includes(str(e.kind))) {
      if(!syntheticId(e.object) || num(e.amount)===null || Number(e.amount)<0 || e.currency!=='EUR') {conflict=true;continue;}
      const map=e.kind==='sale'?sales:refunds, key=str(e.object), old=map.get(key);
      if(old && (old.amount!==e.amount || old.quote!==e.quote || old.order!==e.order)) conflict=true;
      map.set(key,e);
    }
  }
  let refundAmount=0;
  const refundsByOrder=new Map();
  for(const e of refunds.values()) {
    const key=str(e.order);
    if(!sales.has(key)) conflict=true;
    else {
      refundAmount+=Number(e.amount);
      const amount=(refundsByOrder.get(key)??0)+Number(e.amount);
      refundsByOrder.set(key,amount);
      if(amount>Number(sales.get(key)?.amount)) conflict=true;
    }
  }
  const gross=[...sales.values()].reduce((s,e)=>s+Number(e.amount),0);
  if(refundAmount>gross) conflict=true;
  if(conflict) errors.push('REPORT_CONFLICT');
  if(![gross,refundAmount,costs??0].every(value=>Number.isSafeInteger(Math.round(value*100)))) errors.push('AMOUNT_RANGE');
  const valid=errors.length===0, known=valid && v.salesCoverage===true;
  const linked=new Set([...sales.values()].map(e=>str(e.quote)).filter(q=>quotes.has(q)));
  return {status:valid?'report':'blocked',errors:[...new Set(errors)],
    requests:valid?requests.size:null,quotes:valid?quotes.size:null,sales:known?sales.size:null,
    netRevenue:known?Math.round((gross-refundAmount)*100)/100:null,currency:'EUR',
    quoteToSale:known && scope && v.quoteCoverage===true && quotes.size>0?linked.size/quotes.size:null,
    margin:known && costs!==null && costs>=0 && v.costCoverage==='complete'?gross-refundAmount-costs:null,
    humanClicks:valid?events.filter(e=>e.kind==='click' && e.bot===false).length:null,
    routeClicks:valid?events.filter(e=>e.kind==='route-click').length:null,visits:null,connectedCalls:null,
    opensReliable:false,causalEffect:null,conflict,source:v.source??null,period:scope?period:null,cohort:scope?v.cohort:null,
    limits:['Coverage must refer to the same cohort and period.','Missing costs prevent complete margin.','Clicks, opens and directions are not sales.']};
}
/** @param {string} subject @param {string} experiment */
export function assignVariant(subject,experiment) {
  if(!syntheticId(subject) || !syntheticId(experiment)) throw new Error('EXPERIMENT_ID');
  return (createHash('sha256').update(experiment+'|'+subject).digest()[0]??0)%2===0?'control':'variant';
}
/** @param {unknown} input @param {unknown} plan @param {Date} now */
export function experimentReport(input,plan,now) {
  const p=rec(plan), errors=[], bounded=Array.isArray(input) && input.length<=1000;
  /** @type {Map<string,{variant:string,converted:boolean|null}>} */ const ids=new Map();
  let contamination=false;
  if(!bounded) errors.push('PARTICIPANTS_UNKNOWN');
  const minimum=num(p.minimumPerArm), until=instant(p.until);
  if(minimum===null || !Number.isSafeInteger(minimum) || minimum<1 || !Number.isFinite(until) || !str(p.primary)) errors.push('EXPERIMENT_PLAN');
  if(!Number.isFinite(now.getTime())) errors.push('TIME');
  for(const row of bounded?rows(input):[]) {
    if(!syntheticId(row.id) || (row.variant!=='control' && row.variant!=='variant') ||
      (row.converted!==undefined && row.converted!==null && typeof row.converted!=='boolean')) {
      errors.push('PARTICIPANT_SCHEMA');continue;
    }
    const id=str(row.id), converted=typeof row.converted==='boolean'?row.converted:null, previous=ids.get(id);
    if(previous && (previous.variant!==row.variant || previous.converted!==converted)) contamination=true;
    else ids.set(id,{variant:row.variant,converted});
  }
  if(contamination) errors.push('PARTICIPANT_CONFLICT');
  const arms=['control','variant'].map(name=>{ const people=[...ids.values()].filter(v=>v.variant===name);
    const unknown=people.filter(v=>v.converted===null).length;
    return {name,n:people.length,unknown,converted:unknown?null:people.filter(v=>v.converted===true).length}; });
  const enough=!errors.length && minimum!==null && arms.every(a=>a.n>=minimum && a.unknown===0) && until<=now.getTime();
  return {status:errors.length?'blocked':'report',errors:[...new Set(errors)].sort(),arms:errors.length?null:arms,contamination,
    decision:errors.length?'blocked':enough?'ready-for-statistical-review':'inconclusive',winner:null,causalityEstablished:false,
    limit:'No significance, power or causal conclusion computed; preregister and review measurement/assignment integrity.'};
}
/** @param {unknown} input @param {Set<string>} allowed */
export function paidPlan(input,allowed) {
  const p=rec(input);
  const valid=syntheticId(p.account) && num(p.budget)!==null && Number(p.budget)>0 && p.currency==='EUR' &&
    str(p.stop) && str(p.zone) && safeLink(p.page,allowed);
  return {status:valid?'draft':'blocked',spend:0,account:p.account,budget:p.budget,zone:p.zone,
    stop:p.stop,page:p.page,activation:'unavailable',dataSharing:'separate permission required',trackingVerified:false};
}
/** Simple observed baseline, not a probabilistic confidence interval. @param {unknown} input @param {unknown} policy */
export function forecast(input,policy) {
  const errors=[], p=rec(policy);
  const historyKnown=Array.isArray(input) && input.length<=1000;
  /** @type {unknown[]} */ const supplied=historyKnown?input:[];
  if(!historyKnown) errors.push('OBSERVATIONS_UNKNOWN');
  if(supplied.some(value=>typeof value!=='number' || !Number.isFinite(value) || value<0)) errors.push('OBSERVATION_SCHEMA');
  const capacity=num(p.capacity);
  if(p.capacity!==undefined && p.capacity!==null && (capacity===null || capacity<0)) errors.push('CAPACITY_SCHEMA');
  const values=errors.length?[]:supplied.map(Number);
  // Incremental mean stays within the observed range; summing first can overflow.
  const mean=values.reduce((average,value,index)=>average+(value-average)/(index+1),0);
  if(!Number.isFinite(mean)) errors.push('MEAN_RANGE');
  const known=!errors.length && values.length>0;
  return {status:errors.length?'blocked':known?'estimated':'insufficient-data',errors,
    baseline:known?mean:null,
    scenarioRange:known?[Math.min(...values),Math.max(...values)]:null,
    capacity:errors.length?null:capacity,capacityRisk:known && capacity!==null?Math.max(...values)>capacity:null,
    scheduling:false,method:'Observed mean and min/max, not confidence bounds or a trained forecast.'};
}
/** @param {unknown} input */
export function groupAlerts(input) {
  /** @type {Map<string,{code:string,owner:string,count:number,refs:string[]}>} */ const groups=new Map();
  for(const a of rows(input)) {
    const key=str(a.code)+'|'+str(a.owner);
    const row=groups.get(key)??{code:str(a.code),owner:str(a.owner),count:0,refs:[]};
    const ref=str(a.ref);
    if(!row.refs.includes(ref)) {row.count++;row.refs.push(ref);}
    groups.set(key,row);
  }
  return [...groups.values()];
}
