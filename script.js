// script.js

// =========================================
// PHẦN 1: BIẾN TOÀN CỤC & DỮ LIỆU
// =========================================

// Game State
let currentFaction = '';
let tempX = 0;
let tempY = 0;
let hasBuiltStronghold = false;
let pendingAttackPos = { x: 0, y: 0 };
let playerColorClass = '';
let enemyColorClass = '';

// Resources
let RESOURCES = { food: 0, gold: 500, army: 0 };
let myUnits = [{ type: 'PEASANT' }];

// Research
let RESEARCH_LEVELS = { MILITARY: 0, WEAPON: 0, FARMING: 0 };
const RESEARCH_DATA = {
    MILITARY: { baseCost: 500, bonus: 0.2 },
    WEAPON: { baseCost: 500, bonus: 0.1 },
    FARMING: { baseCost: 500, bonus: 0.5 }
};

// Training Camp Data
const UNIT_METADATA = {
    'INFANTRY': { name: "Bộ Binh", cost: 150, icon: "hinh/bobinh.png", desc: "Lực lượng chiến đấu cơ bản.", stats: { atk: 10, def: 5, spd: 4 } },
    'ARCHER': { name: "Cung Thủ", cost: 300, icon: "https://cdn-icons-png.flaticon.com/512/2821/2821012.png", desc: "Tấn công từ xa. (Chưa mở)", stats: { atk: 15, def: 2, spd: 3 } },
    'CAVALRY': { name: "Kỵ Binh", cost: 500, icon: "hinh/kybinh.png", desc: "Cơ động cao, càn lướt tốt.", stats: { atk: 20, def: 10, spd: 8 } }
};

const UNIT_UNLOCK_STATUS = {
    'INFANTRY': true,
    'ARCHER': false,
    'CAVALRY': false
};

// Map
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 2000;
let target = { x: 0, y: 0, scale: 1 };
let current = { x: 0, y: 0, scale: 1 };
const mapContainer = document.getElementById('map-container');

// Combat
let isSkillReady = true;
let skillCooldownTimer = null;
let weaponDurability = 100;
let maxWeaponDurability = 100;
let inCombat = false;
let currentStance = 'TOP';
let enemyStance = 'TOP';
let enemyAction = 'IDLE';
let playerHP = 1000;
let enemyHP = 2000;
let combatTimer;

// Tactical Map
let tacX = 0;
let tacY = 0;
let tacScale = 0.5;
let pendingTacticalTarget = { x: 0, y: 0 };

// Drag State
let isDown = false;
let isDragging = false;
let startDragX, startDragY;

// Artifacts
let ARTIFACTS = {
    cocgo: { frags: 0, req: 5, unlocked: false },
    hich: { frags: 0, req: 3, unlocked: false }
};

// Hero Data
const HERO_DATA = {
    'VIETNAM': { name: "HƯNG ĐẠO VƯƠNG", img: "hinh/thd.png", desc: "Tăng 50% tốc độ di chuyển toàn quân trong 10s." },
    'INVADER': { name: "Ô MÃ NHI", img: "hinh/omn.png", desc: "Kỵ binh bất tử trong 5s." }
};

// Enemies
const ENEMIES = [
    { id: 1, name: "Thổ Phỉ", x: 20, y: 30, hp: 500, maxHp: 500, icon: "👺" },
    { id: 2, name: "Trại Nguyên Mông", x: 80, y: 20, hp: 2000, maxHp: 2000, icon: "⛺" },
    { id: 3, name: "Toán Cướp", x: 50, y: 70, hp: 800, maxHp: 800, icon: "☠️" }
];

// AI Battle System - Enemy Fortress & General
let enemyFortress = null;
let enemyGeneral = null;

const FORTRESS_CONFIG = {
    maxHP: 1200, // Reduced for testing (was 3000)
    regenRange: 15, // % map distance for general regen
    icon: '🏰'
};

const GENERAL_CONFIG = {
    maxHP: 1500,
    damage: 15,
    attackCooldown: 60, // frames between attacks
    regenRate: 5, // HP per tick when near fortress
    detectionRange: 25, // % map distance to detect player units
    speed: 0.06
};

// Collection Data
const COLLECTION_DATA = [
    { id: 1, faction: 'vietnam', name: "Trần Hưng Đạo", img: "hinh/thd.png", str: 95, int: 98, lead: 100, skill: "Hịch Tướng Sĩ", desc: "Tăng sĩ khí và tốc độ toàn quân." },
    { id: 2, faction: 'vietnam', name: "Yết Kiêu", img: "hinh/thd.png", str: 85, int: 70, lead: 80, skill: "Thủy Quái", desc: "Giỏi thủy chiến, đục thuyền địch." },
    { id: 3, faction: 'invader', name: "Ô Mã Nhi", img: "hinh/omn.png", str: 92, int: 80, lead: 85, skill: "Vạn Kỵ", desc: "Kỵ binh cực mạnh trên bộ." },
    { id: 4, faction: 'invader', name: "Toa Đô", img: "hinh/omn.png", str: 90, int: 75, lead: 80, skill: "Cuồng Nộ", desc: "Tăng sức tấn công khi máu thấp." }
];

// Quiz Data
const QUIZ_DATA = {
    'han': [
        { q: "Ngô Quyền đánh bại quân Nam Hán trên sông nào?", a: ["Sông Bạch Đằng", "Sông Như Nguyệt", "Sông Hồng", "Sông Gianh"], c: 0 },
        { q: "Chiến thắng Bạch Đằng năm 938 chấm dứt thời kỳ nào?", a: ["1000 năm Bắc thuộc", "Thời kỳ Loạn 12 Sứ Quân", "Nhà Tiền Lê", "Nhà Lý"], c: 0 }
    ],
    'song': [
        { q: "Ai là người đọc bài thơ 'Nam Quốc Sơn Hà'?", a: ["Lý Thường Kiệt", "Lý Công Uẩn", "Trần Hưng Đạo", "Quang Trung"], c: 0 },
        { q: "Trận chiến trên sông Như Nguyệt diễn ra vào thời vua nào?", a: ["Lý Nhân Tông", "Lý Thái Tổ", "Lý Thánh Tông", "Trần Nhân Tông"], c: 0 }
    ],
    'mongol': [
        { q: "Hội nghị Diên Hồng do vua nào tổ chức?", a: ["Trần Thánh Tông", "Trần Nhân Tông", "Trần Thái Tông", "Trần Hưng Đạo"], c: 0 },
        { q: "Câu nói 'Bệ hạ chém đầu thần rồi hãy hàng' là của ai?", a: ["Trần Hưng Đạo", "Trần Bình Trọng", "Trần Quốc Toản", "Yết Kiêu"], c: 0 }
    ]
};

let currentQuiz = [];
let currentQIndex = 0;
let quizScore = 0;

// Profile Data
var USER_PROFILE = {
    name: "HuynhDucNgu",
    xp: 1500,
    stats: { damage: 90, defense: 60, support: 40, control: 75, utility: 50 },
    winrate: 65.5,
    kda: "4.2",
    matches: 215,
    honor: 99
};

const RANK_SYSTEM = [
    { name: "Lính Trơn", maxXP: 100, frame: "frame-wood" },
    { name: "Lính Tinh Nhuệ", maxXP: 300, frame: "frame-wood" },
    { name: "Ngũ Trưởng", maxXP: 600, frame: "frame-bronze" },
    { name: "Bách Phu Trưởng", maxXP: 1000, frame: "frame-bronze" },
    { name: "Hiệu Úy", maxXP: 2000, frame: "frame-silver" },
    { name: "Tướng Quân", maxXP: 4000, frame: "frame-silver" },
    { name: "Đô Đốc", maxXP: 8000, frame: "frame-gold" },
    { name: "Thừa Tướng", maxXP: 15000, frame: "frame-gold" },
    { name: "THẦN TƯỚNG", maxXP: 999999, frame: "frame-legendary" }
];

// Upgrade Data
var currentLevel = 1;
const soldierImages = [
    "https://cdn-icons-png.flaticon.com/512/3063/3063823.png",
    "https://cdn-icons-png.flaticon.com/512/1995/1995642.png",
    "https://cdn-icons-png.flaticon.com/512/924/924953.png",
    "https://cdn-icons-png.flaticon.com/512/2320/2320286.png",
    "https://cdn-icons-png.flaticon.com/512/3408/3408455.png"
];

const upgradeData = [
    null,
    { name: "Quân Chính Quy", req: "🟡 1k | 🥩 500", buff: "Stats +10%", atk: 55, def: 22 },
    { name: "Quân Tinh Nhuệ", req: "🟡 5k | 🔩 1k", buff: "Giáp sắt", atk: 70, def: 35 },
    { name: "Quân Hoàng Gia", req: "🟡 15k | 📜 Sắc lệnh", buff: "Giáp Vàng", atk: 90, def: 50 },
    { name: "Thần Binh", req: "❤️ Tim Rồng", buff: "Bất Tử", atk: 150, def: 100 }
];

let holdTimer = null;

// =========================================
// PHẦN 2: UTILITY FUNCTIONS
// =========================================

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN';
        window.speechSynthesis.speak(u);
    }
}

function playSfx(type) {
    if (type === 'sword') {
        const audio = document.getElementById('sfx-sword');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }
    }
}

function toggleSettings() {
    document.getElementById('hkda-settings').classList.toggle('active');
}

// =========================================
// PHẦN 3: MENU & CORE LOGIC
// =========================================

(function initMenu() {
    const wrapper = document.getElementById('hkda-scene-wrapper');
    const cursor = document.getElementById('hkda-cursor');
    const particleContainer = document.getElementById('hkda-particles');

    document.addEventListener('mousemove', (e) => {
        if (wrapper.style.display !== 'none') {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });

    wrapper.addEventListener('mousedown', () => {
        cursor.style.transform = "scale(0.8) rotate(45deg)";
        cursor.style.background = "#fff";
    });

    wrapper.addEventListener('mouseup', () => {
        cursor.style.transform = "scale(1) rotate(45deg)";
        cursor.style.background = "rgba(255, 69, 0, 0.8)";
    });

    function createEmber() {
        if (wrapper.style.display === 'none') return;
        const ember = document.createElement('div');
        ember.classList.add('hkda-ember');
        const startX = Math.random() * window.innerWidth;
        const drift = (Math.random() - 0.5) * 200 + 'px';
        ember.style.left = startX + 'px';
        ember.style.setProperty('--drift', drift);
        ember.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particleContainer.appendChild(ember);
        setTimeout(() => ember.remove(), 6000);
    }

    setInterval(createEmber, 150);
})();

function startGame() {
    playSfx('sword');
    const menuWrapper = document.getElementById('hkda-scene-wrapper');
    menuWrapper.style.opacity = '0';
    document.getElementById('hkda-cursor').style.display = 'none';
    setTimeout(() => {
        menuWrapper.style.display = 'none';
        document.getElementById('screen-selection').classList.remove('hidden');
        speak("Mời chọn tướng");
    }, 1000);
}

// =========================================
// PHẦN 4: HERO SELECTION
// =========================================

function selectHero(faction) {
    currentFaction = faction;
    document.getElementById('screen-selection').classList.add('hidden');
    showHeroInfo(faction);
}

function showHeroInfo(faction) {
    document.getElementById('bio-name').innerText = HERO_DATA[faction].name;
    document.getElementById('bio-story').innerText = HERO_DATA[faction].desc;
    document.getElementById('bio-img').src = HERO_DATA[faction].img;
    document.getElementById('screen-bio').classList.remove('hidden');
    speak(HERO_DATA[faction].name);
}

function backToSelection() {
    document.getElementById('screen-bio').classList.add('hidden');
    document.getElementById('screen-selection').classList.remove('hidden');
}

function confirmHeroSelection() {
    document.getElementById('screen-bio').classList.add('hidden');
    document.getElementById('screen-map').classList.remove('hidden');

    target.scale = window.innerWidth / 3000;
    if (target.scale > 1) target.scale = 1;
    current.scale = target.scale;

    if (currentFaction === 'VIETNAM') {
        document.getElementById('map-overlay').className = 'overlay-vn';
        speak("Đại Việt. Hãy chọn vị trí màu đỏ.");
        playerColorClass = 'faction-green';
        enemyColorClass = 'enemy-node-red';
    } else {
        document.getElementById('map-overlay').className = 'overlay-invader';
        speak("Nguyên Mông. Hãy chọn vị trí màu vàng.");
        playerColorClass = 'faction-red';
        enemyColorClass = 'enemy-node-green';
    }
    updateUI();
}

// =========================================
// PHẦN 5: MAP LOGIC
// =========================================

function gameLoop() {
    current.x += (target.x - current.x) * 0.1;
    current.y += (target.y - current.y) * 0.1;
    current.scale += (target.scale - current.scale) * 0.1;
    mapContainer.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
    runUnitAI();

    // AI Battle System updates
    updateEnemyFortress();
    updateEnemyGeneral();
    checkWinLossConditions();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

function getMinScale() {
    return Math.max(window.innerWidth / MAP_WIDTH, window.innerHeight / MAP_HEIGHT);
}

function updateMinScale() {
    if (target.scale < getMinScale()) target.scale = getMinScale();
}

function clampMap() {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const mw = MAP_WIDTH * target.scale;
    const mh = MAP_HEIGHT * target.scale;

    if (target.x > 0) target.x = 0;
    if (target.y > 0) target.y = 0;
    if (mw > sw) {
        if (target.x < sw - mw) target.x = sw - mw;
    } else {
        target.x = (sw - mw) / 2;
    }
    if (mh > sh) {
        if (target.y < sh - mh) target.y = sh - mh;
    } else {
        target.y = (sh - mh) / 2;
    }
    if (target.scale < getMinScale()) target.scale = getMinScale();
}

// Map Event Listeners
mapContainer.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.classList.contains('enemy-on-map')) return;
    e.preventDefault();
    isDown = true;
    isDragging = false;
    startDragX = e.clientX;
    startDragY = e.clientY;
    mapContainer.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', e => {
    if (isDown) {
        let dx = e.clientX - startDragX;
        let dy = e.clientY - startDragY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
            target.x += dx;
            target.y += dy;
            startDragX = e.clientX;
            startDragY = e.clientY;
            clampMap();
        }
    }
});

window.addEventListener('mouseup', () => {
    isDown = false;
    mapContainer.style.cursor = 'grab';
    setTimeout(() => isDragging = false, 50);
});

window.addEventListener('wheel', e => {
    if (!document.getElementById('screen-tactical-map').classList.contains('hidden')) return;
    if (!document.getElementById('screen-map').classList.contains('hidden')) {
        e.preventDefault();
        const delta = -e.deltaY * 0.002;
        const minScale = getMinScale();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const worldMouseX = (mouseX - target.x) / target.scale;
        const worldMouseY = (mouseY - target.y) / target.scale;
        const newScale = Math.min(Math.max(target.scale + delta, minScale), 4);
        target.x = mouseX - (worldMouseX * newScale);
        target.y = mouseY - (worldMouseY * newScale);
        target.scale = newScale;
        clampMap();
    }
}, { passive: false });

window.addEventListener('resize', () => {
    updateMinScale();
    clampMap();
});

mapContainer.addEventListener('mouseup', e => {
    if (isDragging || hasBuiltStronghold || !document.getElementById('modal-confirm').classList.contains('hidden')) return;
    if (e.target.classList.contains('enemy-on-map')) return;

    let rect = mapContainer.getBoundingClientRect();
    let relativeX = e.clientX - rect.left;
    let relativeY = e.clientY - rect.top;
    tempX = (relativeX / rect.width) * 100;
    tempY = (relativeY / rect.height) * 100;

    if (tempX < 0 || tempX > 100 || tempY < 0 || tempY > 100) return;
    document.getElementById('modal-confirm').classList.remove('hidden');
    speak("Xây ở đây?");
});

mapContainer.addEventListener('dblclick', (e) => {
    if (!hasBuiltStronghold) return;
    e.preventDefault();

    let rect = mapContainer.getBoundingClientRect();
    let relativeX = e.clientX - rect.left;
    let relativeY = e.clientY - rect.top;
    let targetX = (relativeX / rect.width) * 100;
    let targetY = (relativeY / rect.height) * 100;

    let count = 0;
    myUnits.forEach(u => {
        if (u.type !== 'PEASANT') {
            u.targetX = targetX;
            u.targetY = targetY;
            u.state = 'ATTACK';
            count++;
        }
    });

    if (count > 0) {
        let marker = document.createElement('div');
        marker.innerText = '🚩';
        marker.className = 'move-marker';
        marker.style.left = targetX + '%';
        marker.style.top = targetY + '%';
        document.getElementById('stronghold-area').appendChild(marker);
        setTimeout(() => marker.remove(), 1000);
        speak("Tiến quân!");
    }
});

function closeModal() {
    document.getElementById('modal-confirm').classList.add('hidden');
}

function placeStronghold() {
    closeModal();

    let safeX = Number(tempX);
    let safeY = Number(tempY);
    if (isNaN(safeX) || isNaN(safeY)) return;

    const img = document.createElement('img');
    img.src = 'hinh/thanhtri.png';
    img.className = 'stronghold-icon';
    img.classList.add(playerColorClass);
    img.style.left = safeX + '%';
    img.style.top = safeY + '%';
    document.getElementById('stronghold-area').appendChild(img);

    const W = 3000;
    const H = 2000;
    const newScale = 1.0;
    let px = (safeX / 100) * W;
    let py = (safeY / 100) * H;
    let desX = (window.innerWidth / 2) - (px * newScale);
    let desY = (window.innerHeight / 2) - (py * newScale);

    target.x = desX;
    target.y = desY;
    target.scale = newScale;

    hasBuiltStronghold = true;
    document.getElementById('notification').classList.add('hidden');
    document.getElementById('top-intro-bar').classList.remove('hidden');
    document.getElementById('btn-enter-base').classList.remove('hidden');
    document.getElementById('btn-sabotage').classList.remove('hidden');
    document.getElementById('minimap-base').classList.remove('hidden');
    document.getElementById('skill-container').classList.remove('hidden');

    updateSkillUI();
    myUnits.forEach(u => spawnUnitVisual(u.type));
    spawnEnemiesOnMap();
    spawnEnemyFortressAndGeneral(); // AI Battle System
    speak("Đã xây xong.");
}

function spawnEnemiesOnMap() {
    ENEMIES.forEach(e => {
        let el = document.createElement('div');
        el.className = 'enemy-on-map';
        el.classList.add(enemyColorClass);
        el.innerText = e.icon;

        let rx = (Math.random() - 0.5) * 30;
        let ry = (Math.random() - 0.5) * 30;
        e.x = tempX + rx;
        e.y = tempY + ry;
        el.style.left = e.x + '%';
        el.style.top = e.y + '%';

        el.onmousedown = (evt) => {
            evt.stopPropagation();
            startCombatMode(e);
        };
        e.element = el;
        document.getElementById('stronghold-area').appendChild(el);
    });
}

// =========================================
// AI BATTLE SYSTEM - FORTRESS & GENERAL
// =========================================

function spawnEnemyFortressAndGeneral() {
    // Calculate fortress position (opposite side from player base)
    let fortressX = tempX > 50 ? tempX - 60 : tempX + 60;
    let fortressY = tempY > 50 ? tempY - 40 : tempY + 40;

    // Clamp to map bounds
    fortressX = Math.max(10, Math.min(90, fortressX));
    fortressY = Math.max(10, Math.min(90, fortressY));

    // Create Fortress
    enemyFortress = {
        x: fortressX,
        y: fortressY,
        hp: FORTRESS_CONFIG.maxHP,
        maxHP: FORTRESS_CONFIG.maxHP,
        destroyed: false
    };

    // Create fortress visual element
    const fortressContainer = document.createElement('div');
    fortressContainer.className = 'enemy-fortress';
    fortressContainer.classList.add(enemyColorClass);
    fortressContainer.style.left = fortressX + '%';
    fortressContainer.style.top = fortressY + '%';

    // Fortress icon
    const fortressIcon = document.createElement('div');
    fortressIcon.className = 'fortress-icon';
    fortressIcon.innerText = FORTRESS_CONFIG.icon;
    fortressContainer.appendChild(fortressIcon);

    // Fortress HP bar
    const fortressHPContainer = document.createElement('div');
    fortressHPContainer.className = 'fortress-hp-container';
    const fortressHPBar = document.createElement('div');
    fortressHPBar.className = 'fortress-hp-bar';
    const fortressHPFill = document.createElement('div');
    fortressHPFill.className = 'fortress-hp-fill';
    fortressHPBar.appendChild(fortressHPFill);
    fortressHPContainer.appendChild(fortressHPBar);
    fortressContainer.appendChild(fortressHPContainer);

    enemyFortress.element = fortressContainer;
    enemyFortress.hpFill = fortressHPFill;
    document.getElementById('stronghold-area').appendChild(fortressContainer);

    // Create General (spawn outside fortress)
    let generalOffsetX = (Math.random() - 0.5) * 15;
    let generalOffsetY = (Math.random() - 0.5) * 15;

    enemyGeneral = {
        x: fortressX + generalOffsetX,
        y: fortressY + generalOffsetY,
        hp: GENERAL_CONFIG.maxHP,
        maxHP: GENERAL_CONFIG.maxHP,
        damage: GENERAL_CONFIG.damage,
        attackCooldown: 0,
        state: 'IDLE', // IDLE, PATROL, ATTACKING, REGENERATING
        targetX: fortressX + generalOffsetX,
        targetY: fortressY + generalOffsetY,
        currentTarget: null,
        isRegenerating: false
    };

    // Create general visual element
    const generalContainer = document.createElement('div');
    generalContainer.className = 'enemy-general';
    generalContainer.classList.add(enemyColorClass);

    // General sprite
    const generalSprite = document.createElement('img');
    generalSprite.className = 'general-sprite';
    generalSprite.src = 'hinh/omn.png'; // Use enemy general image
    generalContainer.appendChild(generalSprite);

    // General HP bar
    const generalHPContainer = document.createElement('div');
    generalHPContainer.className = 'general-hp-container';
    const generalHPBar = document.createElement('div');
    generalHPBar.className = 'general-hp-bar';
    const generalHPFill = document.createElement('div');
    generalHPFill.className = 'general-hp-fill';
    generalHPBar.appendChild(generalHPFill);
    generalHPContainer.appendChild(generalHPBar);
    generalContainer.appendChild(generalHPContainer);

    // Regen glow effect (initially hidden)
    const regenGlow = document.createElement('div');
    regenGlow.className = 'regen-glow hidden';
    generalContainer.appendChild(regenGlow);

    enemyGeneral.element = generalContainer;
    enemyGeneral.sprite = generalSprite;
    enemyGeneral.hpFill = generalHPFill;
    enemyGeneral.regenGlow = regenGlow;

    updateEnemyGeneralVisual();
    document.getElementById('stronghold-area').appendChild(generalContainer);

    console.log('Enemy Fortress and General spawned!');
}

function updateEnemyGeneralVisual() {
    if (!enemyGeneral || !enemyGeneral.element) return;

    enemyGeneral.element.style.left = enemyGeneral.x + '%';
    enemyGeneral.element.style.top = enemyGeneral.y + '%';

    // Flip sprite based on movement direction
    if (enemyGeneral.sprite) {
        if (enemyGeneral.targetX < enemyGeneral.x) {
            enemyGeneral.sprite.style.transform = 'scaleX(1)';
        } else {
            enemyGeneral.sprite.style.transform = 'scaleX(-1)';
        }
    }

    // Update HP bar
    if (enemyGeneral.hpFill) {
        let hpPct = Math.max(0, (enemyGeneral.hp / enemyGeneral.maxHP) * 100);
        enemyGeneral.hpFill.style.width = hpPct + '%';
    }
}

function updateEnemyFortress() {
    if (!enemyFortress || enemyFortress.destroyed) return;

    // Update HP bar
    if (enemyFortress.hpFill) {
        let hpPct = Math.max(0, (enemyFortress.hp / enemyFortress.maxHP) * 100);
        enemyFortress.hpFill.style.width = hpPct + '%';
    }

    // Check if fortress is destroyed
    if (enemyFortress.hp <= 0 && !enemyFortress.destroyed) {
        enemyFortress.destroyed = true;
        if (enemyFortress.element) {
            enemyFortress.element.classList.add('fortress-destroyed');
            setTimeout(() => {
                if (enemyFortress.element) {
                    enemyFortress.element.style.opacity = '0.3';
                }
            }, 500);
        }
        speak("Thành địch sập!");
        console.log('Fortress destroyed! General can no longer regenerate.');
    }
}

function updateEnemyGeneral() {
    if (!enemyGeneral || enemyGeneral.hp <= 0) return;

    // Check distance to fortress for regeneration
    if (enemyFortress && !enemyFortress.destroyed) {
        let dx = enemyGeneral.x - enemyFortress.x;
        let dy = enemyGeneral.y - enemyFortress.y;
        let distToFortress = Math.sqrt(dx * dx + dy * dy);

        // Regenerate if near fortress
        if (distToFortress < FORTRESS_CONFIG.regenRange) {
            if (enemyGeneral.hp < enemyGeneral.maxHP) {
                enemyGeneral.hp += GENERAL_CONFIG.regenRate / 60; // Per frame
                if (enemyGeneral.hp > enemyGeneral.maxHP) {
                    enemyGeneral.hp = enemyGeneral.maxHP;
                }

                // Show regen glow
                if (enemyGeneral.regenGlow) {
                    enemyGeneral.regenGlow.classList.remove('hidden');
                }
                enemyGeneral.isRegenerating = true;
            } else {
                if (enemyGeneral.regenGlow) {
                    enemyGeneral.regenGlow.classList.add('hidden');
                }
                enemyGeneral.isRegenerating = false;
            }
        } else {
            if (enemyGeneral.regenGlow) {
                enemyGeneral.regenGlow.classList.add('hidden');
            }
            enemyGeneral.isRegenerating = false;
        }
    } else {
        // Fortress destroyed, no regen
        if (enemyGeneral.regenGlow) {
            enemyGeneral.regenGlow.classList.add('hidden');
        }
        enemyGeneral.isRegenerating = false;
    }

    // Find nearest player unit
    let nearestUnit = null;
    let nearestDist = Infinity;

    myUnits.forEach(u => {
        if (u.type === 'PEASANT' || !u.element) return;

        let dx = u.x - enemyGeneral.x;
        let dy = u.y - enemyGeneral.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearestUnit = u;
        }
    });

    // AI Behavior
    if (nearestUnit && nearestDist < GENERAL_CONFIG.detectionRange) {
        // ATTACKING state
        enemyGeneral.state = 'ATTACKING';
        enemyGeneral.currentTarget = nearestUnit;
        enemyGeneral.targetX = nearestUnit.x;
        enemyGeneral.targetY = nearestUnit.y;

        // Move toward target
        let dx = enemyGeneral.targetX - enemyGeneral.x;
        let dy = enemyGeneral.targetY - enemyGeneral.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) { // Move closer
            enemyGeneral.x += (dx / dist) * GENERAL_CONFIG.speed;
            enemyGeneral.y += (dy / dist) * GENERAL_CONFIG.speed;
        } else {
            // In range, attack
            if (enemyGeneral.attackCooldown <= 0) {
                unitTakeDamage(nearestUnit, GENERAL_CONFIG.damage);
                enemyGeneral.attackCooldown = GENERAL_CONFIG.attackCooldown;

                // Visual feedback
                let dmgText = document.createElement('div');
                dmgText.style.position = 'absolute';
                dmgText.style.left = nearestUnit.x + '%';
                dmgText.style.top = nearestUnit.y + '%';
                dmgText.style.color = '#e74c3c';
                dmgText.style.fontSize = '24px';
                dmgText.style.fontWeight = 'bold';
                dmgText.style.zIndex = '200';
                dmgText.style.pointerEvents = 'none';
                dmgText.innerText = '-' + GENERAL_CONFIG.damage;
                document.getElementById('stronghold-area').appendChild(dmgText);
                setTimeout(() => dmgText.remove(), 800);
            }
        }
    } else {
        // PATROL or IDLE state
        enemyGeneral.state = 'PATROL';

        // Patrol near fortress
        let dx = enemyGeneral.targetX - enemyGeneral.x;
        let dy = enemyGeneral.targetY - enemyGeneral.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            // Pick new patrol point near fortress
            if (enemyFortress) {
                enemyGeneral.targetX = enemyFortress.x + (Math.random() - 0.5) * 20;
                enemyGeneral.targetY = enemyFortress.y + (Math.random() - 0.5) * 20;
            }
        } else {
            enemyGeneral.x += (dx / dist) * GENERAL_CONFIG.speed * 0.5; // Slower patrol
            enemyGeneral.y += (dy / dist) * GENERAL_CONFIG.speed * 0.5;
        }
    }

    // Decrease attack cooldown
    if (enemyGeneral.attackCooldown > 0) {
        enemyGeneral.attackCooldown--;
    }

    // Check if general is dead
    if (enemyGeneral.hp <= 0) {
        if (enemyGeneral.element) {
            enemyGeneral.element.remove();
        }
        speak("Tướng địch chết!");
        console.log('Enemy General defeated!');
    }

    updateEnemyGeneralVisual();
}

// =========================================
// PHẦN 6: UNIT LOGIC
// =========================================

function spawnUnitVisual(type) {
    if (!hasBuiltStronghold) return;

    // Create Container
    const container = document.createElement('div');
    container.classList.add('unit-container');
    container.classList.add(playerColorClass);
    if (type === 'INFANTRY') container.classList.add('unit-infantry');
    else if (type === 'CAVALRY') container.classList.add('unit-cavalry');

    // Create Status Bar Container
    const statusContainer = document.createElement('div');
    statusContainer.className = 'status-container';

    // HP Bar
    const hpBar = document.createElement('div');
    hpBar.className = 'stat-bar';
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-bar-fill';
    hpBar.appendChild(hpFill);

    // Morale Bar
    const moraleBar = document.createElement('div');
    moraleBar.className = 'stat-bar';
    const moraleFill = document.createElement('div');
    moraleFill.className = 'morale-bar-fill';
    moraleBar.appendChild(moraleFill);

    statusContainer.appendChild(hpBar);
    statusContainer.appendChild(moraleBar);
    container.appendChild(statusContainer);

    // Create Unit Sprite
    const img = document.createElement('img');
    img.classList.add('unit-sprite');
    if (type === 'INFANTRY') {
        img.src = 'hinh/bobinh.png';
    } else if (type === 'CAVALRY') {
        img.src = 'hinh/kybinh.png';
    } else {
        return;
    }
    container.appendChild(img);

    let unitObj = {
        type: type,
        element: container,
        sprite: img,
        hpFill: hpFill,
        moraleFill: moraleFill,
        x: tempX,
        y: tempY,
        state: 'IDLE',
        targetX: tempX,
        targetY: tempY,
        speed: (type === 'CAVALRY' ? 0.08 : 0.04),
        speedBonus: 1,
        isInvincible: false,
        hp: (type === 'CAVALRY' ? 150 : 100),
        maxHp: (type === 'CAVALRY' ? 150 : 100),
        morale: 100,
        maxMorale: 100
    };

    unitObj.x += (Math.random() - 0.5) * 5;
    unitObj.y += (Math.random() - 0.5) * 5;
    updateUnitVisual(unitObj);
    updateUnitBars(unitObj);
    document.getElementById('stronghold-area').appendChild(container);
    myUnits.push(unitObj);
}

function updateUnitVisual(u) {
    u.element.style.left = u.x + '%';
    u.element.style.top = u.y + '%';
    if (u.targetX < u.x) {
        if (u.sprite) u.sprite.style.transform = "scaleX(1)";
    } else {
        if (u.sprite) u.sprite.style.transform = "scaleX(-1)";
    }
}

function updateUnitBars(unit) {
    if (!unit.hpFill || !unit.moraleFill) return;

    // HP
    let hpPct = Math.max(0, (unit.hp / unit.maxHp) * 100);
    unit.hpFill.style.width = hpPct + '%';
    if (hpPct > 50) unit.hpFill.style.backgroundColor = '#2ecc71';
    else if (hpPct > 25) unit.hpFill.style.backgroundColor = '#f1c40f';
    else unit.hpFill.style.backgroundColor = '#e74c3c';

    // Morale
    let morPct = Math.max(0, (unit.morale / unit.maxMorale) * 100);
    unit.moraleFill.style.width = morPct + '%';
    if (morPct < 30) unit.moraleFill.style.backgroundColor = '#95a5a6';
    else unit.moraleFill.style.backgroundColor = '#3498db';
}

function unitTakeDamage(unit, amount) {
    if (unit.isInvincible) return;
    unit.hp -= amount;
    if (unit.hp <= 0) {
        unit.hp = 0;
        if (unit.element) unit.element.remove();
        myUnits = myUnits.filter(u => u !== unit);
    }
    updateUnitBars(unit);
}

function unitUpdateMorale(unit, amount) {
    unit.morale += amount;
    if (unit.morale > unit.maxMorale) unit.morale = unit.maxMorale;
    if (unit.morale < 0) unit.morale = 0;

    if (unit.morale < 20) {
        unit.speedBonus = 0.5;
    } else {
        unit.speedBonus = 1;
    }
    updateUnitBars(unit);
}

function runUnitAI() {
    myUnits.forEach(u => {
        if (u.type === 'PEASANT') return;

        // AI Battle System: Auto-targeting logic
        // Priority 1: Enemy General (if exists and alive)
        // Priority 2: Enemy Fortress (if exists and not destroyed)
        if (!u.currentTarget || (u.currentTarget && u.currentTarget.hp && u.currentTarget.hp <= 0)) {
            u.currentTarget = null;

            // Check for enemy general first
            if (enemyGeneral && enemyGeneral.hp > 0) {
                let dist = Math.sqrt(Math.pow(u.x - enemyGeneral.x, 2) + Math.pow(u.y - enemyGeneral.y, 2));
                if (dist < 40) { // Detection range
                    u.currentTarget = enemyGeneral;
                    u.targetX = enemyGeneral.x;
                    u.targetY = enemyGeneral.y;
                    u.state = 'ATTACK';
                }
            }

            // If no general target, go for fortress
            if (!u.currentTarget && enemyFortress && !enemyFortress.destroyed) {
                u.currentTarget = enemyFortress;
                u.targetX = enemyFortress.x;
                u.targetY = enemyFortress.y;
                u.state = 'ATTACK';
            }
        } else if (u.currentTarget) {
            // Update target position if targeting general (it moves)
            if (u.currentTarget === enemyGeneral && enemyGeneral && enemyGeneral.hp > 0) {
                u.targetX = enemyGeneral.x;
                u.targetY = enemyGeneral.y;
            }
        }

        let dx = u.targetX - u.x;
        let dy = u.targetY - u.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.5) {
            let moveSpeed = u.speed * u.speedBonus * (1 + (RESEARCH_LEVELS.MILITARY * RESEARCH_DATA.MILITARY.bonus));
            u.x += (dx / dist) * moveSpeed;
            u.y += (dy / dist) * moveSpeed;
            updateUnitVisual(u);
        } else {
            if (u.state === 'IDLE') {
                if (Math.random() < 0.02) {
                    let range = 15;
                    u.targetX = tempX + (Math.random() - 0.5) * range;
                    u.targetY = tempY + (Math.random() - 0.5) * range;
                }
            } else if (u.state === 'ATTACK') {
                if (dist < 1) u.state = 'IDLE';
                checkCombatCollision(u);
            }
        }
        checkCombatCollision(u);
    });
}

function checkCombatCollision(unit) {
    // AI Battle System: Attack fortress or general
    if (enemyGeneral && enemyGeneral.hp > 0) {
        let dx = unit.x - enemyGeneral.x;
        let dy = unit.y - enemyGeneral.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            if (Math.random() < 0.05) {
                let dmg = 10 * (1 + (RESEARCH_LEVELS.MILITARY * RESEARCH_DATA.MILITARY.bonus));
                enemyGeneral.hp -= dmg;

                let dmgVisual = document.createElement('div');
                dmgVisual.style.position = 'absolute';
                dmgVisual.style.left = enemyGeneral.x + '%';
                dmgVisual.style.top = enemyGeneral.y + '%';
                dmgVisual.style.color = '#f39c12';
                dmgVisual.style.fontSize = '20px';
                dmgVisual.style.fontWeight = 'bold';
                dmgVisual.innerText = '-' + Math.floor(dmg);
                dmgVisual.style.zIndex = '100';
                dmgVisual.style.pointerEvents = 'none';
                document.getElementById('stronghold-area').appendChild(dmgVisual);
                setTimeout(() => dmgVisual.remove(), 500);
            }
        }
    }

    if (enemyFortress && !enemyFortress.destroyed) {
        let dx = unit.x - enemyFortress.x;
        let dy = unit.y - enemyFortress.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 8) {
            if (Math.random() < 0.03) {
                let dmg = 8 * (1 + (RESEARCH_LEVELS.MILITARY * RESEARCH_DATA.MILITARY.bonus));
                enemyFortress.hp -= dmg;

                let dmgVisual = document.createElement('div');
                dmgVisual.style.position = 'absolute';
                dmgVisual.style.left = enemyFortress.x + '%';
                dmgVisual.style.top = enemyFortress.y + '%';
                dmgVisual.style.color = '#e67e22';
                dmgVisual.style.fontSize = '18px';
                dmgVisual.style.fontWeight = 'bold';
                dmgVisual.innerText = '-' + Math.floor(dmg);
                dmgVisual.style.zIndex = '100';
                dmgVisual.style.pointerEvents = 'none';
                document.getElementById('stronghold-area').appendChild(dmgVisual);
                setTimeout(() => dmgVisual.remove(), 500);
            }
        }
    }

    // Original enemy collision
    ENEMIES.forEach(enemy => {
        if (enemy.hp > 0) {
            let dx = unit.x - enemy.x;
            let dy = unit.y - enemy.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
                if (Math.random() < 0.05) {
                    let dmg = 10 * (1 + (RESEARCH_LEVELS.MILITARY * RESEARCH_DATA.MILITARY.bonus));
                    enemy.hp -= dmg;

                    let dmgVisual = document.createElement('div');
                    dmgVisual.style.position = 'absolute';
                    dmgVisual.style.left = enemy.x + '%';
                    dmgVisual.style.top = enemy.y + '%';
                    dmgVisual.style.color = 'red';
                    dmgVisual.style.fontSize = '20px';
                    dmgVisual.innerText = '-' + Math.floor(dmg);
                    dmgVisual.style.zIndex = '100';
                    document.getElementById('stronghold-area').appendChild(dmgVisual);
                    setTimeout(() => dmgVisual.remove(), 500);

                    if (enemy.hp <= 0) {
                        alert("Đã tiêu diệt " + enemy.name + "! +500 Vàng");
                        RESOURCES.gold += 500;
                        updateUI();
                        if (enemy.element) enemy.element.remove();
                        USER_PROFILE.xp += 500;
                    }
                }
            }
        }
    });
}

function checkWinLossConditions() {
    if (!hasBuiltStronghold || !enemyFortress || !enemyGeneral) return;

    // WIN CONDITION: Both fortress AND general must be destroyed
    let fortressDestroyed = enemyFortress.destroyed || enemyFortress.hp <= 0;
    let generalDead = enemyGeneral.hp <= 0;

    if (fortressDestroyed && generalDead && !window.battleEnded) {
        window.battleEnded = true;
        setTimeout(() => {
            alert("🎉 CHIẾN THẮNG! 🎉\n\nĐã tiêu diệt thành địch và tướng địch!\n\n+2000 Vàng\n+1000 XP");
            RESOURCES.gold += 2000;
            USER_PROFILE.xp += 1000;
            updateUI();
            speak("Chiến thắng vẻ vang!");
            console.log('VICTORY! Both objectives destroyed.');
        }, 500);
        return;
    }

    // LOSS CONDITION: All player units (excluding peasants) are dead
    let activeUnits = myUnits.filter(u => u.type !== 'PEASANT' && u.hp > 0);
    if (activeUnits.length === 0 && myUnits.some(u => u.type !== 'PEASANT') && !window.battleEnded) {
        window.battleEnded = true;
        setTimeout(() => {
            alert("💀 THẤT BẠI! 💀\n\nToàn bộ lính đã bị tiêu diệt!");
            speak("Thua trận!");
            console.log('DEFEAT! All units dead.');
        }, 500);
    }
}

// =========================================
// PHẦN 7: MINIMAP
// =========================================

const mmVP = document.getElementById('minimap-viewport');
const mmBase = document.getElementById('minimap-base');
const mmCont = document.getElementById('minimap-container');
let mmDrag = false;

function moveCamByMM(e) {
    let rect = mmCont.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    target.x = (window.innerWidth / 2) - ((x / rect.width) * 3000 * target.scale);
    target.y = (window.innerHeight / 2) - ((y / rect.height) * 2000 * target.scale);
    clampMap();
}

mmCont.addEventListener('mousedown', e => {
    e.stopPropagation();
    mmDrag = true;
    moveCamByMM(e);
});

window.addEventListener('mousemove', e => {
    if (mmDrag) moveCamByMM(e);
});

window.addEventListener('mouseup', () => mmDrag = false);

setInterval(() => {
    if (document.getElementById('screen-map').classList.contains('hidden')) return;

    let w = (window.innerWidth / target.scale) * (240 / 3000);
    let h = (window.innerHeight / target.scale) * (160 / 2000);

    if (w > 60) w = 60;
    if (h > 40) h = 40;

    mmVP.style.width = w + 'px';
    mmVP.style.height = h + 'px';
    mmVP.style.left = (-current.x / current.scale) * (240 / 3000) + 'px';
    mmVP.style.top = (-current.y / current.scale) * (160 / 2000) + 'px';

    if (hasBuiltStronghold) {
        mmBase.style.left = tempX + '%';
        mmBase.style.top = tempY + '%';
    }
}, 16);

// =========================================
// PHẦN 8: COMBAT SYSTEM
// =========================================

function startCombatMode(enemy) {
    inCombat = true;
    enemyHP = enemy.hp;
    document.getElementById('screen-map').classList.add('hidden');
    document.getElementById('screen-combat').classList.remove('hidden');
    document.getElementById('enemy-name').innerText = enemy.name;
    updateVitals();
    document.getElementById('enemy-target-hud').classList.remove('hidden');
    enemyAI_Loop();
}

function exitCombatMode() {
    inCombat = false;
    clearTimeout(combatTimer);
    document.getElementById('screen-combat').classList.add('hidden');
    document.getElementById('screen-map').classList.remove('hidden');
}

function enemyAI_Loop() {
    if (!inCombat) return;
    combatTimer = setTimeout(() => {
        if (Math.random() < 0.4) {
            performEnemyAttack();
        } else {
            enemyStance = ['TOP', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 3)];
            enemyAI_Loop();
        }
    }, 1000 + Math.random() * 1000);
}

function performEnemyAttack() {
    enemyAction = 'ATTACK';
    let atkDir = ['TOP', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 3)];
    let warn = document.getElementById('dir-' + atkDir.toLowerCase());
    warn.style.borderColor = "red";
    warn.style.boxShadow = "0 0 20px red";

    setTimeout(() => {
        if (!inCombat) return;
        if (currentStance !== atkDir) {
            playerHP -= 100;
            updateVitals();
            showFloatingText("-100", true);
            if (playerHP <= 0) {
                alert("Thua rồi!");
                exitCombatMode();
                playerHP = 1000;
            }
        } else {
            showFloatingText("BLOCKED", false);
        }
        warn.style.borderColor = "";
        warn.style.boxShadow = "";
        enemyAction = 'IDLE';
        enemyAI_Loop();
    }, 800);
}

document.addEventListener('mousemove', e => {
    if (!inCombat) return;
    let dx = e.clientX - window.innerWidth / 2;
    let dy = e.clientY - window.innerHeight / 2;

    document.querySelectorAll('.dir-sector').forEach(el => el.classList.remove('dir-active'));

    if (dy < 0 && Math.abs(dx) < Math.abs(dy)) {
        currentStance = 'TOP';
        document.getElementById('dir-top').classList.add('dir-active');
    } else if (dx < 0) {
        currentStance = 'LEFT';
        document.getElementById('dir-left').classList.add('dir-active');
    } else {
        currentStance = 'RIGHT';
        document.getElementById('dir-right').classList.add('dir-active');
    }
});

document.addEventListener('mousedown', e => {
    if (!inCombat || e.button !== 0 || enemyAction === 'ATTACK') return;

    if (currentStance !== enemyStance) {
        let dmg = 50 * (1 + (RESEARCH_LEVELS.WEAPON * RESEARCH_DATA.WEAPON.bonus));
        enemyHP -= dmg;
        weaponDurability -= 1;
        updateUI();
        document.getElementById('enemy-hp-bar').style.width = (enemyHP / 2000) * 100 + '%';
        showFloatingText(Math.floor(dmg), true);

        if (enemyHP <= 0) {
            alert("Thắng trận! +1000 Vàng");
            RESOURCES.gold += 1000;
            updateUI();
            let deadEnemy = ENEMIES.find(e => e.hp <= 0);
            if (deadEnemy) {
                deadEnemy.hp = 0;
                if (deadEnemy.element) deadEnemy.element.remove();
            }
            USER_PROFILE.xp += 1000;
            exitCombatMode();
        }
    } else {
        showFloatingText("BLOCKED", false);
    }
});

function showFloatingText(txt, isCrit) {
    let el = document.createElement('div');
    el.className = 'float-text';
    el.innerText = txt;
    el.style.left = `calc(50% + ${(Math.random() - 0.5) * 100}px)`;
    el.style.top = `calc(50% + ${(Math.random() - 0.5) * 50}px)`;
    el.style.color = isCrit ? '#e74c3c' : '#3498db';
    document.getElementById('floating-text-container').appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function updateVitals() {
    document.getElementById('player-hp-bar').style.width = (playerHP / 1000) * 100 + '%';
}

// =========================================
// PHẦN 9: LOGISTICS & ECONOMY
// =========================================

function enterLogistics() {
    document.getElementById('screen-map').classList.add('hidden');
    document.getElementById('screen-logistics').classList.remove('hidden');
    updateUI();
}

function exitLogistics() {
    document.getElementById('screen-logistics').classList.add('hidden');
    document.getElementById('screen-map').classList.remove('hidden');
    updateUI();
}

function toggleShopModal() {
    document.getElementById('shop-modal').classList.toggle('hidden');
}

function openSabotageModal() {
    document.getElementById('sabotage-modal').classList.remove('hidden');
}

function closeSabotageModal() {
    document.getElementById('sabotage-modal').classList.add('hidden');
}

function openResearchModal() {
    document.getElementById('research-modal').classList.remove('hidden');
    updateResearchUI();
}

function closeResearchModal() {
    document.getElementById('research-modal').classList.add('hidden');
}

function upgradeTech(type) {
    let cost = 500 * (RESEARCH_LEVELS[type] + 1);
    if (RESOURCES.gold >= cost) {
        RESOURCES.gold -= cost;
        RESEARCH_LEVELS[type]++;
        if (type === 'WEAPON') {
            maxWeaponDurability = 100 * (1 + (RESEARCH_LEVELS.WEAPON * 0.5));
            weaponDurability = maxWeaponDurability;
        }
        updateUI();
        updateResearchUI();
        speak("Nâng cấp thành công!");
    } else {
        alert("Không đủ vàng!");
    }
}

function updateResearchUI() {
    document.getElementById('lvl-military').innerText = RESEARCH_LEVELS.MILITARY;
    document.getElementById('lvl-weapon').innerText = RESEARCH_LEVELS.WEAPON;
    document.getElementById('lvl-farming').innerText = RESEARCH_LEVELS.FARMING;
    document.getElementById('stat-military').innerText = (RESEARCH_LEVELS.MILITARY * RESEARCH_DATA.MILITARY.bonus * 100) + "%";
    document.getElementById('stat-weapon').innerText = (RESEARCH_LEVELS.WEAPON * RESEARCH_DATA.WEAPON.bonus * 100) + "%";
    document.getElementById('stat-farming').innerText = (RESEARCH_LEVELS.FARMING * RESEARCH_DATA.FARMING.bonus * 100) + "%";
}



// =========================================
// TRAINING CAMP LOGIC
// =========================================

function openTrainingCamp() {
    document.getElementById('screen-logistics').classList.add('hidden');
    document.getElementById('screen-training-camp').classList.remove('hidden');
    renderTrainingUI();
    updateTrainingGold();
}

function closeTrainingCamp() {
    document.getElementById('screen-training-camp').classList.add('hidden');
    document.getElementById('screen-logistics').classList.remove('hidden');
    updateUI();
}

function renderTrainingUI() {
    const list = document.getElementById('training-unit-list');
    list.innerHTML = '';

    for (let type in UNIT_METADATA) {
        let isLocked = !UNIT_UNLOCK_STATUS[type];
        let unit = UNIT_METADATA[type];

        let card = document.createElement('div');
        card.className = `unit-card ${isLocked ? 'locked' : ''}`;

        // Icon
        let iconFrame = document.createElement('div');
        iconFrame.className = 'unit-icon-frame';
        let img = document.createElement('img');
        img.src = unit.icon;
        iconFrame.appendChild(img);

        // Stats
        let statsHTML = `
            <div class="unit-stats">
                <div class="unit-stat-item"><span class="unit-stat-icon">⚔️</span>${unit.stats.atk}</div>
                <div class="unit-stat-item"><span class="unit-stat-icon">🛡️</span>${unit.stats.def}</div>
                <div class="unit-stat-item"><span class="unit-stat-icon">⚡</span>${unit.stats.spd}</div>
            </div>
        `;

        card.innerHTML = `
            ${iconFrame.outerHTML}
            <h3 class="unit-name">${unit.name}</h3>
            <p style="font-size: 0.9rem; color: #aaa; text-align: center; height: 40px;">${unit.desc}</p>
            ${statsHTML}
            <div class="unit-cost">🟡 ${unit.cost}</div>
            <button class="btn-train" onclick="trainUnit('${type}')" ${isLocked ? 'disabled' : ''}>
                ${isLocked ? 'CHƯA MỞ' : 'HUẤN LUYỆN'}
            </button>
        `;

        list.appendChild(card);
    }
}

function trainUnit(type) {
    if (!UNIT_UNLOCK_STATUS[type]) return;

    let unit = UNIT_METADATA[type];
    if (RESOURCES.gold >= unit.cost) {
        RESOURCES.gold -= unit.cost;
        myUnits.push({ type: type });
        spawnUnitVisual(type);

        updateTrainingGold();
        speak("Tuyển quân thành công");

        // Visual feedback on button
        // Optional
    } else {
        alert("Không đủ vàng! Cần " + unit.cost);
    }
}

function updateTrainingGold() {
    document.getElementById('training-gold-display').innerText = RESOURCES.gold;
}

function tradeRiceForGold() {
    let rate = 50 * (1 + (RESEARCH_LEVELS.FARMING * 0.2));
    if (RESOURCES.food >= 100) {
        RESOURCES.food -= 100;
        RESOURCES.gold += Math.floor(rate);
        updateUI();
    }
}

function updateUI() {
    document.getElementById('res-food').innerText = RESOURCES.food;
    document.getElementById('res-gold').innerText = RESOURCES.gold;
    document.getElementById('res-army').innerText = myUnits.filter(u => u.type !== 'PEASANT').length;
    document.getElementById('weapon-durability').innerText = Math.floor(weaponDurability);
    document.getElementById('score-display').innerText = RESOURCES.gold;

    if (!document.getElementById('screen-logistics').classList.contains('hidden')) {
        document.getElementById('log-peasant').innerText = myUnits.filter(u => u.type === 'PEASANT').length;
        document.getElementById('count-infantry').innerText = myUnits.filter(u => u.type === 'INFANTRY').length;
        document.getElementById('count-cavalry').innerText = myUnits.filter(u => u.type === 'CAVALRY').length;
    }
    updateSkillUI();
}

// Auto production
setInterval(() => {
    let p = myUnits.filter(u => u.type === 'PEASANT').length;
    let production = p * 10 * (1 + (RESEARCH_LEVELS.FARMING * RESEARCH_DATA.FARMING.bonus));
    if (p > 0) {
        RESOURCES.food += Math.floor(production);
        updateUI();
    }
}, 1000);

function performSabotage(type) {
    let cost = (type === 'FIRE') ? 200 : (type === 'BUG') ? 300 : 500;
    if (RESOURCES.gold >= cost) {
        RESOURCES.gold -= cost;
        updateUI();
        spawnEffect(type, 5);
        speak("Đã phá hoại!");
    } else {
        alert("Thiếu vàng");
    }
}

function spawnEffect(type, count) {
    for (let i = 0; i < count; i++) {
        let el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = (tempX + (Math.random() - 0.5) * 10) + '%';
        el.style.top = (tempY + (Math.random() - 0.5) * 10) + '%';
        el.style.fontSize = '30px';
        el.style.zIndex = 60;

        if (type === 'FIRE') {
            el.innerText = '🔥';
            el.className = 'fire-effect';
        } else if (type === 'BUG') {
            el.innerText = '🐛';
            el.className = 'bug-effect';
        } else {
            el.innerText = '🚩';
            el.className = 'taunt-flag';
        }
        document.getElementById('stronghold-area').appendChild(el);
    }
}

function updateSkillUI() {
    // Placeholder for skill UI updates
}

function activateGeneralSkill() {
    if (isSkillReady) {
        alert("Kỹ năng " + HERO_DATA[currentFaction].name + " kích hoạt!");
        isSkillReady = false;
        setTimeout(() => {
            isSkillReady = true;
        }, 60000);
    } else {
        alert("Kỹ năng đang hồi!");
    }
}

// =========================================
// PHẦN 10: TACTICAL MAP
// =========================================

window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        if (hasBuiltStronghold) {
            const tacticalMap = document.getElementById('screen-tactical-map');
            tacticalMap.classList.toggle('hidden');
            if (!tacticalMap.classList.contains('hidden')) {
                tacScale = 0.5;
                updateTacticalTransform();
            }
        } else {
            alert("Hãy xây dựng thành trì trước khi xem bản đồ chiến thuật!");
        }
    }
});

const tacticalViewport = document.getElementById('tactical-map-viewport');
const tacticalImg = document.getElementById('tactical-map-img');

tacticalViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    tacScale = Math.min(Math.max(tacScale + delta, 0.2), 2.0);
    updateTacticalTransform();
});

function updateTacticalTransform() {
    tacticalImg.style.transform = `scale(${tacScale})`;
    const offsetX = (window.innerWidth - 3000 * tacScale) / 2;
    const offsetY = (window.innerHeight - 2000 * tacScale) / 2;
    tacticalImg.style.left = offsetX + 'px';
    tacticalImg.style.top = offsetY + 'px';
}

tacticalViewport.addEventListener('click', (e) => {
    const rect = tacticalImg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    if (percentX >= 0 && percentX <= 100 && percentY >= 0 && percentY <= 100) {
        pendingTacticalTarget = { x: percentX, y: percentY };
        document.getElementById('modal-attack-confirm').classList.remove('hidden');
    }
});

function confirmAttackOrder() {
    document.getElementById('modal-attack-confirm').classList.add('hidden');
    document.getElementById('screen-tactical-map').classList.add('hidden');

    let count = 0;
    myUnits.forEach(u => {
        if (u.type !== 'PEASANT') {
            u.state = 'ATTACK';
            u.targetX = pendingTacticalTarget.x;
            u.targetY = pendingTacticalTarget.y;
            count++;
        }
    });

    if (count > 0) {
        speak("Toàn quân, tiến công!");
        target.x = (window.innerWidth / 2) - (pendingTacticalTarget.x / 100 * 3000 * target.scale);
        target.y = (window.innerHeight / 2) - (pendingTacticalTarget.y / 100 * 2000 * target.scale);
        clampMap();
    } else {
        alert("Bạn chưa có quân lính để tấn công!");
    }
}

function cancelAttackOrder() {
    document.getElementById('modal-attack-confirm').classList.add('hidden');
}

// =========================================
// PHẦN 11: QUIZ / TRAINING
// =========================================

function startTraining() {
    document.getElementById('hkda-scene-wrapper').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('hkda-scene-wrapper').classList.add('hidden');
        document.getElementById('screen-training').classList.remove('hidden');
        document.getElementById('quiz-start-screen').classList.remove('hidden');
        document.getElementById('quiz-game-screen').classList.add('hidden');
        document.getElementById('quiz-end-screen').classList.add('hidden');
    }, 500);
}

function closeTraining() {
    document.getElementById('screen-training').classList.add('hidden');
    document.getElementById('hkda-scene-wrapper').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('hkda-scene-wrapper').style.opacity = '1';
    }, 100);
}

function chooseCampaign(campId) {
    currentQuiz = QUIZ_DATA[campId];
    currentQIndex = 0;
    quizScore = 0;
    document.getElementById('quiz-start-screen').classList.add('hidden');
    document.getElementById('quiz-game-screen').classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    if (currentQIndex >= currentQuiz.length) {
        endQuiz();
        return;
    }

    const qData = currentQuiz[currentQIndex];
    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('question-count').innerText = `Câu ${currentQIndex + 1}/${currentQuiz.length}`;

    const btnContainer = document.getElementById('answer-buttons');
    btnContainer.innerHTML = '';

    qData.a.forEach((ans, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        btn.onclick = () => checkAnswer(index, qData.c, btn);
        btnContainer.appendChild(btn);
    });

    document.getElementById('feedback-msg').innerText = "";
}

function checkAnswer(selectedIndex, correctIndex, btnElement) {
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(b => b.disabled = true);

    if (selectedIndex === correctIndex) {
        btnElement.classList.add('correct-answer');
        document.getElementById('feedback-msg').innerText = "Chính xác! 🎉";
        document.getElementById('feedback-msg').style.color = "#2ecc71";
        quizScore++;
        RESOURCES.gold += 100;
        document.getElementById('score-display').innerText = RESOURCES.gold;
    } else {
        btnElement.classList.add('wrong-answer');
        document.getElementById('feedback-msg').innerText = "Sai rồi! 😢";
        document.getElementById('feedback-msg').style.color = "#e74c3c";
    }

    setTimeout(() => {
        currentQIndex++;
        loadQuestion();
    }, 1500);
}

function endQuiz() {
    document.getElementById('quiz-game-screen').classList.add('hidden');
    document.getElementById('quiz-end-screen').classList.remove('hidden');
    document.getElementById('final-result-text').innerText = `Bạn trả lời đúng ${quizScore}/${currentQuiz.length} câu.`;
}

function backToCampaignSelect() {
    document.getElementById('quiz-end-screen').classList.add('hidden');
    document.getElementById('quiz-game-screen').classList.add('hidden');
    document.getElementById('quiz-start-screen').classList.remove('hidden');
}

// =========================================
// PHẦN 12: COLLECTION (KHO TƯỚNG)
// =========================================

function openGeneralCollection() {
    const gridVN = document.getElementById('grid-vietnam');
    const gridINV = document.getElementById('grid-invader');
    gridVN.innerHTML = "";
    gridINV.innerHTML = "";

    document.getElementById('hkda-scene-wrapper').classList.add('hidden');
    document.getElementById('screen-collection').classList.remove('hidden');

    COLLECTION_DATA.forEach(hero => {
        const card = document.createElement('div');
        card.className = "hero-card";
        card.innerHTML = `
            <div style="cursor: pointer;" onclick="selectHeroForDisplay(${hero.id})" title="Bấm hình để chọn tướng này ra trận">
                <img src="${hero.img}" alt="${hero.name}">
            </div>
            <h3 style="color: #f1c40f; margin: 10px 0;">${hero.name}</h3>
            <button class="btn-select" style="width:100%;" onclick="viewHeroDetail(${hero.id})">Xem Chỉ Số</button>
        `;
        if (hero.faction === 'vietnam') {
            gridVN.appendChild(card);
        } else {
            gridINV.appendChild(card);
        }
    });
}

function selectHeroForDisplay(id) {
    const hero = COLLECTION_DATA.find(h => h.id === id);
    if (!hero) return;

    const mainDisplay = document.getElementById('main-hero-display');
    const silhouette = document.getElementById('default-silhouette');
    mainDisplay.src = hero.img;
    mainDisplay.classList.remove('hidden');
    silhouette.classList.add('hidden');
    closeCollection();
    alert("Đã chọn chủ tướng: " + hero.name);
    playSfx('sword');
}

function closeCollection() {
    document.getElementById('screen-collection').classList.add('hidden');
    document.getElementById('hkda-scene-wrapper').classList.remove('hidden');
    document.getElementById('hkda-scene-wrapper').style.opacity = '1';
}

function viewHeroDetail(id) {
    const hero = COLLECTION_DATA.find(h => h.id === id);
    if (!hero) return;

    document.getElementById('detail-img').src = hero.img;
    document.getElementById('detail-name').innerText = hero.name;
    document.getElementById('bar-str').style.width = hero.str + '%';
    document.getElementById('val-str').innerText = hero.str;
    document.getElementById('bar-int').style.width = hero.int + '%';
    document.getElementById('val-int').innerText = hero.int;
    document.getElementById('bar-lead').style.width = hero.lead + '%';
    document.getElementById('val-lead').innerText = hero.lead;
    document.getElementById('detail-skill-name').innerText = hero.skill;
    document.getElementById('detail-skill-desc').innerText = hero.desc;
    document.getElementById('modal-hero-detail').classList.remove('hidden');
}

function closeHeroDetail() {
    document.getElementById('modal-hero-detail').classList.add('hidden');
    document.getElementById('skill-desc-popup').classList.add('hidden');
}

function toggleSkillDesc() {
    document.getElementById('skill-desc-popup').classList.toggle('hidden');
}

// =========================================
// PHẦN 13: MUSEUM & GACHA
// =========================================

function openMuseum() {
    document.getElementById('modal-museum').classList.remove('hidden');
    updateMuseumUI();
}

function updateMuseumUI() {
    document.getElementById('frag-cocgo').innerText = ARTIFACTS.cocgo.frags;
    document.getElementById('frag-hich').innerText = ARTIFACTS.hich.frags;

    if (ARTIFACTS.cocgo.unlocked) {
        document.getElementById('artifact-cocgo').classList.add('unlocked');
        document.getElementById('lore-cocgo').classList.remove('hidden');
    }
    if (ARTIFACTS.hich.unlocked) {
        document.getElementById('artifact-hich').classList.add('unlocked');
        document.getElementById('lore-hich').classList.remove('hidden');
    }
}

function craftArtifact(id) {
    const item = ARTIFACTS[id];
    if (item.unlocked) {
        alert("Vật phẩm này đã được phục chế hoàn chỉnh!");
        return;
    }
    if (item.frags >= item.req) {
        item.frags -= item.req;
        item.unlocked = true;
        alert("Phục chế thành công! Lịch sử đã được mở khóa.");
        updateMuseumUI();
    } else {
        alert("Chưa đủ mảnh ghép để phục chế!");
    }
}

function openGachaModal() {
    document.getElementById('modal-gacha').classList.remove('hidden');
    document.getElementById('gacha-user-gold').innerText = RESOURCES.gold;
    document.getElementById('gacha-result').classList.add('hidden');
}

function runGacha() {
    if (RESOURCES.gold < 100) {
        alert("Không đủ vàng!");
        return;
    }

    RESOURCES.gold -= 100;
    document.getElementById('gacha-user-gold').innerText = RESOURCES.gold;
    updateUI();

    const rand = Math.random();
    let rewardType = "";
    let rewardValue = "";

    if (rand < 0.4) {
        rewardType = "Mảnh Cọc Gỗ";
        ARTIFACTS.cocgo.frags++;
        rewardValue = "🪵";
    } else if (rand < 0.7) {
        rewardType = "Túi Vàng";
        const goldWin = 150;
        RESOURCES.gold += goldWin;
        rewardValue = `+${goldWin} 🟡`;
    } else if (rand < 0.9) {
        rewardType = "Mảnh Hịch Tướng Sĩ";
        ARTIFACTS.hich.frags++;
        rewardValue = "📜";
    } else {
        rewardType = "Lính Mới";
        myUnits.push({
            type: 'INFANTRY',
            x: 50,
            y: 50,
            state: 'IDLE',
            targetX: 50,
            targetY: 50,
            speed: 0.04,
            speedBonus: 1
        });
        rewardValue = "🛡️";
    }

    const resultDiv = document.getElementById('gacha-result');
    const cardDiv = document.getElementById('reward-card');
    resultDiv.classList.remove('hidden');
    cardDiv.innerHTML = `${rewardValue}<br>${rewardType}`;
}

// =========================================
// PHẦN 14: PROFILE SYSTEM
// =========================================

function getCurrentRank(xp) {
    for (let i = 0; i < RANK_SYSTEM.length; i++) {
        if (xp < RANK_SYSTEM[i].maxXP) {
            let prevMax = (i === 0) ? 0 : RANK_SYSTEM[i - 1].maxXP;
            return {
                current: RANK_SYSTEM[i],
                nextMax: RANK_SYSTEM[i].maxXP,
                prevMax: prevMax
            };
        }
    }
    return {
        current: RANK_SYSTEM[RANK_SYSTEM.length - 1],
        nextMax: xp,
        prevMax: 0
    };
}

function openProfile() {
    const modal = document.getElementById('modal-profile');
    if (modal) {
        modal.classList.remove('hidden');
        renderProfileData();
        drawRadarChart();
    }
}

function closeProfile() {
    document.getElementById('modal-profile').classList.add('hidden');
}

function renderProfileData() {
    const rankInfo = getCurrentRank(USER_PROFILE.xp);
    const currentRank = rankInfo.current;

    document.getElementById('profile-name').innerText = USER_PROFILE.name;
    document.getElementById('profile-title').innerText = currentRank.name;

    const frameEl = document.getElementById('profile-frame');
    const imgEl = frameEl.querySelector('img');
    imgEl.className = 'profile-avatar';
    imgEl.classList.add(currentRank.frame);

    let currentProgress = USER_PROFILE.xp - rankInfo.prevMax;
    let levelRange = rankInfo.nextMax - rankInfo.prevMax;
    let percent = Math.floor((currentProgress / levelRange) * 100);
    if (percent > 100) percent = 100;

    document.getElementById('merit-text').innerText = `${USER_PROFILE.xp} / ${rankInfo.nextMax}`;
    document.getElementById('merit-bar-fill').style.width = percent + '%';

    document.getElementById('stat-winrate').innerText = USER_PROFILE.winrate + '%';
    document.getElementById('stat-kda').innerText = USER_PROFILE.kda;
    document.getElementById('stat-matches').innerText = USER_PROFILE.matches;
    document.getElementById('stat-honor').innerText = USER_PROFILE.honor;
}

function drawRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 90;

    const labels = ["Sát Thương", "Chống Chịu", "Hỗ Trợ", "Kiểm Soát", "Đa Dụng"];
    const dataValues = [
        USER_PROFILE.stats.damage,
        USER_PROFILE.stats.defense,
        USER_PROFILE.stats.support,
        USER_PROFILE.stats.control,
        USER_PROFILE.stats.utility
    ];
    const totalSides = 5;
    const angleStep = (Math.PI * 2) / totalSides;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    for (let r = 1; r <= 4; r++) {
        let curR = (radius / 4) * r;
        ctx.beginPath();
        for (let i = 0; i < totalSides; i++) {
            let angle = i * angleStep - Math.PI / 2;
            let x = cx + Math.cos(angle) * curR;
            let y = cy + Math.sin(angle) * curR;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < totalSides; i++) {
        let val = dataValues[i];
        let curR = (val / 100) * radius;
        let angle = i * angleStep - Math.PI / 2;
        let x = cx + Math.cos(angle) * curR;
        let y = cy + Math.sin(angle) * curR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = "rgba(241, 196, 15, 0.5)";
    ctx.fill();
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < totalSides; i++) {
        let angle = i * angleStep - Math.PI / 2;
        let x = cx + Math.cos(angle) * (radius + 20);
        let y = cy + Math.sin(angle) * (radius + 20);
        ctx.fillText(labels[i], x, y);
    }
}

// =========================================
// PHẦN 15: THƠ THẦN PANEL
// =========================================

function toggleThoThanPanel() {
    const panel = document.getElementById('panel-tho-than');
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }
}

function chonBaiTho(maBaiTho) {
    toggleThoThanPanel();

    let tenBai = "";
    let loiThoai = "";

    switch (maBaiTho) {
        case 'NAM_QUOC':
            tenBai = "Nam Quốc Sơn Hà";
            loiThoai = "Sông núi nước Nam vua Nam ở...";
            break;
        case 'HICH_TUONG_SI':
            tenBai = "Hịch Tướng Sĩ";
            loiThoai = "Ta thường tới bữa quên ăn...";
            break;
        case 'BINH_NGO':
            tenBai = "Bình Ngô Đại Cáo";
            loiThoai = "Đem đại nghĩa để thắng hung tàn...";
            break;
        case 'THUAT_HOAI':
            tenBai = "Thuật Hoài";
            loiThoai = "Múa giáo non sông trải mấy thu...";
            break;
        case 'TUNG_GIA':
            tenBai = "Tụng Giá Hoàn Kinh Sư";
            loiThoai = "Chương Dương cướp giáo giặc...";
            break;
    }

    alert("⚔️ ĐÃ KÍCH HOẠT: " + tenBai + "\n\n🗣️ Tướng quân hô vang: \"" + loiThoai + "\"\n\n(Hiệu ứng đang chờ hồi chiêu...)");
}

// =========================================
// PHẦN 16: SYSTEM PANELS (BINH GIỚI, NÔNG NGHIỆP, UPGRADE)
// =========================================

// Military Panel
function batBangQuanSu() {
    document.getElementById('panel-quan-su-overlay').style.display = 'flex';
    document.getElementById('skill-info-box').style.display = 'none';
}

function tatBangQuanSu() {
    document.getElementById('panel-quan-su-overlay').style.display = 'none';
}

function chonTraiTuongBinh() {
    alert("Đã chọn Mua Trại Tượng Binh!\nHệ thống: Vui lòng chọn vị trí trên bản đồ để đặt Trại.");
}

function chonLoRen() {
    alert("Chào mừng đến Lò Rèn!\nTại đây bạn có thể tiêu Vàng để:\n1. Nâng cấp Vũ khí\n2. Nâng cấp Giáp");
}

function chonXuongQuanKhi() {
    alert("Xưởng Quân Khí:\nSẵn sàng chế tạo: Xe bắn đá, Xe đục thành, Thang dây.");
}

function chonBenThuyen() {
    alert("Bến Thuyền:\nBắt đầu đóng tàu bè để di chuyển quân qua sông.");
}

function chonTruongBan() {
    document.getElementById('skill-info-box').style.display = 'block';
    alert("Đã mở Trường Bắn!\nĐã kích hoạt: Nỏ Liên Châu & Tên Lửa.");
}

// Agriculture Panel
function moBangNongNghiep() {
    document.getElementById('panel-nong-nghiep-overlay').style.display = 'flex';
}

function dongBangNongNghiep() {
    document.getElementById('panel-nong-nghiep-overlay').style.display = 'none';
}

function chonTrauThan() {
    alert("Đã mua TRÂU THẦN!\nHiệu quả: Tốc độ sản xuất lúa tăng thêm 20%.");
}

function chonDeDieu() {
    var coLuLut = confirm("Mực nước sông đang cao báo động đỏ?\n(Bấm OK để giả lập đang có Lũ)");
    if (coLuLut) {
        alert("CẢNH BÁO LŨ LỤT!\nBạn đã xây Đê Điều thành công.\nMùa màng được bảo vệ.");
    } else {
        alert("Hiện tại thời tiết đang tốt, chưa cần xây Đê Điều.");
    }
}

function chonSoDienTho() {
    alert("Đã mua SỔ ĐIỀN THỔ!\nĐã mở rộng giới hạn đất đai.");
}

function chonChoPhien() {
    alert("Chào mừng đến CHỢ PHIÊN.\nTỷ giá: 100 Lúa = 10 Vàng.\nĐã quy đổi thành công!");
}

// =========================================
// PHẦN 17: UPGRADE UI (Hold to Upgrade)
// =========================================

function openUpgradeUI() {
    document.getElementById('panel-upgrade-overlay').style.display = 'flex';
    updateUpgradeUI();
}

function closeUpgradeUI() {
    document.getElementById('panel-upgrade-overlay').style.display = 'none';
}

function updateUpgradeUI() {
    if (currentLevel >= 5) {
        document.getElementById('next-stats').innerHTML = "<b>MAX LEVEL</b>";
        document.getElementById('img-next').style.display = 'none';
        document.getElementById('resource-cost').style.display = 'none';
        return;
    }

    let imgCurrent = document.getElementById('img-current');
    imgCurrent.src = soldierImages[currentLevel - 1];

    let currentInfo = (currentLevel == 1)
        ? { name: "Lính Trơn", atk: 50, def: 20 }
        : upgradeData[currentLevel - 1];

    document.getElementById('current-stats').innerHTML =
        `<b>${currentInfo.name}</b><br>ATK: ${currentInfo.atk} | DEF: ${currentInfo.def}`;

    const nextLvl = currentLevel + 1;
    const data = upgradeData[currentLevel];

    document.getElementById('img-next').src = soldierImages[nextLvl - 1];
    document.getElementById('img-next').style.display = 'block';
    document.getElementById('next-stats').innerHTML =
        `<b>${data.name}</b><br>ATK: ${data.atk} <span class="highlight-green">(Up)</span><br>Effect: ${data.buff}`;
    document.getElementById('resource-cost').innerHTML = `Yêu cầu: ${data.req}`;

    let nodes = document.querySelectorAll('.step-node');
    nodes.forEach((node, index) => {
        let step = index + 1;
        node.className = 'step-node';
        if (step <= currentLevel) {
            node.classList.add('passed');
        } else if (step === nextLvl) {
            node.classList.add('active');
        }
    });
}

function startHold() {
    if (currentLevel >= 5) return;

    document.getElementById('btnFill').style.transition = 'width 1500ms linear';
    document.getElementById('btnFill').style.width = '100%';

    holdTimer = setTimeout(() => {
        completeUpgrade();
    }, 1500);
}

function cancelHold() {
    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
    }
    let fill = document.getElementById('btnFill');
    fill.style.transition = 'width 0.2s';
    fill.style.width = '0%';
}

function completeUpgrade() {
    currentLevel++;
    document.getElementById('btnFill').style.transition = 'none';
    document.getElementById('btnFill').style.width = '0%';
    alert("CHÚC MỪNG! QUÂN ĐỘI LÊN LEVEL " + currentLevel);
    updateUpgradeUI();
}

// =========================================
// PHẦN 18: INITIALIZATION
// =========================================

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});