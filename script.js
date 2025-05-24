let timerSeconds = 0;
let interval = null;

function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return h + m + s;
}

function updateClock() {
  const formatted = formatTime(timerSeconds);
  document.getElementById('h1').textContent = formatted[0];
  document.getElementById('h2').textContent = formatted[1];
  document.getElementById('m1').textContent = formatted[2];
  document.getElementById('m2').textContent = formatted[3];
  document.getElementById('s1').textContent = formatted[4];
  document.getElementById('s2').textContent = formatted[5];
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
