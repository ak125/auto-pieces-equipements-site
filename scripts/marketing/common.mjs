export const PROJECT = 'ak125/auto-pieces-equipements-site';
export const VERSION = '2.0.0';
/** @param {unknown} v @returns {Record<string, unknown>} */
export function rec(v) { return v !== null && typeof v === 'object' && !Array.isArray(v) ? /** @type {Record<string,unknown>} */(v) : {}; }
/** @param {unknown} v */ export function str(v) { return typeof v === 'string' ? v.trim() : ''; }
/** @param {unknown} v @returns {unknown[]} */ export function list(v) { return Array.isArray(v) ? v : []; }
/** @param {unknown} v */ export function rows(v) { return list(v).map(rec); }
/** @param {unknown} v */ export function num(v) { return typeof v === 'number' && Number.isFinite(v) ? v : null; }
/** Strict instant with explicit UTC offset, never an operator-local timestamp. @param {unknown} v */
export function instant(v) {
  const s=str(v);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(s)) return NaN;
  if(Number(s.slice(11,13))>23 || Number(s.slice(14,16))>59 || Number(s.slice(17,19))>59) return NaN;
  const n=Date.parse(s);
  const day=s.slice(0,10);
  if (!Number.isFinite(n) || new Date(day+'T00:00:00Z').toISOString().slice(0,10)!==day) return NaN;
  return n;
}
/** @param {unknown} v */ export function syntheticId(v) { return /^syn-[a-zA-Z0-9_-]{1,80}$/.test(str(v)); }
/** @param {unknown} v */
export function envelopeErrors(v) {
  const r=rec(v);
  return [r.project!==PROJECT || foreignProject(v)?'PROJECT':null,r.environment!=='simulation'?'ENVIRONMENT':null,
    r.classification!=='synthetic'?'SYNTHETIC_ONLY':null].filter(x=>x!==null);
}
/** @param {unknown} value @param {number} [depth] @returns {boolean} */
function foreignProject(value,depth=0) {
  if(depth>24) return true;
  if(Array.isArray(value)) return value.some(v=>foreignProject(v,depth+1));
  if(value && typeof value==='object') {
    const r=rec(value);
    return (Object.hasOwn(r,'project') && r.project!==PROJECT) || Object.values(r).some(v=>foreignProject(v,depth+1));
  }
  return false;
}
/** No network, arbitrary protocols, private host or unknown destination. @param {unknown} v @param {Set<string>} allowed */
export function safeLink(v,allowed) {
  try { const u=new URL(str(v)); return u.protocol==='https:' && !u.username && !u.password &&
    !u.hash && !u.search && allowed.has(u.href) && !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[|169\.254\.)/i.test(u.hostname);
  } catch { return false; }
}
/** @param {unknown} v */
export function noPrivateText(v) {
  if(hasCredentialField(v)) return false;
  const s=JSON.stringify(v)??'';
  return !/\b(?:api[_ -]?key|token|password|secret)\s*[:=]|\b[A-Z]{2}-\d{3}-[A-Z]{2}\b|\b[A-HJ-NPR-Z0-9]{17}\b/i.test(s) &&
    !(s.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)??[]).some(e=>!e.toLowerCase().endsWith('.invalid') && e!=='contact@auto-pieces-equipements.fr');
}
/** Inspect keys structurally: JSON quotes separate a credential key from its colon.
 * @param {unknown} value @param {number} [depth] @returns {boolean} */
function hasCredentialField(value,depth=0) {
  if(depth>24) return true;
  if(Array.isArray(value)) return value.some(item=>hasCredentialField(item,depth+1));
  return Object.entries(rec(value)).some(([key,item])=>
    /^(apikey|accesstoken|refreshtoken|token|password|secret|authorization|credentials)$/i.test(key.replace(/[_ -]/g,'')) ||
    hasCredentialField(item,depth+1));
}
