/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tag
 * @param {string} [className]
 * @param {unknown} [text]
 */
function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isReviewRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @returns {value is number} */
function isPlaceRating(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 5;
}

/** @param {unknown} value @returns {value is number} */
function isReviewTotal(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

async function loadReviews() {
    const stats = document.getElementById('stats');
    const content = document.getElementById('content');
    if (!stats || !content) return;
    stats.replaceChildren();
    try {
        const response = await fetch('/api/google-reviews', { signal: AbortSignal.timeout(12_000) });
        /** @type {unknown} */
        const result = await response.json();
        if (!isReviewRecord(result)) throw new Error('Réponse des avis invalide');
        if (!response.ok || result.success !== true) {
            const message = typeof result.message === 'string' ? result.message : result.error;
            throw new Error(typeof message === 'string' ? message : 'Avis indisponibles');
        }
        if (!isReviewRecord(result.data)) throw new Error('Réponse des avis invalide');
        const { name, rating, totalReviews, address, phone } = result.data;
        const reviews = result.data.reviews;
        if (!Array.isArray(reviews)) throw new Error('Réponse des avis invalide');
        const displayedReviews = reviews.filter(isReviewRecord);
        for (const [value, label] of [
            [isPlaceRating(rating) ? rating : '—', 'Note moyenne rapportée / 5'],
            [isReviewTotal(totalReviews) ? totalReviews : '—', 'Total rapporté (avec ou sans texte)'],
            [displayedReviews.length, 'Avis affichés dans cette réponse']
        ]) {
            const stat = element('div', 'stat');
            stat.append(element('div', 'stat-value', value), element('div', 'stat-label', label));
            stats.append(stat);
        }
        const summary = element('div', 'success');
        summary.append(
            element('p', '', 'Les avis Google ont été récupérés.'),
            element('p', '', `Établissement : ${name || 'Non disponible'}`),
            element('p', '', `Adresse : ${address || 'Non disponible'}`),
            element('p', '', `Téléphone : ${phone || 'Non disponible'}`),
            element('p', '', 'Source : réponse du service local Google Places. Note et total rapportés pour cet établissement ; compteur affiché calculé sur cette réponse.'),
            element('p', '', 'Période couverte non fournie ; ces valeurs ne constituent pas un bilan périodique. La liste reçue peut être partielle et ne représente ni des clients uniques ni des ventes. Une valeur absente ou invalide est indiquée par —.')
        );
        if (displayedReviews.length !== reviews.length) {
            summary.append(element('p', '', `Entrées non affichées (format invalide) : ${reviews.length - displayedReviews.length}.`));
        }
        const grid = element('div', 'reviews-grid');
        for (const review of displayedReviews) {
            const card = element('article', 'review-card');
            const header = element('div', 'review-header');
            try {
                const photoUrl = new URL(typeof review.profile_photo_url === 'string' ? review.profile_photo_url : '');
                if (photoUrl.protocol === 'https:') {
                    const photo = element('img', 'review-avatar');
                    photo.src = photoUrl.href;
                    photo.alt = '';
                    photo.referrerPolicy = 'no-referrer';
                    photo.loading = 'lazy';
                    header.append(photo);
                }
            } catch { /* An absent or invalid photo must not hide the review. */ }
            const author = element('div');
            author.append(element('div', 'review-author', review.author_name || 'Anonyme'),
                element('div', 'review-date', review.relative_time_description || ''));
            header.append(author);
            const reviewRating = isPlaceRating(review.rating) && Number.isInteger(review.rating)
                ? '⭐'.repeat(review.rating) : 'Note indisponible';
            card.append(header, element('div', 'review-rating', reviewRating),
                element('p', 'review-text', review.text || ''));
            grid.append(card);
        }
        if (!displayedReviews.length) {
            grid.append(element('p', '', reviews.length
                ? 'Aucun avis affichable dans cette réponse.' : 'Aucun avis fourni dans cette réponse.'));
        }
        content.className = '';
        content.replaceChildren(summary, grid);
    } catch (error) {
        stats.replaceChildren();
        const errorName = isReviewRecord(error) ? error.name : undefined;
        const timedOut = errorName === 'TimeoutError' || errorName === 'AbortError';
        const message = isReviewRecord(error) && typeof error.message === 'string' ? error.message : 'Avis indisponibles';
        content.className = '';
        content.replaceChildren(element('div', 'error', timedOut ? 'Le chargement des avis a dépassé le délai prévu.' : message));
    }
}

loadReviews();
