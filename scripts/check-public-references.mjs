/** Decode the entities used in the site's generated HTML attributes. @param {string} value */
function decodeAttribute(value) {
  /** @type {Record<string, string>} */
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, key) => {
    if (!key.startsWith('#')) return named[key.toLowerCase()] ?? entity;
    const point = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point) : '\uFFFD';
  });
}

/** Read attributes from the static HTML we generate; ignore comments and raw text. @param {string} html */
function elements(html) {
  const markup = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<(script|style|textarea|title)\b[^>]*>)[\s\S]*?<\/\2\s*>/gi, '$1');
  return [...markup.matchAll(/<([a-z][\w:-]*)\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi)].map(match => {
    /** @type {Map<string, string>} */
    const attributes = new Map();
    for (const attribute of match[0].matchAll(/\s([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
      if (attribute[1]) attributes.set(attribute[1].toLowerCase(), decodeAttribute(attribute[2] ?? attribute[3] ?? attribute[4] ?? ''));
    }
    return { tag: match[1]?.toLowerCase(), attributes };
  });
}

/**
 * Check the published HTML without requesting external services.
 * @param {Map<string, string>} pages HTML read from the publication artifact.
 * @param {readonly string[]} publicFiles
 * @returns {string[]}
 */
export function checkPublicReferences(pages, publicFiles) {
  const origin = 'https://auto-pieces-equipements.fr';
  const allowed = new Set(publicFiles);
  const documents = new Map([...pages].map(([file, html]) => [file, elements(html)]));
  /** @type {Map<string, Set<string>>} */
  const anchors = new Map();
  /** @type {string[]} */
  const failures = [];
  for (const [file, nodes] of documents) {
    /** @type {Set<string>} */
    const ids = new Set();
    /** @type {Set<string>} */
    const targets = new Set();
    for (const { tag, attributes } of nodes) {
      const id = attributes.get('id');
      if (id) {
        if (ids.has(id)) failures.push(`${file}: identifiant HTML dupliqué (${id})`);
        ids.add(id);
        targets.add(id);
      }
      const name = tag === 'a' ? attributes.get('name') : undefined;
      if (name) targets.add(name);
      if (tag === 'base' && attributes.has('href')) failures.push(`${file}: base href non prise en charge dans le site statique`);
    }
    anchors.set(file, targets);
  }
  for (const [file, nodes] of documents) {
    const pageUrl = new URL(file === 'index.html' ? '/' : `/${file}`, origin);
    for (const { attributes } of nodes) {
      for (const attribute of ['href', 'src']) {
        const reference = attributes.get(attribute);
        if (!reference) continue;
        let url;
        try { url = new URL(reference, pageUrl); }
        catch {
          failures.push(`${file}: ${attribute} invalide (${reference})`);
          continue;
        }
        if (url.origin !== origin) continue;
        let target;
        let fragment;
        try {
          target = decodeURIComponent(url.pathname).slice(1) || 'index.html';
          fragment = decodeURIComponent(url.hash.slice(1).split(':~:')[0] ?? '');
        } catch {
          failures.push(`${file}: encodage de référence invalide (${reference})`);
          continue;
        }
        if (!allowed.has(target)) {
          failures.push(`${file}: ${attribute} vers un fichier non publié (${reference})`);
        } else if (attribute === 'href' && fragment && fragment.toLowerCase() !== 'top' &&
          anchors.has(target) && !anchors.get(target)?.has(fragment)) {
          failures.push(`${file}: ancre absente dans ${target} (${reference})`);
        }
      }
    }
  }
  return failures;
}
