const MIN_SPINNER_MS = 400;
let API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
let coinsData = [];

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadData, MIN_SPINNER_MS);

  const searchInput = document.getElementById('filter-input');
  if (searchInput) {
    ['input', 'keyup'].forEach(evt =>
      searchInput.addEventListener(evt, () => filterTable(searchInput.value))
    );
  }

  const reloadButton = document.getElementById('reloadAPI');
  const coinsNumberInput = document.getElementById('coinsNumber');
  if (reloadButton && coinsNumberInput) {
    reloadButton.addEventListener('click', () => handleCoinsNumberChange(coinsNumberInput.value));
  }

});

document.addEventListener('DOMContentLoaded', async() => {
    console.log('App initialized');
    setTimeout(loadData, MIN_SPINNER_MS);
});

async function loadData() {
  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error('Error HTTP ' + resp.status);
    coinsData = await resp.json();

    // Guarda en localStorage
    localStorage.setItem('cryptoData', JSON.stringify(coinsData));

    console.table(coinsData);
    stopSpinner();
    renderTable(coinsData);
  } catch (err) {
    console.error('Error calling API:', err);
  }
}

function stopSpinner() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
  const table = document.getElementById('coins-table');
  if (table) {
    table.style.display = 'table';
  }
}

function renderTable(data) {
  const table = document.getElementById('coins-table');
  const tbody = table ? table.querySelector('tbody') : null;
  if (!tbody) return;

  // Borramos el contenido previo para el filter
  tbody.innerHTML = '';

  data.map(coin => {
    const row = document.createElement('tr');
    row.classList.add('coin-row');

    const priceChange = coin.price_change_percentage_24h;
    const changeClass = priceChange > 0 ? 'positive' : priceChange < 0 ? 'negative' : '';

    row.innerHTML = `
      <td><img src="${coin.image}" alt="${coin.name}" width="25" height="25"></td>
      <td>${coin.name}-${coin.symbol.toUpperCase()}</td>
      <td>$${coin.current_price.toLocaleString()}</td>
      <td class="${changeClass}">${priceChange > 0 ? '+' : ''}${priceChange}%</td>
    `;
    tbody.appendChild(row);
  })
}

function filterTable(query) {
    console.log('Filtering table with query:', query);
    const q = query.trim().toLowerCase();
    if (!q) return renderTable(coinsData);
    const filtered = coinsData.filter(currentCoin =>
    currentCoin.name.toLowerCase().includes(q) || currentCoin.symbol.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

function handleCoinsNumberChange(value) {
  const number = parseInt(value);

  // Validar que sea un número válido entre 1 y 250
  if (isNaN(number) || number < 1 || number > 250) {
    console.log('Invalid number of coins');
    return;
  }

  console.log('Changing number of coins to:', number);

  // Modificar API_URL cambiando el parámetro per_page
  const url = new URL(API_URL);
  url.searchParams.set('per_page', number);
  API_URL = url.toString();

  // Recargar los datos con la nueva URL
  loadData();
}
