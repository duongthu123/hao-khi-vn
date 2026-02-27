# System Instructions - Đại Chiến Sử Việt: Hào Khí Đông A

## 1. Tổng Quan Dự Án

### 1.1 Mô Tả
**Đại Chiến Sử Việt - Hào Khí Đông A** là một web game chiến thuật lịch sử Việt Nam, tập trung vào thời kỳ nhà Trần chống quân Nguyên Mông. Game kết hợp các yếu tố:
- Chiến thuật thời gian thực (RTS)
- Quiz kiến thức lịch sử
- Thu thập tướng lĩnh
- Quản lý tài nguyên và phát triển căn cứ

### 1.2 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Không sử dụng**: Framework/Library ngoài (React, Vue, jQuery, etc.)
- **Assets**: SVG maps, PNG images, Web Audio API
- **Text-to-Speech**: Web Speech API (tiếng Việt)

### 1.3 Cấu Trúc File
```
project/
├── index.html          # Main HTML structure
├── style.css           # All styles (organized by sections)
├── script.js           # All game logic (organized by modules)
└── hinh/               # Image assets
    ├── thd.png         # Trần Hưng Đạo
    ├── omn.png         # Ô Mã Nhi
    ├── bandol.svg      # Main map
    ├── thanhtri.png    # Stronghold
    ├── haucan.png      # Logistics icon
    ├── bobinh.png      # Infantry unit
    └── kybinh.png      # Cavalry unit
```

---

## 2. Quy Tắc Code

### 2.1 HTML Guidelines
```html
<!-- ✅ ĐÚNG: Sử dụng semantic structure -->
<div id="screen-map" class="screen hidden">
    <div id="ui-hud">...</div>
    <div class="map-container" id="map-container">...</div>
</div>

<!-- ❌ SAI: Inline styles -->
<div style="position: fixed; top: 0;">...</div>

<!-- ✅ ĐÚNG: Descriptive IDs và classes -->
<button id="btn-enter-base" class="action-btn" onclick="enterLogistics()">

<!-- ❌ SAI: Generic naming -->
<button id="btn1" class="b" onclick="func()">
```

**Quy tắc đặt tên ID:**
| Prefix | Mục đích | Ví dụ |
|--------|----------|-------|
| `screen-` | Màn hình chính | `screen-map`, `screen-combat` |
| `modal-` | Popup/Dialog | `modal-profile`, `modal-confirm` |
| `btn-` | Button | `btn-enter-base`, `btn-sabotage` |
| `panel-` | Panel floating | `panel-tho-than`, `panel-upgrade-overlay` |
| `res-` | Resource display | `res-food`, `res-gold` |

### 2.2 CSS Guidelines

**Cấu trúc file style.css theo sections:**
```css
/* =========================================
   PHẦN 1: RESET & BASE STYLES
   ========================================= */

/* =========================================
   PHẦN 2: CSS MENU CHÍNH (HKDA)
   ========================================= */

/* =========================================
   PHẦN 3: CSS CHẾ ĐỘ LUYỆN BINH
   ========================================= */

/* ... tiếp tục theo pattern ... */
```

**Naming Convention:**
```css
/* ✅ Component-based naming */
.hero-card { }
.hero-card img { }
.hero-card:hover { }

/* ✅ State classes */
.hidden { display: none !important; }
.active { }
.disabled { }

/* ✅ Modifier classes */
.btn-select { }
.btn-select-enemy { background: #555; }

/* ❌ SAI: Quá generic */
.box { }
.red { }
```

**Color Palette (Theme Đông A):**
```css
:root {
    /* Primary - Vàng Hoàng Kim */
    --gold-primary: #f1c40f;
    --gold-dark: #b8860b;
    --gold-light: #ffd700;
    
    /* Secondary - Đỏ Chiến Tranh */
    --red-blood: #c0392b;
    --red-dark: #8b0000;
    --red-fire: #e74c3c;
    
    /* Neutral - Gỗ Cổ */
    --wood-dark: #3e2723;
    --wood-medium: #5d4037;
    --wood-light: #8d6e63;
    
    /* Background */
    --bg-dark: #1a1a1a;
    --bg-paper: #f4e4bc;
    
    /* Success/Action */
    --green-success: #27ae60;
    --green-light: #2ecc71;
}
```

### 2.3 JavaScript Guidelines

**Module Structure trong script.js:**
```javascript
// =========================================
// PHẦN 1: BIẾN TOÀN CỤC & DỮ LIỆU
// =========================================
let RESOURCES = { food: 0, gold: 500, army: 0 };
const HERO_DATA = { ... };

// =========================================
// PHẦN 2: UTILITY FUNCTIONS
// =========================================
function speak(text) { ... }
function playSfx(type) { ... }

// =========================================
// PHẦN 3: FEATURE MODULE (VD: COMBAT)
// =========================================
function startCombatMode(enemy) { ... }
function exitCombatMode() { ... }
function performEnemyAttack() { ... }
```

**Naming Convention:**
```javascript
// ✅ Functions: camelCase, verb + noun
function openProfile() { }
function updateUI() { }
function spawnEnemiesOnMap() { }

// ✅ Constants: UPPER_SNAKE_CASE
const MAP_WIDTH = 3000;
const RESEARCH_DATA = { ... };

// ✅ Variables: camelCase
let currentFaction = '';
let hasBuiltStronghold = false;

// ✅ DOM elements: descriptive
const mapContainer = document.getElementById('map-container');

// ❌ SAI
function do_something() { }  // snake_case
function x() { }             // không rõ nghĩa
let a = 5;                   // không mô tả
```

**Event Handling Pattern:**
```javascript
// ✅ ĐÚNG: Event listener
mapContainer.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    // logic here
});

// ✅ ĐÚNG: Inline onclick cho simple actions
<button onclick="openProfile()">Profile</button>

// ❌ SAI: Mixing patterns không nhất quán
```

---

## 3. Kiến Trúc Game

### 3.1 Screen Flow
```
┌─────────────────┐
│  HKDA Menu      │ (z-index: 1000)
│  #hkda-scene    │
└────────┬────────┘
         │ startGame()
         ▼
┌─────────────────┐
│  Hero Selection │ (z-index: default)
│  #screen-select │
└────────┬────────┘
         │ selectHero() → showHeroInfo()
         ▼
┌─────────────────┐
│  Hero Bio       │ (z-index: 20)
│  #screen-bio    │
└────────┬────────┘
         │ confirmHeroSelection()
         ▼
┌─────────────────┐     enterLogistics()    ┌──────────────────┐
│  Main Map       │◄─────────────────────────│  Logistics       │
│  #screen-map    │─────────────────────────►│  #screen-logist  │
└────────┬────────┘     exitLogistics()      └──────────────────┘
         │
         │ click enemy
         ▼
┌─────────────────┐
│  Combat         │ (z-index: 200)
│  #screen-combat │
└─────────────────┘
```

### 3.2 Z-Index Hierarchy
```
Level 99999: #modal-profile
Level 10000+: System overlays (upgrade, military, agriculture)
Level 9999: System buttons (fixed)
Level 5000: Training screen
Level 4000: Collection screen
Level 3000: Modals (shop, confirm, hero-detail)
Level 2500: Tactical map
Level 1000: HKDA Menu wrapper
Level 900: UI HUD, Minimap
Level 200: Combat screen
Level 100: Logistics
Level 50: Map elements (stronghold, enemies)
Level 20: Bio screen
Level 10: Map screen
```

### 3.3 State Management

**Global Game State:**
```javascript
// Faction & Progress
let currentFaction = '';           // 'VIETNAM' | 'INVADER'
let hasBuiltStronghold = false;

// Resources
let RESOURCES = {
    food: 0,
    gold: 500,
    army: 0
};

// Units
let myUnits = [{ type: 'PEASANT' }];

// Research
let RESEARCH_LEVELS = {
    MILITARY: 0,
    WEAPON: 0,
    FARMING: 0
};

// Combat State
let inCombat = false;
let playerHP = 1000;
let enemyHP = 2000;

// Map Camera
let target = { x: 0, y: 0, scale: 1 };
let current = { x: 0, y: 0, scale: 1 };
```

**State Update Pattern:**
```javascript
// ✅ Centralized UI update
function updateUI() {
    document.getElementById('res-food').innerText = RESOURCES.food;
    document.getElementById('res-gold').innerText = RESOURCES.gold;
    document.getElementById('res-army').innerText = 
        myUnits.filter(u => u.type !== 'PEASANT').length;
    // ... other UI updates
}

// ✅ Call updateUI() after state changes
function buyUnit(type) {
    RESOURCES.gold -= cost;
    myUnits.push({ type: type });
    updateUI();  // Always update UI
}
```

---

## 4. Feature Modules

### 4.1 Map System
```javascript
// Constants
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 2000;

// Camera smoothing
function gameLoop() {
    current.x += (target.x - current.x) * 0.1;  // Lerp factor
    current.y += (target.y - current.y) * 0.1;
    current.scale += (target.scale - current.scale) * 0.1;
    mapContainer.style.transform = 
        `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
    requestAnimationFrame(gameLoop);
}

// Zoom behavior
// - Min scale: fit screen
// - Max scale: 4x
// - Zoom toward mouse position
```

### 4.2 Unit System
```javascript
// Unit types
const UNIT_TYPES = {
    PEASANT: { cost: 50, speed: 0, produces: 'food' },
    INFANTRY: { cost: 100, speed: 0.04, damage: 10 },
    CAVALRY: { cost: 250, speed: 0.08, damage: 20 }
};

// Unit AI states
// - IDLE: Random patrol near base
// - ATTACK: Move to target position
```

### 4.3 Combat System
```javascript
// Direction-based combat
// - 3 sectors: TOP, LEFT, RIGHT
// - Block: Match stance with attack direction
// - Attack: Different stance from enemy

// Damage calculation
let dmg = baseDamage * (1 + RESEARCH_LEVELS.WEAPON * 0.1);
```

### 4.4 Quiz System
```javascript
// Data structure
const QUIZ_DATA = {
    'campaign_id': [
        { 
            q: "Question text",
            a: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
            c: 0  // Correct answer index
        }
    ]
};

// Rewards
// - Correct: +100 gold
// - Complete campaign: Unlock content
```

### 4.5 Profile & Rank System
```javascript
const RANK_SYSTEM = [
    { name: "Lính Trơn", maxXP: 100, frame: "frame-wood" },
    { name: "Lính Tinh Nhuệ", maxXP: 300, frame: "frame-wood" },
    // ... progressive ranks
    { name: "THẦN TƯỚNG", maxXP: 999999, frame: "frame-legendary" }
];

// XP sources
// - Kill enemy: +500 XP
// - Win combat: +1000 XP
// - Quiz correct: implied through gold
```

---

## 5. UI Components

### 5.1 Button Styles
```css
/* Primary Action (Gold) */
.hkda-btn-start {
    background: linear-gradient(90deg, #b8860b, #ffd700, #b8860b);
    clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0% 50%);
}

/* Secondary Action (Brown) */
.hkda-btn-train {
    background: #5d4037;
    border: 2px solid #8d6e63;
}

/* Danger Action (Red) */
.btn-sabotage {
    background: #c0392b;
}

/* Success Action (Green) */
.btn-confirm-hero {
    background: #27ae60;
}
```

### 5.2 Modal Pattern
```html
<div id="modal-xxx" class="modal hidden">
    <div class="modal-content">
        <!-- Content -->
        <button class="btn-close-shop" onclick="closeXxx()">ĐÓNG</button>
    </div>
</div>
```

```css
.modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### 5.3 System Button Pattern
```html
<button id="btn-xxx-main" class="system-btn system-btn-xxx" onclick="openXxx()">
    <span class="system-btn-icon">🎯</span>
    <span class="system-btn-label">LABEL</span>
</button>

<div id="panel-xxx-overlay" class="system-overlay">
    <!-- Panel content -->
</div>
```

---

## 6. Animation Guidelines

### 6.1 CSS Animations
```css
/* Breathing effect for hero */
@keyframes breatheHero {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}

/* Pulsing for enemies */
@keyframes pulseEnemy {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
}

/* Float up for damage text */
@keyframes floatUpText {
    0% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, -50px); opacity: 0; }
}
```

### 6.2 Transition Standards
```css
/* Fast feedback */
button { transition: 0.2s; }

/* Smooth camera */
.map-container { will-change: transform; }

/* Panel slide */
.hkda-settings-panel { transition: left 0.4s ease; }
```

---

## 7. Best Practices

### 7.1 Performance
```javascript
// ✅ Use requestAnimationFrame for game loop
function gameLoop() {
    // update logic
    requestAnimationFrame(gameLoop);
}

// ✅ Batch DOM updates
function updateUI() {
    // Update all UI elements in one function
}

// ✅ Use CSS transforms instead of top/left
element.style.transform = `translate(${x}px, ${y}px)`;

// ✅ will-change for animated elements
.map-container { will-change: transform; }
```

### 7.2 Accessibility
```javascript
// ✅ Provide text-to-speech feedback
function speak(text) {
    if ('speechSynthesis' in window) {
        let u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN';
        window.speechSynthesis.speak(u);
    }
}
```

### 7.3 Error Handling
```javascript
// ✅ Guard clauses
function viewHeroDetail(id) {
    const hero = COLLECTION_DATA.find(h => h.id === id);
    if (!hero) return;  // Guard
    // ... rest of logic
}

// ✅ Safe DOM access
const modal = document.getElementById('modal-profile');
if (modal) {
    modal.classList.remove('hidden');
}
```

---

## 8. Adding New Features

### 8.1 New Screen Checklist
1. Add HTML structure with `class="screen hidden"`
2. Add CSS in appropriate section
3. Add show/hide functions in script.js
4. Update z-index if needed
5. Add navigation buttons

### 8.2 New Modal Checklist
1. Use modal HTML pattern
2. Add open/close functions
3. Register z-index (3000+)

### 8.3 New Unit Type Checklist
1. Add to UNIT_TYPES constant
2. Create spawn function
3. Add visual assets
4. Update AI logic if needed
5. Add purchase button in logistics

---

## 9. Testing Checklist

- [ ] Menu navigation works
- [ ] Hero selection both factions
- [ ] Map pan/zoom smooth
- [ ] Stronghold placement
- [ ] Unit spawning and AI
- [ ] Combat enter/exit
- [ ] Combat mechanics (block/attack)
- [ ] Resource production
- [ ] Shop transactions
- [ ] Quiz flow complete
- [ ] Profile display
- [ ] All modals open/close
- [ ] Mobile touch events
- [ ] Text-to-speech works

---

## 10. Vietnamese Content Guidelines

### 10.1 Historical Accuracy
- Sử dụng tên gọi chính xác: "Hưng Đạo Vương", không phải "Trần Hưng Đạo Vương"
- Các sự kiện lịch sử phải chính xác về năm và nhân vật
- Trích dẫn văn thơ phải đúng nguyên văn

### 10.2 UI Text Style
- Tiêu đề: IN HOA, ngắn gọn
- Mô tả: Câu đầy đủ, dễ hiểu
- Nút bấm: Động từ mệnh lệnh (XUẤT KÍCH, ĐÓNG, XÁC NHẬN)

### 10.3 Voice Lines
```javascript
// Faction-appropriate
if (currentFaction === 'VIETNAM') {
    speak("Đại Việt. Hãy chọn vị trí màu đỏ.");
} else {
    speak("Nguyên Mông. Hãy chọn vị trí màu vàng.");
}
```

---

*Phiên bản: 1.0*
*Cập nhật: 2024*