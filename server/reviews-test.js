function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}

async function loadReviews() {
    const stats = document.getElementById('stats');
    const content = document.getElementById('content');
    stats.replaceChildren();
    try {
        const response = await fetch('/api/google-reviews', { signal: AbortSignal.timeout(12_000) });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || result.error || 'Avis indisponibles');
        }
        const { name, rating, totalReviews, reviews, address, phone } = result.data;
        if (!Array.isArray(reviews)) throw new Error('Réponse des avis invalide');
        for (const [value, label] of [
            [rating ?? '—', 'Note Moyenne'], [totalReviews ?? 0, 'Avis Total'], [reviews.length, 'Avis Affichés']
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
            element('p', '', `Téléphone : ${phone || 'Non disponible'}`)
        );
        const grid = element('div', 'reviews-grid');
        for (const review of reviews) {
            if (!review || typeof review !== 'object') continue;
            const card = element('article', 'review-card');
            const header = element('div', 'review-header');
            try {
                const photoUrl = new URL(review.profile_photo_url);
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
            const stars = Number.isFinite(review.rating) ? Math.min(5, Math.max(0, Math.floor(review.rating))) : 0;
            card.append(header, element('div', 'review-rating', '⭐'.repeat(stars)),
                element('p', 'review-text', review.text || ''));
            grid.append(card);
        }
        if (!reviews.length) grid.append(element('p', '', 'Aucun avis disponible.'));
        content.className = '';
        content.replaceChildren(summary, grid);
    } catch (error) {
        stats.replaceChildren();
        const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
        content.className = '';
        content.replaceChildren(element('div', 'error', timedOut ? 'Le chargement des avis a dépassé le délai prévu.' : error.message));
    }
}

loadReviews();
