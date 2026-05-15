async function loadMarketplace() {
  const response = await fetch('market.json');
  const data = await response.json();
  const marketGrid = document.getElementById('items');
  marketGrid.innerHTML = '';

  data.catalog.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    itemCard.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.price} Robux</p>
      <button onclick="buyItem('${item.id}', ${item.price})">Buy</button>
    `;
    marketGrid.appendChild(itemCard);
  });
}
