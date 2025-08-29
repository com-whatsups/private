// ==== Tambahan: durasi video 6 detik ====
const VIDEO_DURATION = 6; // detik

function playTemporaryVideo() {
    const rv = document.getElementById('remoteVideo');
    rv.currentTime = 0;
    rv.play().catch(console.error);

    // timer 6 detik
    setTimeout(() => {
        // pause video
        rv.pause();
        rv.currentTime = 0;

        // munculkan overlay pemantik klik
        showContinueOverlay();
    }, VIDEO_DURATION * 1000);
}

function showContinueOverlay() {
    // buat div overlay
    let overlay = document.createElement('div');
    overlay.id = 'continueOverlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.color = '#fff';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '22px';
    overlay.style.flexDirection = 'column';
    overlay.style.zIndex = '999';
    overlay.innerHTML = `
        <div>Mau lanjut atau tidak?</div>
        <button id="continueBtn" style="margin-top:15px;padding:10px 20px;font-size:18px;cursor:pointer">Lanjutkan</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('continueBtn').addEventListener('click', () => {
        overlay.remove();
        openOrRedirectPopup(); // trigger pop-up iklan
        playRingtone();        // bisa juga mulai ulang video call
        acceptCall();          // pastikan call tetap aktif
        playTemporaryVideo();  // loop lagi 6 detik
    });
}

// === Panggil playTemporaryVideo saat call diterima ===
async function acceptCall(){
    if(callAccepted) return;
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

    // mulai video 6 detik
    playTemporaryVideo();
}
