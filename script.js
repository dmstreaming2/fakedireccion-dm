// Mapeo: código de locale → nombre amigable
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

// Almacena la instancia actual de faker
let currentFaker = null;
let isLoading = false;

// Historial
let history = JSON.parse(localStorage.getItem('addressHistory')) || [];

// Función para cargar un locale específico
function loadLocale(locale) {
  return new Promise((resolve, reject) => {
    // Si ya está cargado (ej: window.fakerEs), usarlo
    const globalName = `faker${locale.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (window[globalName]) {
      currentFaker = window[globalName];
      resolve();
      return;
    }

    // Crear script
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/npm/@faker-js/faker@8.4.1/locale/${locale}.js`;
    
    script.onload = () => {
      // Faker.js expone la librería como window[faker{Locale}]
      // Ej: es → window.fakerEs, pt_BR → window.fakerPtBr
      const varName = `faker${locale
        .replace(/_[a-z]/g, match => match[1].toUpperCase())
        .replace(/^[a-z]/, first => first.toUpperCase())
      }`;
      
      if (window[varName]) {
        currentFaker = window[varName];
        resolve();
      } else {
        reject(new Error(`No se pudo cargar faker para ${locale}`));
      }
    };
    
    script.onerror = () => reject(new Error(`Error al cargar ${locale}`));
    document.head.appendChild(script);
  });
}

function safeCall(fn, fallback = '—') {
  try {
    return fn();
  } catch (e) {
    console.warn('Campo no disponible:', e.message);
    return fallback;
  }
}

async function generateAddress() {
  const locale = document.getElementById('countrySelect').value;
  const btn = document.getElementById('generateBtn');
  
  if (isLoading) return;
  
  isLoading = true;
  btn.disabled = true;
  btn.textContent = 'Cargando...';

  try {
    await loadLocale(locale);

    const faker = currentFaker;
    if (!faker) throw new Error('Faker no disponible');

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
    console.error('Error:', err);
    document.getElementById('addressDetails').innerHTML = 
      `<p class="text-red-600">⚠️ Error: ${err.message}</p>`;
    document.getElementById('currentAddress').classList.remove('hidden');
  } finally {
    isLoading = false;
    btn.disabled = false;
    btn.textContent = 'Generar Dirección';
  }
}

function escapeHtml(text) {
  if (typeof text !== 'string') return String(text);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
    });
  };
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

// Inicializar
document.getElementById('generateBtn').addEventListener('click', generateAddress);
renderHistory();

// Cargar inglés por defecto al inicio (opcional)
// window.addEventListener('load', () => {
//   document.getElementById('countrySelect').value = 'en';
// });
