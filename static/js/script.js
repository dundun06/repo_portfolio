// DOM Elements
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const reveals = document.querySelectorAll('.reveal');

// --- Navigation & UI ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Scroll Reveal
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
});

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Trigger reveal on load
window.dispatchEvent(new Event('scroll'));

/* =========================================================
   SNOWFLAKE SPRITES
   Real six-armed crystals, pre-rendered once to offscreen
   canvases and then stamped (rotated/scaled) every frame.
   ========================================================= */
const SPRITE_SIZE = 128;
const FLAKE_STYLES = {
    normal: { stroke: '#ffffff', outline: 'rgba(52, 104, 168, 0.6)', glow: 'rgba(255, 255, 255, 0.95)' },
    ice:    { stroke: '#d2f0ff', outline: 'rgba(24, 92, 180, 0.9)',  glow: 'rgba(110, 195, 255, 1)' },
    gold:   { stroke: '#ffe58a', outline: 'rgba(168, 108, 0, 0.95)', glow: 'rgba(255, 196, 40, 1)' },
};
// [position along arm, branch length, branch angle]
const VARIANTS = [
    { branches: [[0.38, 0.34, Math.PI / 4], [0.66, 0.24, Math.PI / 4]], hex: false, tip: true },
    { branches: [[0.3, 0.22, Math.PI / 3], [0.55, 0.32, Math.PI / 3], [0.8, 0.16, Math.PI / 3]], hex: true, tip: false },
    { branches: [[0.5, 0.42, Math.PI / 5]], hex: true, tip: true },
    { branches: [[0.28, 0.18, Math.PI / 2.6], [0.52, 0.3, Math.PI / 4], [0.76, 0.2, Math.PI / 4]], hex: false, tip: false },
];
const spriteCache = {};

function traceCrystal(c, r, v) {
    c.beginPath();
    for (let a = 0; a < 6; a++) {
        c.save();
        c.rotate(a * Math.PI / 3);
        c.moveTo(0, 0);
        c.lineTo(0, -r);
        for (const [pos, len, ang] of v.branches) {
            const y = -r * pos;
            const l = r * len;
            const dx = Math.sin(ang) * l;
            const dy = Math.cos(ang) * l;
            c.moveTo(0, y); c.lineTo(dx, y - dy);
            c.moveTo(0, y); c.lineTo(-dx, y - dy);
        }
        if (v.tip) {
            c.moveTo(r * 0.07, -r);
            c.arc(0, -r, r * 0.07, 0, Math.PI * 2);
        }
        c.restore();
    }
    if (v.hex) {
        const hr = r * 0.2;
        for (let a = 0; a <= 6; a++) {
            const ang = a * Math.PI / 3 - Math.PI / 2;
            const x = Math.cos(ang) * hr;
            const y = Math.sin(ang) * hr;
            if (a === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
    }
}

function drawInkDrop(c, r) {
    const path = () => {
        c.beginPath();
        c.moveTo(0, -r * 0.95);
        c.quadraticCurveTo(r * 0.62, -r * 0.2, r * 0.6, r * 0.25);
        c.arc(0, r * 0.25, r * 0.6, 0, Math.PI);
        c.quadraticCurveTo(-r * 0.62, -r * 0.2, 0, -r * 0.95);
        c.closePath();
    };
    // danger glow
    c.shadowColor = 'rgba(255, 70, 100, 0.9)';
    c.shadowBlur = r * 0.45;
    path();
    const g = c.createRadialGradient(-r * 0.2, 0, r * 0.1, 0, r * 0.2, r);
    g.addColorStop(0, '#3d4a6b');
    g.addColorStop(1, '#0d1220');
    c.fillStyle = g;
    c.fill();
    c.shadowBlur = 0;
    c.lineWidth = r * 0.08;
    c.strokeStyle = 'rgba(255, 107, 129, 0.95)';
    c.stroke();
    // glossy highlight
    c.beginPath();
    c.ellipse(-r * 0.2, r * 0.12, r * 0.12, r * 0.22, -0.4, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255, 255, 255, 0.55)';
    c.fill();
}

function getSprite(type, variant = 0) {
    const key = type + variant;
    if (spriteCache[key]) return spriteCache[key];

    const s = document.createElement('canvas');
    s.width = s.height = SPRITE_SIZE;
    const c = s.getContext('2d');
    c.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
    const r = SPRITE_SIZE * 0.36;

    if (type === 'ink') {
        drawInkDrop(c, r);
    } else {
        const st = FLAKE_STYLES[type];
        const v = VARIANTS[variant % VARIANTS.length];
        c.lineCap = 'round';
        c.lineJoin = 'round';
        // 1. soft glow + dark outline -> visible on white AND blue backgrounds
        c.shadowColor = st.glow;
        c.shadowBlur = r * 0.35;
        c.strokeStyle = st.outline;
        c.lineWidth = r * 0.2;
        traceCrystal(c, r, v);
        c.stroke();
        // 2. bright crystal body
        c.shadowBlur = 0;
        c.strokeStyle = st.stroke;
        c.lineWidth = r * 0.1;
        traceCrystal(c, r, v);
        c.stroke();
        // 3. sparkling core
        c.fillStyle = st.stroke;
        c.beginPath();
        c.arc(0, 0, r * 0.1, 0, Math.PI * 2);
        c.fill();
    }
    spriteCache[key] = s;
    return s;
}

// Paint sprites into any <canvas data-flake="..."> (legend, results)
function paintFlakeIcons() {
    document.querySelectorAll('canvas[data-flake]').forEach((cv, i) => {
        const c = cv.getContext('2d');
        c.clearRect(0, 0, cv.width, cv.height);
        const type = cv.dataset.flake;
        const variant = type === 'normal' ? 1 : type === 'ice' ? 0 : type === 'gold' ? 2 : 0;
        c.drawImage(getSprite(type, variant), 0, 0, cv.width, cv.height);
    });
}

/* =========================================================
   CANVAS + AMBIENT SNOW
   ========================================================= */
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let width = 0, height = 0, dpr = 1;
let ambient = [];
const pointer = { x: -9999, y: -9999 };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth < 768;

function createAmbientFlake(initial = false) {
    const depth = Math.random(); // 0 = far away, 1 = close to viewer
    return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -40,
        size: 12 + depth * 22,
        speed: 0.35 + depth * 1.0 + Math.random() * 0.3,
        drift: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.008 + Math.random() * 0.014,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        alpha: 0.5 + depth * 0.5,
        type: Math.random() < 0.15 ? 'ice' : 'normal',
        variant: Math.floor(Math.random() * VARIANTS.length),
        vx: 0,
        vy: 0,
    };
}

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    let count = isMobile() ? 35 : 80;
    if (reduceMotion) count = Math.round(count / 3);
    while (ambient.length < count) ambient.push(createAmbientFlake(true));
    if (ambient.length > count) ambient.length = count;

    catcherW = isMobile() ? 86 : 104;
    catcherEl.style.setProperty('--catcher-w', `${catcherW}px`);
    catcherX = Math.min(Math.max(catcherX, catcherW / 2), width - catcherW / 2);
}

function stamp(sprite, x, y, size, rot, alpha) {
    const cos = Math.cos(rot) * dpr;
    const sin = Math.sin(rot) * dpr;
    ctx.globalAlpha = alpha;
    ctx.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
}

let windTime = 0;
function updateAmbient(f, fade) {
    windTime += 0.004 * f;
    const wind = Math.sin(windTime) * 0.5 + Math.sin(windTime * 0.37) * 0.3;

    for (let i = 0; i < ambient.length; i++) {
        const fl = ambient[i];

        // gentle push away from the cursor
        const dx = fl.x - pointer.x;
        const dy = fl.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400 && d2 > 1) {
            const d = Math.sqrt(d2);
            const force = (1 - d / 120) * 0.5;
            fl.vx += (dx / d) * force;
            fl.vy += (dy / d) * force * 0.5;
        }
        fl.vx *= 0.94;
        fl.vy *= 0.94;

        fl.phase += fl.phaseSpeed * f;
        fl.y += (fl.speed + fl.vy) * f;
        fl.x += (Math.sin(fl.phase) * fl.drift + wind * (0.4 + fl.size / 40) + fl.vx) * f;
        fl.rot += fl.spin * f;

        if (fl.y > height + 40) ambient[i] = createAmbientFlake(false);
        if (fl.x > width + 40) fl.x = -40;
        if (fl.x < -40) fl.x = width + 40;

        stamp(getSprite(fl.type, fl.variant), fl.x, fl.y, fl.size, fl.rot, fl.alpha * fade);
    }
}

/* =========================================================
   GAME: CATCH THE SNOW
   ========================================================= */
const GAME_DURATION = 30;
const POINTS = { normal: 1, ice: 3, gold: 5, ink: -5 };
const COMBO_TIMEOUT = 2200;
const BEST_KEY = 'snowCatchBest';

const $ = id => document.getElementById(id);
const hud = $('game-hud');
const scoreEl = $('game-score');
const timeEl = $('game-time');
const timeFill = $('time-bar-fill');
const timeItem = $('hud-time');
const comboEl = $('game-combo');
const comboItem = $('hud-combo');
const bestEl = $('game-best');
const catcherEl = $('catcher');
const catcherInner = $('catcher-inner');
const backdrop = $('game-backdrop');
const countdownEl = $('game-countdown');
const countdownNum = $('countdown-num');
const hintEl = $('game-hint');
const overlay = $('game-overlay');
const toggleGameBtn = $('toggle-game');
const ctaBtn = $('start-game-cta');
const toggleSoundBtn = $('toggle-sound');
const toggleMusicBtn = $('toggle-music');
const bgMusic = $('bg-music');

let catcherW = 104;
let catcherX = window.innerWidth / 2;
let targetX = catcherX;
const keys = { left: false, right: false };

const game = {
    state: 'idle', // idle | countdown | playing | over
    runId: 0,
    score: 0,
    timeLeft: GAME_DURATION,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    lastCatch: 0,
    spawnTimer: 0,
    lastSecond: GAME_DURATION,
    flakes: [],
    particles: [],
    stats: { normal: 0, ice: 0, gold: 0, ink: 0 },
};

let best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
function renderBest() {
    bestEl.textContent = best;
    $('invite-best').textContent = best;
}

/* ---------- Sound (Web Audio, no files needed) ---------- */
let isMuted = false;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioCtx ? new AudioCtx() : null;

function tone(freq, endFreq, dur, type = 'sine', gain = 0.1, delay = 0) {
    if (isMuted || !audioCtx) return;
    const t = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
}

function playSound(name) {
    switch (name) {
        case 'normal': tone(880, 1320, 0.1, 'sine', 0.09); break;
        case 'ice': tone(1046, 1568, 0.14, 'triangle', 0.1); break;
        case 'gold':
            tone(1046, 1100, 0.1, 'triangle', 0.1);
            tone(1318, 1400, 0.1, 'triangle', 0.1, 0.07);
            tone(1568, 2093, 0.18, 'triangle', 0.1, 0.14);
            break;
        case 'ink': tone(260, 90, 0.3, 'sawtooth', 0.07); break;
        case 'combo':
            tone(784, 1046, 0.12, 'square', 0.04);
            tone(1046, 1568, 0.16, 'square', 0.04, 0.08);
            break;
        case 'tick': tone(660, 660, 0.08, 'sine', 0.08); break;
        case 'go': tone(990, 1480, 0.25, 'triangle', 0.12); break;
        case 'warn': tone(520, 520, 0.06, 'square', 0.03); break;
        case 'end':
            [1046, 880, 784, 1046].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.09, i * 0.12));
            break;
    }
}

/* ---------- Helpers ---------- */
function bump(el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
}

function retrigger(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove(cls), ms);
}

function popup(x, y, text, cls = '') {
    const p = document.createElement('div');
    p.className = `score-popup ${cls}`;
    p.textContent = text;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
}

const PARTICLE_COLORS = {
    normal: ['#ffffff', '#dff1ff'],
    ice: ['#bfe6ff', '#7cc4ff', '#ffffff'],
    gold: ['#ffe58a', '#ffc845', '#fff6d1'],
    ink: ['#ff6b81', '#3d4a6b', '#1b2333'],
};

function burst(x, y, type, count) {
    const colors = PARTICLE_COLORS[type];
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.5 + Math.random() * 4;
        game.particles.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2,
            life: 1,
            decay: 0.02 + Math.random() * 0.025,
            size: 1.5 + Math.random() * 3,
            color: colors[(Math.random() * colors.length) | 0],
            star: type !== 'ink' && Math.random() < 0.4,
        });
    }
}

function updateParticles(f) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.vy += 0.15 * f;
        p.vx *= 0.98;
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.life -= p.decay * f;
        if (p.life <= 0) { game.particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.star) {
            // tiny 4-point sparkle
            const s = p.size * 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - s);
            ctx.lineTo(p.x + s * 0.25, p.y - s * 0.25);
            ctx.lineTo(p.x + s, p.y);
            ctx.lineTo(p.x + s * 0.25, p.y + s * 0.25);
            ctx.lineTo(p.x, p.y + s);
            ctx.lineTo(p.x - s * 0.25, p.y + s * 0.25);
            ctx.lineTo(p.x - s, p.y);
            ctx.lineTo(p.x - s * 0.25, p.y - s * 0.25);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/* ---------- Game flakes ---------- */
function spawnGameFlake(progress) {
    const r = Math.random();
    const inkChance = 0.1 + progress * 0.08;
    let type = 'normal';
    if (r < inkChance) type = 'ink';
    else if (r < inkChance + 0.07) type = 'gold';
    else if (r < inkChance + 0.3) type = 'ice';

    const scale = isMobile() ? 0.85 : 1;
    const size = (type === 'ink' ? 40 : type === 'gold' ? 54 : 44 + Math.random() * 10) * scale;
    const margin = size;
    game.flakes.push({
        type,
        x: margin + Math.random() * (width - margin * 2),
        y: -size,
        size,
        speed: (2 + Math.random() * 1.4) * (1 + progress * 0.75) * (type === 'gold' ? 1.3 : 1),
        sway: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        rot: type === 'ink' ? 0 : Math.random() * Math.PI,
        spin: type === 'ink' ? 0 : (Math.random() - 0.5) * 0.06,
        variant: Math.floor(Math.random() * VARIANTS.length),
    });
}

function setMultiplier() {
    const prev = game.multiplier;
    game.multiplier = game.combo >= 15 ? 3 : game.combo >= 6 ? 2 : 1;
    comboEl.textContent = `x${game.multiplier}`;
    comboItem.classList.toggle('hot', game.multiplier >= 2);
    comboItem.classList.toggle('blazing', game.multiplier >= 3);
    if (game.multiplier > prev) {
        bump(comboEl);
        popup(width / 2, height * 0.32, `Combo x${game.multiplier}!`, 'combo');
        playSound('combo');
    }
}

function handleCatch(fl, now) {
    const type = fl.type;
    game.stats[type]++;
    const popY = height - 28 - 80;

    if (type === 'ink') {
        game.score = Math.max(0, game.score + POINTS.ink);
        game.combo = 0;
        setMultiplier();
        popup(catcherX, popY, `${POINTS.ink}`, 'ink');
        burst(fl.x, fl.y, 'ink', 22);
        playSound('ink');
        retrigger(catcherInner, 'shake', 350);
        retrigger(hud, 'shake', 350);
        retrigger(backdrop, 'hit', 400);
        if (navigator.vibrate) navigator.vibrate(80);
    } else {
        game.combo++;
        game.maxCombo = Math.max(game.maxCombo, game.combo);
        game.lastCatch = now;
        setMultiplier();
        const pts = POINTS[type] * game.multiplier;
        game.score += pts;
        popup(fl.x, popY, `+${pts}`, type);
        burst(fl.x, fl.y, type, type === 'gold' ? 28 : 14);
        playSound(type);
        retrigger(catcherInner, 'catch', 300);
    }
    scoreEl.textContent = game.score;
    bump(scoreEl);
}

function updateGame(f, dt, now) {
    const progress = 1 - game.timeLeft / GAME_DURATION;

    // timer
    game.timeLeft = Math.max(0, game.timeLeft - dt / 1000);
    const sec = Math.ceil(game.timeLeft);
    if (sec !== game.lastSecond) {
        game.lastSecond = sec;
        timeEl.textContent = sec;
        if (sec <= 5 && sec > 0) {
            timeItem.classList.add('warning');
            playSound('warn');
        }
    }
    timeFill.style.transform = `scaleX(${game.timeLeft / GAME_DURATION})`;

    // combo expiry
    if (game.combo > 0 && now - game.lastCatch > COMBO_TIMEOUT) {
        game.combo = 0;
        setMultiplier();
    }

    // spawning (gets denser over time)
    game.spawnTimer -= dt;
    if (game.spawnTimer <= 0) {
        spawnGameFlake(progress);
        game.spawnTimer = 440 - progress * 220 + Math.random() * 120;
    }

    // catch zone
    const catchTop = height - 28 - 72 + 10;
    const catchBottom = catchTop + 36;
    const half = catcherW / 2;

    for (let i = game.flakes.length - 1; i >= 0; i--) {
        const fl = game.flakes[i];
        fl.phase += 0.04 * f;
        fl.y += fl.speed * f;
        fl.x += Math.sin(fl.phase) * fl.sway * f;
        fl.rot += fl.spin * f;

        const reach = fl.size * 0.3;
        if (fl.y + reach >= catchTop && fl.y - reach <= catchBottom &&
            Math.abs(fl.x - catcherX) < half + reach * 0.5) {
            handleCatch(fl, now);
            game.flakes.splice(i, 1);
            continue;
        }
        if (fl.y > height + fl.size) {
            game.flakes.splice(i, 1);
        }
    }

    if (game.timeLeft <= 0) endGame();
}

function drawGameFlakes() {
    for (const fl of game.flakes) {
        const sprite = getSprite(fl.type, fl.type === 'gold' ? 2 : fl.variant);
        // golden flakes pulse slightly so they stand out
        const size = fl.type === 'gold' ? fl.size * (1 + Math.sin(fl.phase * 3) * 0.08) : fl.size;
        const rot = fl.type === 'ink' ? Math.sin(fl.phase) * 0.15 : fl.rot;
        stamp(sprite, fl.x, fl.y, size, rot, 1);
    }
}

function updateCatcher(f) {
    if (keys.left) targetX -= 11 * f;
    if (keys.right) targetX += 11 * f;
    targetX = Math.min(Math.max(targetX, catcherW / 2), width - catcherW / 2);

    const prev = catcherX;
    catcherX += (targetX - catcherX) * Math.min(1, 0.28 * f);
    const tilt = Math.max(-14, Math.min(14, (catcherX - prev) * 0.9));
    catcherEl.style.transform = `translate3d(${catcherX - catcherW / 2}px, 0, 0)`;
    catcherInner.style.transform = `rotate(${tilt}deg)`;
}

/* ---------- Game flow ---------- */
function resetGameState() {
    game.score = 0;
    game.timeLeft = GAME_DURATION;
    game.lastSecond = GAME_DURATION;
    game.combo = 0;
    game.maxCombo = 0;
    game.multiplier = 1;
    game.spawnTimer = 0;
    game.flakes = [];
    game.particles = [];
    game.stats = { normal: 0, ice: 0, gold: 0, ink: 0 };

    scoreEl.textContent = '0';
    timeEl.textContent = GAME_DURATION;
    timeFill.style.transform = 'scaleX(1)';
    timeItem.classList.remove('warning');
    comboEl.textContent = 'x1';
    comboItem.classList.remove('hot', 'blazing');
    renderBest();
}

function startGame() {
    if (game.state === 'countdown' || game.state === 'playing') return;
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    overlay.classList.remove('active');
    resetGameState();
    targetX = catcherX = width / 2;
    document.body.classList.add('game-active');
    navLinks.classList.remove('active');

    game.state = 'countdown';
    const runId = ++game.runId;
    const seq = ['3', '2', '1', 'Go!'];
    let i = 0;
    countdownEl.classList.add('active');
    hintEl.classList.add('show');

    const step = () => {
        if (game.runId !== runId || game.state !== 'countdown') return;
        if (i >= seq.length) {
            countdownEl.classList.remove('active');
            game.state = 'playing';
            game.lastCatch = performance.now();
            setTimeout(() => { if (game.runId === runId) hintEl.classList.remove('show'); }, 2500);
            return;
        }
        countdownNum.textContent = seq[i];
        countdownNum.classList.remove('pop');
        void countdownNum.offsetWidth;
        countdownNum.classList.add('pop');
        playSound(i < 3 ? 'tick' : 'go');
        i++;
        setTimeout(step, i === seq.length ? 550 : 750);
    };
    step();
}

function getRank(score) {
    if (score < 15) return ['First Snowfall', 'A quiet winter moment. One more try?'];
    if (score < 35) return ['Winter Wanderer', 'Nice! The snow is starting to trust you.'];
    if (score < 60) return ['Frost Poet', 'Graceful catches — like verses falling into place.'];
    if (score < 90) return ['Blizzard Scholar', 'Impressive focus. That combo was poetry!'];
    return ['Snow Laureate ✨', 'Legendary! Every flake knows your name.'];
}

function endGame() {
    game.state = 'over';
    game.runId++;
    playSound('end');
    timeItem.classList.remove('warning');

    // let the remaining flakes burst away
    game.flakes.forEach(fl => burst(fl.x, fl.y, fl.type === 'ink' ? 'normal' : fl.type, 6));
    game.flakes = [];

    const isNewBest = game.score > best;
    if (isNewBest) {
        best = game.score;
        localStorage.setItem(BEST_KEY, best);
    }
    renderBest();

    const [rank, msg] = getRank(game.score);
    $('result-score').textContent = game.score;
    $('result-rank').textContent = rank;
    $('result-msg').textContent = msg;
    $('result-best').textContent = best;
    $('new-best').classList.toggle('show', isNewBest && game.score > 0);
    $('stat-normal').textContent = game.stats.normal;
    $('stat-ice').textContent = game.stats.ice;
    $('stat-gold').textContent = game.stats.gold;
    $('stat-ink').textContent = game.stats.ink;
    $('stat-combo').textContent = game.maxCombo;

    setTimeout(() => {
        overlay.classList.add('active');
        $('restart-game').focus();
    }, 600);
}

function exitGame() {
    game.state = 'idle';
    game.runId++;
    game.flakes = [];
    countdownEl.classList.remove('active');
    hintEl.classList.remove('show');
    overlay.classList.remove('active');
    document.body.classList.remove('game-active');
}

/* ---------- Main loop ---------- */
let last = performance.now();
let gameFade = 1;
function loop(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    const f = dt / 16.667;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ambient snow dims while playing so game flakes stand out
    const active = game.state === 'countdown' || game.state === 'playing';
    gameFade += ((active ? 0.35 : 1) - gameFade) * 0.08 * f;
    updateAmbient(f, gameFade);

    if (game.state === 'playing') updateGame(f, dt, now);
    if (game.state !== 'idle') {
        drawGameFlakes();
        updateCatcher(f);
    }
    updateParticles(f);

    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
}

/* ---------- Input ---------- */
window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (game.state !== 'idle') targetX = e.clientX;
});

document.addEventListener('mouseleave', () => {
    pointer.x = pointer.y = -9999;
});

function onTouch(e) {
    if (game.state === 'idle') return;
    if (e.target.closest('button')) return;
    targetX = e.touches[0].clientX;
    if (e.cancelable) e.preventDefault();
}
window.addEventListener('touchstart', onTouch, { passive: false });
window.addEventListener('touchmove', onTouch, { passive: false });

window.addEventListener('keydown', (e) => {
    if (game.state === 'idle') return;
    if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); }
    if (e.key === 'Escape') exitGame();
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

/* ---------- Buttons ---------- */
toggleGameBtn.addEventListener('click', startGame);
ctaBtn.addEventListener('click', startGame);
$('quit-game').addEventListener('click', exitGame);
$('restart-game').addEventListener('click', startGame);
$('close-game').addEventListener('click', exitGame);

toggleSoundBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    toggleSoundBtn.textContent = isMuted ? '🔇' : '🔊';
});

let isMusicPlaying = false;
toggleMusicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        toggleMusicBtn.style.opacity = '0.5';
    } else {
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
        toggleMusicBtn.style.opacity = '1';
    }
    isMusicPlaying = !isMusicPlaying;
});
toggleMusicBtn.style.opacity = '0.5';

/* ---------- Init ---------- */
window.addEventListener('resize', resize);
resize();
renderBest();
paintFlakeIcons();
requestAnimationFrame(loop);
