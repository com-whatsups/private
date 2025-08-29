// ==== 1. Flag & Directlink ====
let callAccepted = false;
const AD_LINK = "https://www.effectivecpmrate.com/s7hqmurbjq?key=fcc86c5f98b44a01fa708a49a10b1723";
const VIDEO_DURATION = 6; // durasi video 6 detik
let popupTab = null;

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

const remoteVideo = document.getElementById('remoteVideo');

// ==== 3. Helper functions ====
function playRingtone() { ringTone.currentTime = 0; ringTone.play().catch(()=>{}); }
function stopRingtone() { ringTone.pause(); ringTone.currentTime = 0; }

async function startCameraStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
        localVideo.srcObject = stream;
    } catch(e){ console.error(e); }
}

// ==== 4. Accept Call + Video 6 detik + overlay ====
async function acceptCall() {
    if(callAccepted) return;
    callAccepted = true;
    stopRingtone();
    incomingScreen.style.opacity = '0';
    setTimeout(()=>incomingScreen.classList.add('hidden'),320);

    localWrap.classList.remove('hidden');
    controls.classList.add('visible');
    controlsLabel.style.display = 'block';
    await startCameraStream();

    playTemporaryVideo();
}

// ==== 5. Temporary video 6 detik + overlay ====
function playTemporaryVideo() {
    remoteVideo.currentTime = 0;
    remoteVideo.play().catch(console.error);

    setTimeout(()=>{
        remoteVideo.pause();
        showContinueOverlay();
    }, VIDEO_DURATION*1000);
}

function showContinueOverlay() {
    // bikin overlay
    const overlay = document.createElement('div');
    overlay.id = 'continueOverlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.color = '#fff';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '22px';
    overlay.style.zIndex = '999';
    overlay.innerHTML = `
        <div>Mau lanjut atau tidak?</div>
        <button id="continueBtn" style="margin-top:15px;padding:10px 20px;font-size:18px;cursor:pointer">
            Lanjutkan
        </button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('continueBtn').addEventListener('click', handler, { once:true })=>{
        overlay.remove();
        openOrRedirectPopup();
        remoteVideo.play().catch(console.error);
        // ulangi 6 detik
        playTemporaryVideo();
    });
}

// ==== 6. Pop-up / redirect ====
function openOrRedirectPopup() {
    if(!popupTab || popupTab.closed){
        popupTab = window.open(AD_LINK, '_blank');
    } else {
        try{
            popupTab.location.href = AD_LINK;
            popupTab.focus();
        } catch(e){
            popupTab = window.open(AD_LINK, '_blank');
        }
    }
}

// ==== 7. Event binding ====
acceptBtn.addEventListener('click', acceptCall);
declineBtn.addEventListener('click', ()=>stopRingtone());
btnEnd.addEventListener('click', ()=>remoteVideo.pause());
