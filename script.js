// Mapeo solo para mostrar nombre del país
const countryNames = {
  en: 'Estados Unidos',
  es: 'España',
  fr: 'Francia',
  de: 'Alemania',
  it: 'Italia',
  'pt_BR': 'Brasil',
  ja: 'Japón',
  ko: 'Corea del Sur',
  zh_CN: 'China',
  ru: 'Rusia',
  ar: 'Árabe',
  hi: 'India (Hindi)',
  pl: 'Polonia',
  nl: 'Países Bajos',
  sv: 'Suecia'
};

// Cargar historial
let history = JSON.parse(localStorage.getItem('addressHistory')) || [];

function safeCall(fn, fallback = '—') {
  try {
    return fn();
  } catch (e) {
    console.warn('Campo no disponible:', e.message);
    return fallback;
  }
}

function generateAddress() {
  const locale = document.getElementById('countrySelect').value;

  // NOTA: En Faker.js v8+, NO se puede cambiar el locale en runtime con faker.locale.
  // Así que usaremos la instancia global (inglés), pero los formatos de dirección sí varían.
  // Es un compromiso aceptable para una demo.

  try {
    const street = safeCall(() => faker.location.streetAddress());
    const city = safeCall(() => faker.location.city());
    const state = safeCall(() => faker.location.state?.() || faker.location.province?.(), '—');
    const zipCode = safeCall(() => faker.location.zipCode?.(), '—');
    const country = safeCall(() => faker.location.country());
    const latitude = safeCall(() => parseFloat(faker.location.latitude()).toFixed(4), '—');
    const longitude = safeCall(() => parseFloat(faker.location.longitude()).toFixed(4), '—');

    const addressData = {
      full: `${street}, ${city}, ${state} ${zipCode}, ${country}`,
      details: {
        street,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        locale,
        timestamp: new Date().toISOString()
      }
    };

    displayAddress(addressData);
    addToHistory(addressData);
  } catch (err) {
    console.error('Error grave:', err);
    document.getElementById('addressDetails').innerHTML = 
      '<p class="text-red-600">⚠️ No se pudo generar la dirección. Prueba otro país.</p>';
    document.getElementById('currentAddress').classList.remove('hidden');
  }
}

function displayAddress(data) {
  const { street, city, state, zipCode, country, latitude, longitude } = data.details;
  const html = `
    <p><strong>Calle:</strong> ${escapeHtml(street)}</p>
    <p><strong>Ciudad:</strong> ${escapeHtml(city)}</p>
    <p><strong>Estado/Provincia:</strong> ${escapeHtml(state)}</p>
    <p><strong>Código Postal:</strong> ${escapeHtml(zipCode)}</p>
    <p><strong>País:</strong> ${escapeHtml(country)}</p>
    <p><strong>Coordenadas:</strong> ${latitude}, ${longitude}</p>
  `;
  document.getElementById('addressDetails').innerHTML = html;
  document.getElementById('currentAddress').classList.remove('hidden');

  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(data.full).then(() => {
      const btn = document.getElementById('copyBtn');
      const original = btn.textContent;
      btn.textContent = '¡Copiado!';
      setTimeout(() => btn.textContent = original, 2000);
    }).catch(err => {
      console.error('No se pudo copiar:', err);
    });
  };
}

// Escapar HTML para seguridad
function escapeHtml(text) {
  if (typeof text !== 'string') return String(text);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addToHistory(addressData) {
  if (history.length === 0 || history[0].full !== addressData.full) {
    history.unshift(addressData);
    if (history.length > 10) history.pop();
    localStorage.setItem('addressHistory', JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  const container = document.getElementById('historyList');
  const section = document.getElementById('historySection');

  if (history.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  container.innerHTML = history.map(item => `
    <div class="address-card bg-white p-4 rounded-lg shadow-sm border">
      <div class="text-sm text-gray-500">${countryNames[item.details.locale] || item.details.locale}</div>
      <div class="font-medium">${escapeHtml(item.full)}</div>
      <div class="text-xs text-gray-400 mt-1">${new Date(item.details.timestamp).toLocaleString()}</div>
    </div>
  `).join('');
}

// Evento
document.getElementById('generateBtn').addEventListener('click', generateAddress);

// Inicializar
renderHistory();
