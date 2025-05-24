let timerSeconds = 0;
let interval = null;
let lastDigits = "000000";

function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return h + m + s;
}

function updateClock() {
  const formatted = formatTime(timerSeconds);
  for (let i = 0; i < 6; i++) {
    const id = ['h1', 'h2', 'm1', 'm2', 's1', 's2'][i];
    const digitElem = document.getElementById(id);
    const newDigit = formatted[i];
    if (digitElem.getAttribute('data-digit') !== newDigit) {
      digitElem.classList.remove('flip');
      void digitElem.offsetWidth; // trigger reflow
      digitElem.setAttribute('data-digit', newDigit);
      digitElem.classList.add('flip');
    }
  }
  lastDigits = formatted;
}

function tick() {
  timerSeconds++;
  updateClock();
}

function startTimer() {
  if (!interval) {
    interval = setInterval(tick, 1000);
  }
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

document.getElementById('reset').onclick = function () {
  pauseTimer();
  timerSeconds = 0;
  updateClock();
};

function toggleFullscreen() {
  const app = document.getElementById('app');
  const btn = document.getElementById('fullscreenBtn');
  if (app.classList.contains('fullscreen')) {
    app.classList.remove('fullscreen');
    btn.textContent = '⛶';
  } else {
    app.classList.add('fullscreen');
    btn.textContent = '🗗';
  }
}

window.onload = () => {
  updateClock();
  startTimer();
};
