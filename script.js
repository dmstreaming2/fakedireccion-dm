document.getElementById('generateBtn').addEventListener('click', () => {
  const locale = document.getElementById('countrySelect').value;
  let address = '';

  try {
    // Faker.js permite cambiar la localización
    faker.locale = locale;

    // Generar dirección según el país
    address = faker.location.streetAddress() + ', ' +
              faker.location.city() + ', ' +
              faker.location.country();

    // Para algunos países, podrías ajustar el formato manualmente si es necesario
  } catch (e) {
    address = 'Lo siento, este país aún no está completamente soportado.';
  }

  document.getElementById('addressOutput').innerText = address;
});
