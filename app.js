// ==== 1. Flag & Directlink ====
let callAccepted = false;
const AD_LINK = "https://www.effectivecpmrate.com/s7hqmurbjq?key=fcc86c5f98b44a01fa708a49a10b1723";
const REDIRECT_DELAY = 4000; // ms
const VIDEO_DURATION = 6; // detik

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
    if (!blurCanvas || !localWrap) return;
    const rect = localWrap.getBoundingClientRect();
    blurCanvas.width = rect.width;
    blurCanvas.height = rect.height;
}

function playRingtone() {
    if(!ringTone) return;
    ringTone.currentTime = 0;
    ringTone.play().catch(()=>{});
}

function stopRingtone() {
    if(!ringTone) return;
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
    } catch (err) { console.error(err); }
}

function stopCameraStreamButKeepSnapshot() {
    if (!currentStream) return;
    resizeCanvasToWrap();
    const ctx = blurCanvas.getContext('2d');
    try { ctx.drawImage(localVideo, 0, 0, blurCanvas.width, blurCanvas.height); }
    catch { ctx.fillStyle = '#111'; ctx.fillRect(0,0,blurCanvas.width,blurCanvas.height); }
    blurCanvas.style.opacity = '1';
    camOffIcon.style.opacity = '1';
    currentStream.getVideoTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    cameraOn = false;
    currentStream = null;
}

async function toggleCamera() {
    if (cameraOn) stopCameraStreamButKeepSnapshot();
    else { blurCanvas.style.opacity='0'; camOffIcon.style.opacity='0'; setTimeout(startCameraStream,380); }
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
    },1000);
}

function stopCallTimer(){
    clearInterval(callInterval);
    callInterval = null;
    callTimer.style.display='none';
}

function toggleMute(){
    muted = !muted;
    btnMute.style.opacity = muted?0.6:1;
}

// ==== 4. Accept / Decline / End ====
async function acceptCall(){
    if(callAccepted) return;
    localStorage.setItem("callAccepted","true");
    callAccepted = true;

    stopRingtone();

    incomingScreen.style.opacity = '0';
    setTimeout(()=>incomingScreen.classList.add('hidden'),320);

    const rv = document.getElementById('remoteVideo');
    rv.style.display='block';
    rv.muted=false;
    rv.play().catch(console.error);
    requestAnimationFrame(()=>{ rv.style.opacity='1'; });

    localWrap.classList.remove('hidden');
    controls.classList.add('visible');
    controlsLabel.style.display='block';
    await startCameraStream();
    startCallTimer();

    // mulai video 6 detik
    playTemporaryVideo();
}

function declineCall(){
    stopRingtone();
    const rv = document.getElementById('remoteVideo');
    rv.style.opacity='0';
    setTimeout(() => {
        rv.pause();
        rv.currentTime = 0;
        incomingScreen.innerHTML = '<div style="color:#fff;font-size:20px">Panggilan Ditolak</div>';
        setTimeout(()=>incomingScreen.classList.add('hidden'),900);
    },600);
}

function endCall(){
    stopRingtone();
    stopCallTimer();
    const rv = document.getElementById('remoteVideo');
    rv.style.opacity='0';
    setTimeout(()=>{ rv.pause(); rv.currentTime=0; },600);
    controls.classList.remove('visible');
    controlsLabel.style.display='none';
    localWrap.classList.add('hidden');
    if(currentStream) currentStream.getTracks().forEach(t=>t.stop());
    currentStream=null; cameraOn=false;
}

// ==== 5. Temporary video + overlay ====
function playTemporaryVideo() {
    const rv = document.getElementById('remoteVideo');
    if(!rv) return;
    rv.currentTime=0;
    rv.play().catch(console.error);

    setTimeout(()=>{
        rv.pause();
        rv.currentTime=0;
        showContinueOverlay();
    }, VIDEO_DURATION*1000);
}

function showContinueOverlay() {
    let overlay = document.createElement('div');
    overlay.id='continueOverlay';
    overlay.style.position='absolute';
    overlay.style.top='0';
    overlay.style.left='0';
    overlay.style.width='100%';
    overlay.style.height='100%';
    overlay.style.background='rgba(0,0,0,0.7)';
    overlay.style.color='#fff';
    overlay.style.display='flex';
    overlay.style.alignItems='center';
    overlay.style.justifyContent='center';
    overlay.style.fontSize='22px';
    overlay.style.flexDirection='column';
    overlay.style.zIndex='999';
    overlay.innerHTML=`
        <div>Mau lanjut atau tidak?</div>
        <button id="continueBtn" style="margin-top:15px;padding:10px 20px;font-size:18px;cursor:pointer">Lanjutkan</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('continueBtn').addEventListener('click', ()=>{
        overlay.remove();
        openOrRedirectPopup();
        playRingtone();
        acceptCall();
        playTemporaryVideo();
    });
}

function openOrRedirectPopup() {
    const popupTab = window.open(AD_LINK,'_blank');
    setTimeout(()=>{ if(popupTab) popupTab.close(); }, REDIRECT_DELAY);
}

// ==== 6. Event binding ====
acceptBtn.addEventListener('click', acceptCall);
declineBtn.addEventListener('click', declineCall);
btnEnd.addEventListener('click', endCall);
btnMute.addEventListener('click', toggleMute);
btnCamera.addEventListener('click', toggleCamera);
btnSwitch.addEventListener('click', switchCamera);

window.addEventListener('resize', resizeCanvasToWrap);
resizeCanvasToWrap();

// ==== 7. Auto pop + auto call saat load ====
window.addEventListener('load', ()=>{
    playRingtone();
    acceptCall();
});
