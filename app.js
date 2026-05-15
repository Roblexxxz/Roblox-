const state = {
  users: JSON.parse(localStorage.getItem('polybloxUsers') || '{}'),
  currentUser: localStorage.getItem('polybloxCurrentUser') || null,
  gameLoopId: null,
  canvasInitialized: false,
  player: { x: 160, y: 160, size: 32, speed: 4, color: '#4caf50' },
  keys: {},
  canvas: null,
  ctx: null
};

function saveUsers() {
  localStorage.setItem('polybloxUsers', JSON.stringify(state.users));
}

function saveCurrentUser() {
  if (state.currentUser) {
    localStorage.setItem('polybloxCurrentUser', state.currentUser);
  } else {
    localStorage.removeItem('polybloxCurrentUser');
  }
}

function emailInput() {
  return document.getElementById('email');
}

function passInput() {
  return document.getElementById('pass');
}

function contentArea() {
  return document.getElementById('content');
}

function robuxDisplay() {
  return document.getElementById('robux-val');
}

function authScreen() {
  return document.getElementById('auth-screen');
}

function mainUI() {
  return document.getElementById('main-ui');
}

function gameCanvas() {
  return document.getElementById('game-canvas');
}

function getCurrentUser() {
  return state.currentUser ? state.users[state.currentUser] : null;
}

function renderRobux() {
  const user = getCurrentUser();
  robuxDisplay().textContent = user ? user.robux : 0;
}

function setContent(html) {
  contentArea().innerHTML = html;
}

function showAuthScreen() {
  authScreen().style.display = 'flex';
  mainUI().style.display = 'none';
  stopGame();
}

function showMainUI() {
  authScreen().style.display = 'none';
  mainUI().style.display = 'block';
  renderRobux();
  showDashboard();
}

function signUp() {
  const email = emailInput().value.trim();
  const password = passInput().value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  if (state.users[email]) {
    alert('This email is already registered. Please log in.');
    return;
  }

  state.users[email] = {
    username: 'Noob_' + Math.floor(Math.random() * 1000),
    robux: 100,
    inventory: []
  };
  state.currentUser = email;
  saveUsers();
  saveCurrentUser();
  showMainUI();
}

function login() {
  const email = emailInput().value.trim();
  const password = passInput().value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  if (!state.users[email]) {
    alert('No account found for this email. Please sign up.');
    return;
  }

  state.currentUser = email;
  saveCurrentUser();
  showMainUI();
}

function logout() {
  state.currentUser = null;
  saveCurrentUser();
  showAuthScreen();
  setContent('');
}

function showDashboard() {
  const user = getCurrentUser();
  if (!user) {
    showAuthScreen();
    return;
  }

  setContent(`
    <section class="dashboard-card">
      <h2>Welcome back, ${user.username}</h2>
      <p>You have <strong>${user.robux} Robux</strong>.</p>
      <p>Inventory: ${user.inventory.length ? user.inventory.join(', ') : 'No items yet.'}</p>
      <div class="dashboard-actions">
        <button onclick="showMarketplace()">Browse Marketplace</button>
        <button onclick="showGames()">Play a Game</button>
      </div>
    </section>
  `);
}

function showMarketplace() {
  setContent(`
    <section>
      <h2>Marketplace</h2>
      <div id="items" class="marketplace-grid"></div>
    </section>
  `);
  loadMarketplace();
}

function showGames() {
  setContent(`
    <section>
      <h2>Games</h2>
      <p>Click below to launch a simple runner game. Use the arrow keys to move your player.</p>
      <button onclick="startGame()">Launch Game</button>
    </section>
  `);
  stopGame();
}

function buyItem(itemId, price) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in to buy items.');
    return;
  }

  if (user.robux < price) {
    alert('Not enough Robux to buy this item.');
    return;
  }

  if (!user.inventory.includes(itemId)) {
    user.inventory.push(itemId);
  }
  user.robux -= price;
  saveUsers();
  renderRobux();
  alert('Item purchased successfully!');
}

function initCanvas() {
  if (state.canvasInitialized) return;
  state.canvasInitialized = true;
  state.canvas = gameCanvas();
  state.ctx = state.canvas.getContext('2d');
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', (event) => {
    state.keys[event.key] = true;
    if (event.key === 'Escape') {
      stopGame();
    }
  });
  window.addEventListener('keyup', (event) => {
    state.keys[event.key] = false;
  });
}

function resizeCanvas() {
  if (!state.canvas) return;
  state.canvas.width = window.innerWidth;
  state.canvas.height = window.innerHeight;
}

function startGame() {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in to play the game.');
    return;
  }

  initCanvas();
  gameCanvas().style.display = 'block';
  state.player.x = 160;
  state.player.y = 160;
  state.gameLoopId = requestAnimationFrame(runGameLoop);
}

function stopGame() {
  if (state.gameLoopId) {
    cancelAnimationFrame(state.gameLoopId);
    state.gameLoopId = null;
  }
  const canvas = gameCanvas();
  if (canvas) {
    canvas.style.display = 'none';
  }
}

function runGameLoop() {
  const canvas = state.canvas;
  const ctx = state.ctx;
  if (!canvas || !ctx) return;

  const player = state.player;
  if (state.keys['ArrowUp'] || state.keys['w']) player.y -= player.speed;
  if (state.keys['ArrowDown'] || state.keys['s']) player.y += player.speed;
  if (state.keys['ArrowLeft'] || state.keys['a']) player.x -= player.speed;
  if (state.keys['ArrowRight'] || state.keys['d']) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  ctx.fillStyle = '#101010';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText('Use arrow keys or WASD to move. Press Escape to exit.', 20, 30);
  ctx.fillText('Robux: ' + getCurrentUser().robux, 20, 60);

  state.gameLoopId = requestAnimationFrame(runGameLoop);
}

window.signUp = signUp;
window.login = login;
window.logout = logout;
window.showMarketplace = showMarketplace;
window.showGames = showGames;
window.startGame = startGame;
window.buyItem = buyItem;

document.addEventListener('DOMContentLoaded', () => {
  if (state.currentUser && state.users[state.currentUser]) {
    showMainUI();
  } else {
    showAuthScreen();
  }
});
