// ==========================================
// MODUL 2: SETUP KANVAS & ASAS JAVASCRIPT
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesHeartsEl = document.getElementById('lives-hearts');
const timerEl = document.getElementById('timer');

// Pembolehubah Asas Permainan
let score = 0;
let lives = 3;
let timeLeft = 100;
let isGameOver = false;

// 🚀 KELAJUAN DITUKAR KE 7 (Lebih laju & smooth!)
let baseSpeed = 7; 
let playerSpeed = baseSpeed; 

// Memuatkan Aset Imej dari folder assets/ (.png)
const playerImg1 = new Image(); playerImg1.src = 'assets/penyu.png';
const playerImg2 = new Image(); playerImg2.src = 'assets/penyu2.png';

const itemBotol = new Image(); itemBotol.src = 'assets/botol.png';
const itemPastik = new Image(); itemPastik.src = 'assets/pastik.png';
const itemSampah = new Image(); itemSampah.src = 'assets/sampah.png';
const itemObor = new Image(); itemObor.src = 'assets/obor.png';
const itemSealion = new Image(); itemSealion.src = 'assets/sealion.png';
const itemKapal = new Image(); itemKapal.src = 'assets/kapal.png';

// Objek Penyu (Pemain Utama)
const player = {
    x: canvas.width / 2 - 32,
    y: canvas.height - 120,
    width: 64,
    height: 64,
    currentImg: playerImg1,
    isImmune: false,
    isRedTint: false
};

let fallingObjects = [];
const keys = {};

// ==========================================
// MODUL 3: EVENT LISTENER, VELOCITY & BOUNDARY
// ==========================================

// Event Listener
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Pergerakan Laju & Smooth (WASD + Arrow Keys)
function updatePlayerPosition() {
    if (isGameOver) return;

    if (keys['w'] || keys['arrowup']) player.y -= playerSpeed;
    if (keys['s'] || keys['arrowdown']) player.y += playerSpeed;
    if (keys['a'] || keys['arrowleft']) player.x -= playerSpeed;
    if (keys['d'] || keys['arrowright']) player.x += playerSpeed;

    // Boundary Checking (450x800)
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
}

// Spawning Objek Jatuh
function spawnObject() {
    if (isGameOver) return;

    const items = [
        { img: itemBotol, points: 10, type: 'botol', isHazard: false },
        { img: itemPastik, points: 30, type: 'pastik', isHazard: false },
        { img: itemSampah, points: 50, type: 'sampah', isHazard: false },
        { img: itemObor, points: -10, type: 'obor', isHazard: false },
        { img: itemSealion, points: -20, type: 'sealion', isHazard: false },
        { img: itemKapal, points: 0, type: 'kapal', isHazard: true }
    ];

    const selected = items[Math.floor(Math.random() * items.length)];

    fallingObjects.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: selected.type === 'kapal' ? 64 : 40,
        height: selected.type === 'kapal' ? 64 : 40,
        speed: 2 + Math.random() * 2,
        ...selected
    });
}

// Collision Detection (AABB)
function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// MEKANIK KHAS 1: Tolak Nyawa + Berkelip Merah + Imuniti 5s
function triggerImmunity() {
    if (player.isImmune) return;

    lives--;
    updateUI();

    if (lives <= 0) {
        endGame("NYAWA HABIS!");
        return;
    }

    player.isImmune = true;

    let blinkInterval = setInterval(() => {
        player.isRedTint = !player.isRedTint;
        player.currentImg = (player.currentImg === playerImg1) ? playerImg2 : playerImg1;
    }, 150);

    setTimeout(() => {
        clearInterval(blinkInterval);
        player.isImmune = false;
        player.isRedTint = false;
        player.currentImg = playerImg1;
    }, 5000);
}

// MEKANIK KHAS 2: Jaring Plastik memperlahankan penyu selama 3s
function triggerSlowNet() {
    playerSpeed = 3; // Kelajuan perlahan sementara

    setTimeout(() => {
        if (!isGameOver) playerSpeed = baseSpeed; // Kembali ke kelajuan laju (7)
    }, 3000);
}

// Mengendalikan Perlanggaran
function handleCollisions() {
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        let obj = fallingObjects[i];

        if (checkCollision(player, obj)) {
            if (obj.isHazard) {
                triggerImmunity();
            } else {
                score = Math.max(0, score + obj.points);

                if (obj.type === 'pastik') {
                    triggerSlowNet();
                }
            }

            updateUI();
            fallingObjects.splice(i, 1);

            if (score >= 100) {
                endGame("TAHNIAH! ANDA MENANG!");
            }
        }
    }
}

// Melukis Penyu
function drawPlayer() {
    ctx.save();
    if (player.isRedTint) {
        ctx.filter = 'drop-shadow(0px 0px 8px red) sepia(1) saturate(5) hue-rotate(-50deg)';
    }
    ctx.drawImage(player.currentImg, player.x, player.y, player.width, player.height);
    ctx.restore();
}

// ==========================================
// GAME LOOP & PEMASA
// ==========================================
function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayerPosition();
    drawPlayer();

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        let obj = fallingObjects[i];
        obj.y += obj.speed;

        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);

        if (obj.y > canvas.height) {
            fallingObjects.splice(i, 1);
        }
    }

    handleCollisions();

    requestAnimationFrame(gameLoop);
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (!isGameOver) {
            timeLeft--;
            updateUI();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame("MASA TAMAT!");
            }
        }
    }, 1000);
}

// Kemaskini Paparan UI Header
function updateUI() {
    scoreEl.innerText = score;
    timerEl.innerText = timeLeft;
    livesHeartsEl.innerHTML = "❤️".repeat(Math.max(0, lives));
}

// ==========================================
// POP-UP MENU & INTEGRASI GOOGLE SHEETS (GAS)
// ==========================================
function endGame(titleMsg) {
    isGameOver = true;

    document.getElementById('modal-title').innerText = titleMsg;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

function submitData() {
    const nameInput = document.getElementById('player-name').value.trim();

    if (nameInput === "") {
        alert("Sila masukkan nama anda!");
        return;
    }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerText = "MENGHANTAR...";

    sendDataToGAS(nameInput, score);
}

function sendDataToGAS(playerName, finalScore) {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyTChFzD_r0tEg7O7gciOZofplG2CDeAak-sWb79ZZyRGUWDuLDA88b5TFe-ohEAigZ/exec';

    // PAYLOAD DIKEMASKINI: Menghantar baki_nyawa (lives)
    const payload = {
        nama_pelajar: playerName,
        skor_akhir: finalScore,
        baki_masa: timeLeft,
        baki_nyawa: lives 
    };

    console.log('Menghantar Data:', payload);

    fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        alert("Skor dan baki nyawa anda berjaya disimpan!");
        location.reload();
    }).catch(err => {
        console.error('Ralat:', err);
        alert("Gagal menghantar skor. Sila cuba lagi.");
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('submit-btn').innerText = "HANTAR SKOR";
    });
}

// Pelancaran Permainan
window.onload = () => {
    gameLoop();
    setInterval(spawnObject, 1200);
    startTimer();
};
