const state = {
  balance: 1500,
  bet: 10,
  activeTab: 'slot',
  history: [
    '+€35 · Slots',
    '-€20 · Roulette',
    '+€60 · Plinko'
  ]
};

const symbols = ['🍒', '💎', '7', '🍋', 'BAR', '⭐'];
const tabButtons = document.querySelectorAll('.tab-btn');
const chipButtons = document.querySelectorAll('.chip-btn');
const balanceDisplay = document.getElementById('balanceDisplay');
const historyList = document.getElementById('historyList');
const slotBetDisplay = document.getElementById('slotBetDisplay');
const rouletteBetDisplay = document.getElementById('rouletteBetDisplay');
const plinkoBetDisplay = document.getElementById('plinkoBetDisplay');

const slotSpinBtn = document.getElementById('slotSpinBtn');
const rouletteSpinBtn = document.getElementById('rouletteSpinBtn');
const plinkoDropBtn = document.getElementById('plinkoDropBtn');

const rouletteWheel = document.getElementById('rouletteWheel');
const rouletteNumber = document.getElementById('rouletteNumber');
const rouletteColor = document.getElementById('rouletteColor');
const plinkoBoard = document.getElementById('plinkoBoard');

function renderBalance() {
  balanceDisplay.textContent = `€${state.balance}`;
  slotBetDisplay.textContent = `€${state.bet}`;
  rouletteBetDisplay.textContent = `€${state.bet}`;
  plinkoBetDisplay.textContent = `€${state.bet}`;
}

function renderHistory() {
  historyList.innerHTML = state.history.map(item => `<li>${item}</li>`).join('');
}

function setBet(amount) {
  state.bet = amount;
  chipButtons.forEach(button => button.classList.toggle('active', Number(button.dataset.bet) === amount));
  renderBalance();
}

chipButtons.forEach(button => {
  button.addEventListener('click', () => {
    setBet(Number(button.dataset.bet));
  });
});

function setTab(tabName) {
  state.activeTab = tabName;
  tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === tabName));
  document.querySelectorAll('.game-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tabName}Panel`);
  });
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => setTab(button.dataset.tab));
});

function spinSlot() {
  if (state.balance < state.bet) {
    alert('Zu wenig Guthaben!');
    return;
  }

  state.balance -= state.bet;
  const results = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);

  results.forEach((symbol, index) => {
    const reel = document.getElementById(`reel${index + 1}`);
    reel.innerHTML = `<span class="symbol">${symbol}</span>`;
    reel.style.transform = 'scale(1.04)';
    setTimeout(() => { reel.style.transform = 'scale(1)'; }, 180);
  });

  const payout = getSlotPayout(results);
  if (payout > 0) {
    state.balance += payout;
    state.history.unshift(`+€${payout} · Slots`);
  } else {
    state.history.unshift(`-€${state.bet} · Slots`);
  }

  if (state.history.length > 6) state.history.pop();
  renderBalance();
  renderHistory();
}

function getSlotPayout(reels) {
  const counts = {};
  reels.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);

  if (Object.values(counts).includes(3)) {
    const symbol = Object.entries(counts).find(([, count]) => count === 3)?.[0];
    const payoutMap = { '🍒': 6, '💎': 12, '7': 18, '🍋': 8, BAR: 10, '⭐': 16 };
    return (payoutMap[symbol] || 6) * state.bet;
  }

  if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    return state.bet * 2;
  }

  return 0;
}

function spinRoulette() {
  if (state.balance < state.bet) {
    alert('Zu wenig Guthaben!');
    return;
  }

  state.balance -= state.bet;
  const winningNumber = Math.floor(Math.random() * 37);
  const color = winningNumber === 0 ? 'Grün' : winningNumber % 2 === 0 ? 'Schwarz' : 'Rot';
  const rotation = 360 * (4 + Math.random() * 4) + (360 - (winningNumber / 37) * 360);
  rouletteWheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    rouletteNumber.textContent = String(winningNumber);
    rouletteColor.textContent = color;

    const payout = winningNumber === 0 ? state.bet * 10 : state.bet * 2;
    const resultText = color === 'Rot' || color === 'Schwarz' ? `+€${payout} · Roulette` : `+€${payout} · Roulette`;

    if (winningNumber !== 0) {
      state.balance += payout;
      state.history.unshift(resultText);
    } else {
      state.history.unshift(`+€${payout} · Roulette`);
      state.balance += payout;
    }

    if (state.history.length > 6) state.history.pop();
    renderBalance();
    renderHistory();
  }, 2800);
}

function buildPlinkoBoard() {
  plinkoBoard.innerHTML = '';
  const rows = 8;
  const cols = 9;
  const totalPins = 8 * 9;

  for (let row = 0; row < rows; row += 1) {
    const pinsInRow = row + 1;
    const startX = (cols - pinsInRow) / 2;

    for (let col = 0; col < pinsInRow; col += 1) {
      const pin = document.createElement('div');
      pin.className = 'pin';
      const px = 50 + ((startX + col) / cols) * 100;
      const py = 35 + (row / rows) * 68;
      pin.style.left = `${px}%`;
      pin.style.top = `${py}%`;
      plinkoBoard.appendChild(pin);
    }
  }
}

function dropPlinkoBall() {
  if (state.balance < state.bet) {
    alert('Zu wenig Guthaben!');
    return;
  }

  state.balance -= state.bet;
  renderBalance();

  const ball = document.createElement('div');
  ball.className = 'ball';
  ball.style.left = '50%';
  ball.style.top = '12px';
  plinkoBoard.appendChild(ball);

  const path = [];
  const cols = 9;
  let x = 50;
  let y = 12;
  for (let i = 0; i < 20; i += 1) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 7 + 4);
    x += offset;
    y += 10 + Math.random() * 13;
    path.push({ x, y });
  }

  const finalX = 12 + Math.random() * 76;
  const finalY = 328;

  let step = 0;
  const interval = setInterval(() => {
    if (step >= path.length) {
      clearInterval(interval);
      ball.style.left = `${finalX}%`;
      ball.style.top = `${finalY}px`;

      const multipliers = [0.5, 1, 2, 5, 10, 5, 2, 1, 0.5];
      const slot = Math.min(Math.max(Math.floor((finalX / 100) * multipliers.length), 0), multipliers.length - 1);
      const payout = multipliers[slot] * state.bet;
      state.balance += payout;
      state.history.unshift(`+€${payout.toFixed(0)} · Plinko`);
      if (state.history.length > 6) state.history.pop();
      renderBalance();
      renderHistory();
      setTimeout(() => ball.remove(), 600);
      return;
    }

    const point = path[step];
    ball.style.left = `${point.x}%`;
    ball.style.top = `${point.y}px`;
    step += 1;
  }, 80);
}

slotSpinBtn.addEventListener('click', spinSlot);
rouletteSpinBtn.addEventListener('click', spinRoulette);
plinkoDropBtn.addEventListener('click', dropPlinkoBall);

buildPlinkoBoard();
renderBalance();
renderHistory();
setBet(10);
