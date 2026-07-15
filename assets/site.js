const hours = {
  1: [[570, 1110]],
  2: [[570, 1110]],
  3: [[570, 1110]],
  4: [[570, 1110]],
  5: [[570, 810], [870, 1110]],
  6: [[570, 960]],
  7: []
};

function parisNow() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayByName = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 7 };
  return {
    day: dayByName[values.weekday.replace('.', '').toLowerCase()],
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function formatTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute ? `${hour}h${String(minute).padStart(2, '0')}` : `${hour}h`;
}

function updateOpeningStatus() {
  const status = document.querySelector('[data-opening-status]');
  if (!status) return;
  const now = parisNow();
  const currentWindow = (hours[now.day] || []).find(([start, end]) => now.minutes >= start && now.minutes < end);
  if (currentWindow) {
    status.textContent = `Magasin ouvert — fermeture à ${formatTime(currentWindow[1])}. Appelez pour vérifier la disponibilité d'une pièce.`;
    status.classList.add('is-open');
  } else {
    status.textContent = 'Magasin actuellement fermé — consultez les horaires ou laissez un message sur WhatsApp.';
    status.classList.remove('is-open');
  }
}

function setupNavigation() {
  const button = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-mobile-nav]');
  if (!button || !navigation) return;
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('is-open', !open);
  });
  navigation.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    button.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  });
}

function updateYear() {
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

updateOpeningStatus();
setupNavigation();
updateYear();
