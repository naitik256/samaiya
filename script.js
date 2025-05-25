let todaySeconds = 0;
let isRunning = false;
let timerInterval = null;
let wakeLock = null;

const todayKey = new Date().toISOString().slice(0, 10);
const videoElement = document.createElement("video");
videoElement.setAttribute("playsinline", true);
document.body.appendChild(videoElement);

const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", resetTimer);

let faceLookingForward = false;
let isWriting = false;

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
    }
  } catch (err) {
    console.error("Wake Lock error:", err);
  }

  document.addEventListener("visibilitychange", async () => {
    if (wakeLock && document.visibilityState === "visible") {
      await requestWakeLock();
    }
  });
}

function updateTime() {
  todaySeconds++;
  updateClockDisplay(todaySeconds);
  localStorage.setItem(todayKey, todaySeconds);
  updateDailyReport();
}

function updateClockDisplay(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const digits = hrs + mins + secs;

  const units = ["hourTens", "hourOnes", "minuteTens", "minuteOnes", "secondTens", "secondOnes"];
  digits.split('').forEach((digit, idx) => {
    const unit = document.querySelector(`[data-unit="${units[idx]}"]`);
    if (unit && unit.dataset.value !== digit) {
      unit.dataset.value = digit;
      unit.textContent = digit;
      unit.classList.remove("flip");
      void unit.offsetWidth;
      unit.classList.add("flip");
    }
  });
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timerInterval = setInterval(updateTime, 1000);
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(timerInterval);
  }
}

function resetTimer() {
  pauseTimer();
  todaySeconds = 0;
  localStorage.removeItem(todayKey);
  updateClockDisplay(todaySeconds);
  updateDailyReport();
}

function loadStoredTime() {
  const saved = localStorage.getItem(todayKey);
  if (saved) {
    todaySeconds = parseInt(saved);
    updateClockDisplay(todaySeconds);
  }
  updateDailyReport();
}

function updateDailyReport() {
  const report = document.getElementById("daily-report");
  if (!report) return;
  report.innerHTML = "";
  Object.keys(localStorage)
    .filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort()
    .reverse()
    .forEach(key => {
      const sec = parseInt(localStorage.getItem(key));
      const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
      const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const secs = String(sec % 60).padStart(2, "0");
      const li = document.createElement("li");
      li.textContent = `${key}: ${hrs}:${mins}:${secs}`;
      report.appendChild(li);
    });
}

// BlazePose writing detection
function isWritingPose(landmarks) {
  const headY = landmarks[0].y;
  const leftWristY = landmarks[15].y;
  const rightWristY = landmarks[16].y;
  return (headY < leftWristY && headY < rightWristY);
}

// FaceMesh face direction detection
function checkFaceDirection(landmarks) {
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const noseTip = landmarks[1];
  const noseCenter = (leftEye.x + rightEye.x) / 2;
  const angle = noseTip.x - noseCenter;
  return Math.abs(angle) < 0.03;
}

function evaluateStudyStatus() {
  if (isWriting && faceLookingForward) {
    statusText.textContent = "✅ Studying";
    startTimer();
  } else {
    statusText.textContent = "⏸️ Paused (Posture or Face)";
    pauseTimer();
  }
}

window.onload = async () => {
  await requestWakeLock();
  loadStoredTime();

  const pose = new Pose({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
  });
  const faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
  });

  pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults(results => {
    if (results.poseLandmarks) {
      isWriting = isWritingPose(results.poseLandmarks);
      evaluateStudyStatus();
    }
  });

  faceMesh.onResults(results => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      faceLookingForward = checkFaceDirection(results.multiFaceLandmarks[0]);
      evaluateStudyStatus();
    } else {
      faceLookingForward = false;
      evaluateStudyStatus();
    }
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  camera.start();
};
