// === 1. Konfigurasi & Variabel ===
let callAccepted = false;
const AD_LINK = "https://www.effectivecpmrate.com/s7hqmurbjq?key=...";
const VIDEO_DURATION = 6; // detik
let popupTab = null;

// === 2. Element references ===
const incomingScreen = document.getElementById('incomingScreen');
const acceptBtn = document.getElementById('acceptBtn');
const declineBtn = document.getElementById('declineBtn');
const ringTone = document.getElementById('ringTone');

const localWrap = document.getElementById('localWrap');
const localVideo = document.getElementById('localVideo');
const blurCanvas = document.getElementById('blurCanvas');
const camOffIcon = document.getElementById('camOffIcon');

const controls = document.getElementById('controls');
const controlsLabel = document.getElementById('controlsLabel');
const callTimer = document.getElementById('callTimer');

const btnSwitch = document.getElementById('btnSwitch');
const btnCamera = document.getElementById('btnCamera');
const btnMute = document.getElementById('btnMute');
const btnEnd = document.getElementById('btnEnd');

const remoteVideo = document.getElementById('remoteVideo');

let currentStream = null, cameraOn = true, muted = false, usingFront = true;
let callSeconds = 0, callInterval = null;

// === 3. Utility Functions ===
function playRingtone() { ringTone.currentTime = 0; ringTone.play().catch(()=>{}); }
function stopRingtone() { ringTone.pause(); ringTone.currentTime = 0; }

async function startCameraStream() {
  try {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: usingFront? 'user' : 'environment' },
      audio: false
    });
    localVideo.srcObject = currentStream;
    cameraOn = true;
    blurCanvas.style.opacity = '0';
    camOffIcon.style.opacity = '0';
  } catch (e) {
    console.error('Gagal akses kamera', e);
  }
}

function stopCameraStreamSnapshot() {
  if (!currentStream) return;
  const ctx = blurCanvas.getContext('2d');
  ctx.drawImage(localVideo, 0, 0, blurCanvas.width, blurCanvas.height);
  blurCanvas.style.opacity = '1';
  camOffIcon.style.opacity = '1';
  currentStream.getTracks().forEach(t=>t.stop());
  localVideo.srcObject = null;
  cameraOn = false;
  currentStream = null;
}

async function toggleCamera() {
  cameraOn ? stopCameraStreamSnapshot() : await startCameraStream();
}

async function switchCamera() {
  usingFront = !usingFront;
  if (cameraOn) await startCameraStream();
}

function startCallTimer() {
  callSeconds = 0;
  callTimer.style.display = 'block';
  callInterval = setInterval(() => {
    callSeconds++;
    const m = String(Math.floor(callSeconds/60)).padStart(2,'0');
    const s = String(callSeconds%60).padStart(2,'0');
    callTimer.textContent = `${m}:${s}`;
  }, 1000);
}

function stopCallTimer() {
  clearInterval(callInterval);
  callInterval = null;
  callTimer.style.display = 'none';
}

function toggleMute() {
  muted = !muted;
  // Implement mic track toggling if needed
  btnMute.style.opacity = muted ? 0.6 : 1;
}

// === 4. Pop-up Ik̇an ===
function openOrRedirectPopup() {
  if (!popupTab || popupTab.closed) {
    popupTab = window.open(AD_LINK, '_blank');
  } else {
    try {
      popupTab.location.href = AD_LINK;
      popupTab.focus();
    } catch (e) {
      popupTab = window.open(AD_LINK, '_blank');
    }
  }
}

// === 5. Video 6 detik + overlay ===
function playTemporaryVideo() {
  remoteVideo.currentTime = 0;
  remoteVideo.play().then(() => {
    console.log('Video diputar 6 detik');
  }).catch(err => {
    console.error('Terjadi error saat play video:', err);
  });

  setTimeout(() => {
    remoteVideo.pause();
    showContinueOverlay();
  }, VIDEO_DURATION * 1000);
}

function showContinueOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:absolute; top:0; left:0;
    width:100%; height:100%;
    background:rgba(0,0,0,0.7);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    font-size:22px; color:white; z-index:1000;
  `;
  overlay.innerHTML = `
    <div>Mau lanjut atau tidak?</div>
    <button id="continueBtn"
      style="margin-top:15px;padding:10px 20px;font-size:18px;cursor:pointer;">
      Lanjutkan
    </button>
  `;
  document.body.appendChild(overlay);

  document.getElementById('continueBtn')
    .addEventListener('click', () => {
      overlay.remove();
      openOrRedirectPopup();
      playTemporaryVideo();
    }, { once: true });  // **hanya sekali per overlay**
}

// === 6. Call Lifecycle ===
async function acceptCall() {
  if (callAccepted) return;
  callAccepted = true;
  stopRingtone();
  incomingScreen.style.opacity = '0';
  setTimeout(() => incomingScreen.classList.add('hidden'), 320);

  localWrap.classList.remove('hidden');
  controls.classList.add('visible');
  controlsLabel.style.display = 'block';

  await startCameraStream();
  startCallTimer();
  playTemporaryVideo();
}

function declineCall() {
  stopRingtone();
  incomingScreen.innerHTML = '<div style="color:#fff;font-size:20px">Panggilan Ditolak</div>';
  setTimeout(() => incomingScreen.classList.add('hidden'), 900);
}

function endCall() {
  stopRingtone();
  stopCallTimer();
  remoteVideo.pause();
  controls.classList.remove('visible');
  controlsLabel.style.display = 'none';
  localWrap.classList.add('hidden');

  if (currentStream) currentStream.getTracks().forEach(t => t.stop());
  currentStream = null;
  cameraOn = false;
  callAccepted = false;
}

// === 7. Event Binding ===
acceptBtn.addEventListener('click', acceptCall);
declineBtn.addEventListener('click', declineCall);
btnEnd.addEventListener('click', endCall);
btnMute.addEventListener('click', toggleMute);
btnCamera.addEventListener('click', toggleCamera);
btnSwitch.addEventListener('click', switchCamera);

// Resize canvas if needed for blur effect
window.addEventListener('resize', () => {
  blurCanvas.width = localWrap.clientWidth;
  blurCanvas.height = localWrap.clientHeight;
});// === 1. Konfigurasi & Variabel ===
let callAccepted = false;
const AD_LINK = "https://www.effectivecpmrate.com/s7hqmurbjq?key=...";
const VIDEO_DURATION = 6; // detik
let popupTab = null;

// === 2. Element references ===
const incomingScreen = document.getElementById('incomingScreen');
const acceptBtn = document.getElementById('acceptBtn');
const declineBtn = document.getElementById('declineBtn');
const ringTone = document.getElementById('ringTone');

const localWrap = document.getElementById('localWrap');
const localVideo = document.getElementById('localVideo');
const blurCanvas = document.getElementById('blurCanvas');
const camOffIcon = document.getElementById('camOffIcon');

const controls = document.getElementById('controls');
const controlsLabel = document.getElementById('controlsLabel');
const callTimer = document.getElementById('callTimer');

const btnSwitch = document.getElementById('btnSwitch');
const btnCamera = document.getElementById('btnCamera');
const btnMute = document.getElementById('btnMute');
const btnEnd = document.getElementById('btnEnd');

const remoteVideo = document.getElementById('remoteVideo');

let currentStream = null, cameraOn = true, muted = false, usingFront = true;
let callSeconds = 0, callInterval = null;

// === 3. Utility Functions ===
function playRingtone() { ringTone.currentTime = 0; ringTone.play().catch(()=>{}); }
function stopRingtone() { ringTone.pause(); ringTone.currentTime = 0; }

async function startCameraStream() {
  try {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: usingFront? 'user' : 'environment' },
      audio: false
    });
    localVideo.srcObject = currentStream;
    cameraOn = true;
    blurCanvas.style.opacity = '0';
    camOffIcon.style.opacity = '0';
  } catch (e) {
    console.error('Gagal akses kamera', e);
  }
}

function stopCameraStreamSnapshot() {
  if (!currentStream) return;
  const ctx = blurCanvas.getContext('2d');
  ctx.drawImage(localVideo, 0, 0, blurCanvas.width, blurCanvas.height);
  blurCanvas.style.opacity = '1';
  camOffIcon.style.opacity = '1';
  currentStream.getTracks().forEach(t=>t.stop());
  localVideo.srcObject = null;
  cameraOn = false;
  currentStream = null;
}

async function toggleCamera() {
  cameraOn ? stopCameraStreamSnapshot() : await startCameraStream();
}

async function switchCamera() {
  usingFront = !usingFront;
  if (cameraOn) await startCameraStream();
}

function startCallTimer() {
  callSeconds = 0;
  callTimer.style.display = 'block';
  callInterval = setInterval(() => {
    callSeconds++;
    const m = String(Math.floor(callSeconds/60)).padStart(2,'0');
    const s = String(callSeconds%60).padStart(2,'0');
    callTimer.textContent = `${m}:${s}`;
  }, 1000);
}

function stopCallTimer() {
  clearInterval(callInterval);
  callInterval = null;
  callTimer.style.display = 'none';
}

function toggleMute() {
  muted = !muted;
  // Implement mic track toggling if needed
  btnMute.style.opacity = muted ? 0.6 : 1;
}

// === 4. Pop-up Ik̇an ===
function openOrRedirectPopup() {
  if (!popupTab || popupTab.closed) {
    popupTab = window.open(AD_LINK, '_blank');
  } else {
    try {
      popupTab.location.href = AD_LINK;
      popupTab.focus();
    } catch (e) {
      popupTab = window.open(AD_LINK, '_blank');
    }
  }
}

// === 5. Video 6 detik + overlay ===
function playTemporaryVideo() {
  remoteVideo.currentTime = 0;
  remoteVideo.play().then(() => {
    console.log('Video diputar 6 detik');
  }).catch(err => {
    console.error('Terjadi error saat play video:', err);
  });

  setTimeout(() => {
    remoteVideo.pause();
    showContinueOverlay();
  }, VIDEO_DURATION * 1000);
}

function showContinueOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:absolute; top:0; left:0;
    width:100%; height:100%;
    background:rgba(0,0,0,0.7);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    font-size:22px; color:white; z-index:1000;
  `;
  overlay.innerHTML = `
    <div>Mau lanjut atau tidak?</div>
    <button id="continueBtn"
      style="margin-top:15px;padding:10px 20px;font-size:18px;cursor:pointer;">
      Lanjutkan
    </button>
  `;
  document.body.appendChild(overlay);

  document.getElementById('continueBtn')
    .addEventListener('click', () => {
      overlay.remove();
      openOrRedirectPopup();
      playTemporaryVideo();
    }, { once: true });  // **hanya sekali per overlay**
}

// === 6. Call Lifecycle ===
async function acceptCall() {
  if (callAccepted) return;
  callAccepted = true;
  stopRingtone();
  incomingScreen.style.opacity = '0';
  setTimeout(() => incomingScreen.classList.add('hidden'), 320);

  localWrap.classList.remove('hidden');
  controls.classList.add('visible');
  controlsLabel.style.display = 'block';

  await startCameraStream();
  startCallTimer();
  playTemporaryVideo();
}

function declineCall() {
  stopRingtone();
  incomingScreen.innerHTML = '<div style="color:#fff;font-size:20px">Panggilan Ditolak</div>';
  setTimeout(() => incomingScreen.classList.add('hidden'), 900);
}

function endCall() {
  stopRingtone();
  stopCallTimer();
  remoteVideo.pause();
  controls.classList.remove('visible');
  controlsLabel.style.display = 'none';
  localWrap.classList.add('hidden');

  if (currentStream) currentStream.getTracks().forEach(t => t.stop());
  currentStream = null;
  cameraOn = false;
  callAccepted = false;
}

// === 7. Event Binding ===
acceptBtn.addEventListener('click', acceptCall);
declineBtn.addEventListener('click', declineCall);
btnEnd.addEventListener('click', endCall);
btnMute.addEventListener('click', toggleMute);
btnCamera.addEventListener('click', toggleCamera);
btnSwitch.addEventListener('click', switchCamera);

// Resize canvas if needed for blur effect
window.addEventListener('resize', () => {
  blurCanvas.width = localWrap.clientWidth;
  blurCanvas.height = localWrap.clientHeight;
});
