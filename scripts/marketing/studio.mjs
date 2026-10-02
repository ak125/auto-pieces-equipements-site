import { PROJECT, rec, rows, list, str, num, instant, syntheticId, envelopeErrors, safeLink, noPrivateText } from './common.mjs';

/** @param {unknown} blocks @param {unknown} variables */
export function fillBlocks(blocks,variables) {
  const values=rec(variables), missing=new Set();
  const text=rows(blocks).filter(b=>!b.when || Boolean(values[str(b.when)])).map(b=>
    str(b.text).replace(/\{\{([a-zA-Z0-9_]+)\}\}/g,(_,key)=>{
      const value=values[key];
      if(typeof value!=='string' || !value.trim()) {missing.add(key); return '{{'+key+'}}';}
      return value;
    })).join('\n');
  return {text,missing:[...missing]};
}
/** @param {unknown} offer @param {Date} now */
export function validateOffer(offer,now) {
  const o=rec(offer); const errors=[];
  if(o.project!==PROJECT) errors.push('PROJECT');
  if(!syntheticId(o.reference) || !str(o.evidence) || !str(o.conditions)) errors.push('OFFER_EVIDENCE');
  if(num(o.price)===null || Number(o.price)<=0) errors.push('PRICE');
  if(!(instant(o.startsAt)<=now.getTime() && instant(o.expiresAt)>now.getTime())) errors.push('OFFER_PERIOD');
  if(!['store','supplier'].includes(str(o.availability))) errors.push('AVAILABILITY');
  if(o.compatibility!=='unverified') errors.push('COMPATIBILITY');
  if(o.discount!==undefined && o.discount!==null) errors.push('DISCOUNT_REVIEW');
  return errors;
}
/** Facts are supplied and dated; this validates references, not business truth. @param {unknown} input @param {Date} now @param {Set<string>} allowed */
export function prepareContent(input,now,allowed) {
  const v=rec(input), errors=envelopeErrors(v);
  const sources=rows(v.sources), facts=rows(v.facts);
  if(!noPrivateText(input)) errors.push('PRIVACY');
  if(!['objective','audience','stop','metric','topic'].every(k=>str(v[k]))) errors.push('BRIEF');
  if(!safeLink(v.url,allowed)) errors.push('LINK');
  if(!sources.length || sources.some(s=>!str(s.ref) || !(instant(s.checkedAt)<=now.getTime() && instant(s.expiresAt)>now.getTime()))) errors.push('SOURCE_STALE');
  if(!facts.length || facts.some(f=>!str(f.key) || !str(f.value) || !sources.some(s=>s.ref===f.source))) errors.push('FACT_SOURCE');
  const values=new Map();
  for(const fact of facts) {
    if(values.has(fact.key) && values.get(fact.key)!==fact.value) errors.push('FACT_CONFLICT');
    values.set(fact.key,fact.value);
  }
  if(rows(v.assets).some(a=>a.rights!=='confirmed' || !str(a.source) || a.storeLink!=='confirmed')) errors.push('ASSET_RIGHTS');
  if(v.offer) errors.push(...validateOffer(v.offer,now));
  const block=fillBlocks([{text:v.template??'Conseil {{theme}} : préparer votre demande avant le passage au magasin.'}],v.variables);
  if(block.missing.length) errors.push('VARIABLE');
  const factual=facts.map(f=>str(f.value)).join('\n');
  const body=block.text+'\n'+factual+'\nLa référence, la compatibilité et la disponibilité restent à confirmer par le magasin.';
  const previous=list(v.previousTopics).map(str);
  const warnings=previous.includes(str(v.topic))?['REPEATED_TOPIC']:[];
  return {version:'2.0.0',status:errors.length?'blocked':'draft',errors:[...new Set(errors)],warnings,canExecute:false,
    brief:{objective:v.objective,audience:v.audience,metric:v.metric,stop:v.stop,sources:sources.map(s=>s.ref)},
    newsletter:{subject:'Auto Pièces Équipements — '+str(v.topic),preheader:'Préparez une demande précise au magasin.',body,ctaUrl:v.url},
    posts:[{format:'short',text:factual+'\nUne question sur la référence ? Préparez votre demande.',ctaUrl:v.url},
      {format:'advice',text:'Avant votre passage : '+block.text+'\n'+factual,ctaUrl:v.url}],
    faq:[{question:'Cette pièce convient-elle à mon véhicule ?',answer:'La compatibilité doit être vérifiée sur la référence et les informations nécessaires du véhicule.'}],
    video:{script:'Présenter le besoin, montrer un actif réel autorisé, rappeler la vérification de référence.',captions:factual},
    humanReview:['source truth','tone against approved brand examples','free-text assertions','final commercial conditions']};
}
/** One minimal next question; no diagnostic or implicit subscription. @param {unknown} input */
export function qualifyRequest(input) {
  const r=rec(input);
  /** @type {string[]} */
  const questions=[];
  if(r.project!==PROJECT || r.received!==true) return {decision:'unverified-reception',questions,compatibility:'unverified',reply:''};
  if(!str(r.need)) questions.push('Quel est votre besoin ou la pièce recherchée ?');
  else if(!str(r.reference)) questions.push('Avez-vous la référence de la pièce ? À défaut, indiquez le modèle, l’année et la motorisation par le canal privé convenu.');
  else if(!str(r.vehicle)) questions.push('Pour vérifier cette référence, quel est le modèle, l’année et la motorisation du véhicule ?');
  return {decision:questions.length?'ask':'store-check',questions,compatibility:'unverified',subscribed:false,
    reply:questions[0]??'Merci. Le magasin doit maintenant confirmer la référence, la compatibilité, le prix et la disponibilité.',
    privateDocuments:'Photo/VIN/immatriculation seulement si nécessaires, par canal privé autorisé.'};
}
/** @param {unknown} input @param {Date} now */
export function prepareQuote(input,now) {
  const q=rec(input), errors=[];
  if(q.project!==PROJECT) errors.push('PROJECT');
  const price=num(q.price), qty=num(q.quantity);
  if(!syntheticId(q.id) || !str(q.version) || !syntheticId(q.reference) || price===null || price<=0 ||
    qty===null || !Number.isInteger(qty) || qty<=0 || !str(q.evidence) || !str(q.conditions) ||
    !['store','supplier'].includes(str(q.availability))) errors.push('QUOTE_INCOMPLETE');
  if(!(instant(q.expiresAt)>now.getTime())) errors.push('QUOTE_EXPIRED');
  return {errors,total:errors.length?null:Math.round(Number(price)*Number(qty)*100)/100,engaging:false,
    stockLabel:q.availability==='supplier'?'Disponibilité fournisseur, stock magasin non confirmé':
      q.availability==='store'?'Stock magasin déclaré par la source, à recontrôler':'Disponibilité inconnue',
    draft:errors.length?'Demander les informations manquantes au magasin.':'Brouillon de devis à valider par le magasin, sans réservation.'};
}
/** Review contents stay inert. No URL/file/tool interpretation. @param {unknown} input */
export function reviewReply(input) {
  const r=rec(input), body=str(r.text);
  if(r.project!==PROJECT || !syntheticId(r.id) || !str(r.version) || r.version!==r.currentVersion) return {decision:'recheck',draft:null};
  if(str(r.existingReply)) return {decision:'skip',draft:null};
  if(r.sensitive===true || /rembours|plainte|avocat|arnaque|bless|secret|\.env|ignore.+instruction|https?:\/\//i.test(body))
    return {decision:'human',draft:'Nous souhaitons comprendre la situation. Merci de contacter le magasin par le canal privé habituel, sans publier de données personnelles ici.'};
  if(!body) return {decision:'recheck',draft:null};
  return {decision:'draft',draft:/attente|délai/i.test(body)?
    'Merci pour votre retour sur l’attente. Nous souhaitons mieux comprendre votre expérience ; vous pouvez en parler directement avec le magasin.':
    Number(r.rating)>=4?'Merci pour votre retour et votre visite au magasin. Au plaisir de vous accueillir à nouveau.':
    'Merci de nous avoir fait part de votre expérience. Le magasin reste disponible pour en discuter directement.'};
}
/** Satisfaction deliberately unused. @param {unknown} input */
export function neutralInvitation(input) {
  const r=rec(input);
  return r.experienced===true && r.alreadyInvited!==true && r.opposed!==true ?
    'Vous avez eu une expérience avec Auto Pièces Équipements ? Vous pouvez partager librement votre avis, positif ou négatif, sans contrepartie.' : null;
}
/** Exact print brief: no QR encoder installed, never a fake QR. @param {unknown} input @param {Date} now @param {Set<string>} allowed */
export function qrBrief(input,now,allowed) {
  const r=rec(input), valid=safeLink(r.url,allowed) && str(r.purpose) && str(r.version) && instant(r.expiresAt)>now.getTime();
  return {status:valid?'brief-ready':'blocked',destination:valid?r.url:null,
    caption:valid?str(r.purpose):'',version:r.version,expiresAt:r.expiresAt,
    imageGenerated:false,receptionVerified:false,
    recipe:'Encoder cette destination exacte dans l’outil autorisé existant ; décoder le rendu, tester le lien et la réception séparément avant impression.'};
}

/** @param {unknown} authoritative @param {unknown} observations */
export function compareBusinessFacts(authoritative,observations) {
  const truth=rec(authoritative), contradictions=[],unknown=[];
  for(const observation of rows(observations)) for(const [key,value] of Object.entries(rec(observation.facts))) {
    if(!Object.hasOwn(truth,key)) unknown.push({source:observation.source,key});
    else if(truth[key]!==value) contradictions.push({source:observation.source,key,expected:truth[key],observed:value});
  }
  return {contradictions,unknown,changedPublic:false,requires:'Store adjudication of source authority and dates.'};
}
