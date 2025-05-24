let todaySeconds = 0;
let startTime = 0;
let isRunning = false;
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
    console.error("Wake Lock failed:", err);
  }

  document.addEventListener("visibilitychange", async () => {
    if (wakeLock && document.visibilityState === "visible") {
      await requestWakeLock();
    }
  });
}

function updateTime() {
  todaySeconds++;
  updateFlipClock(todaySeconds);
  localStorage.setItem(todayKey, todaySeconds);
  updateDailyReport();
}

function updateFlipClock(sec) {
  const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const secs = String(sec % 60).padStart(2, "0");

  setFlip("hours", hrs);
  setFlip("minutes", mins);
  setFlip("seconds", secs);
}

function setFlip(id, value) {
  const unit = document.getElementById(id);
  const upper = unit.querySelector(".upper");
  const lower = unit.querySelector(".lower");

  if (upper.textContent !== value) {
    upper.textContent = value;
    lower.textContent = value;
    unit.classList.remove("flip");
    void unit.offsetWidth; // trigger reflow
    unit.classList.add("flip");
  }
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = setInterval(updateTime, 1000);
  }
}

function pauseTimer() {
  if (isRunning) {
    isRunning = false;
    clearInterval(startTime);
  }
}

function resetTimer() {
  pauseTimer();
  todaySeconds = 0;
  updateFlipClock(todaySeconds);
  localStorage.removeItem(todayKey);
  updateDailyReport();
}

function loadStoredTime() {
  const saved = localStorage.getItem(todayKey);
  if (saved) {
    todaySeconds = parseInt(saved);
    updateFlipClock(todaySeconds);
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

// BlazePose logic
function isWritingPose(landmarks) {
  const headY = landmarks[0].y;
  const leftWristY = landmarks[15].y;
  const rightWristY = landmarks[16].y;
  return (headY < leftWristY && headY < rightWristY);
}

// FaceMesh logic
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
    statusText.textContent = "Focused — Studying";
    startTimer();
  } else {
    statusText.textContent = "Not Focused — Paused";
    pauseTimer();
  }
}

window.onload = async () => {
  await requestWakeLock();
  loadStoredTime();

  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
  });
  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
  });

  pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults((results) => {
    if (results.poseLandmarks) {
      isWriting = isWritingPose(results.poseLandmarks);
      evaluateStudyStatus();
    }
  });

  faceMesh.onResults((results) => {
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
