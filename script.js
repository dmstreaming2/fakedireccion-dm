// Mapeo de códigos de idioma a nombres de país (opcional, para mostrar mejor en historial)
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

// Cargar historial desde localStorage al iniciar
let history = JSON.parse(localStorage.getItem('addressHistory')) || [];

function generateAddress() {
  const locale = document.getElementById('countrySelect').value;
  faker.locale = locale;

  try {
    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state?.() || '—';
    const zipCode = faker.location.zipCode?.() || '—';
    const country = faker.location.country();
    const latitude = faker.location.latitude?.().toFixed(4) || '—';
    const longitude = faker.location.longitude?.().toFixed(4) || '—';

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
    console.error('Error generando dirección:', err);
    document.getElementById('addressDetails').innerHTML = '<p class="text-red-600">Error al generar la dirección para este país.</p>';
    document.getElementById('currentAddress').classList.remove('hidden');
  }
}

function displayAddress(data) {
  const { street, city, state, zipCode, country, latitude, longitude } = data.details;
  const html = `
    <p><strong>Calle:</strong> ${street}</p>
    <p><strong>Ciudad:</strong> ${city}</p>
    <p><strong>Estado/Provincia:</strong> ${state}</p>
    <p><strong>Código Postal:</strong> ${zipCode}</p>
    <p><strong>País:</strong> ${country}</p>
    <p><strong>Coordenadas:</strong> ${latitude}, ${longitude}</p>
  `;
  document.getElementById('addressDetails').innerHTML = html;
  document.getElementById('currentAddress').classList.remove('hidden');

  // Botón copiar
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(data.full).then(() => {
      const btn = document.getElementById('copyBtn');
      const originalText = btn.textContent;
      btn.textContent = '¡Copiado!';
      setTimeout(() => btn.textContent = originalText, 2000);
    });
  };
}

function addToHistory(addressData) {
  // Evitar duplicados consecutivos (opcional)
  if (history.length === 0 || history[0].full !== addressData.full) {
    history.unshift(addressData); // Añadir al inicio
    if (history.length > 10) history.pop(); // Máximo 10 entradas
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
  container.innerHTML = history.map((item, i) => `
    <div class="address-card bg-white p-4 rounded-lg shadow-sm border">
      <div class="text-sm text-gray-500">${countryNames[item.details.locale] || item.details.locale}</div>
      <div class="font-medium">${item.full}</div>
      <div class="text-xs text-gray-400 mt-1">${new Date(item.details.timestamp).toLocaleString()}</div>
    </div>
  `).join('');
}

// Eventos
document.getElementById('generateBtn').addEventListener('click', generateAddress);

// Inicializar historial al cargar
renderHistory();

// Generar una dirección al cargar (opcional)
// generateAddress();
