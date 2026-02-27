# Tài Liệu Dự Án: Đại Chiến Sử Việt - Hào Khí Đông A

---

## 📋 Mục Lục

1. [Giới Thiệu](#1-giới-thiệu)
2. [Yêu Cầu Hệ Thống](#2-yêu-cầu-hệ-thống)
3. [Cài Đặt & Triển Khai](#3-cài-đặt--triển-khai)
4. [Cấu Trúc Dự Án](#4-cấu-trúc-dự-án)
5. [Hướng Dẫn Sử Dụng](#5-hướng-dẫn-sử-dụng)
6. [Kiến Trúc Kỹ Thuật](#6-kiến-trúc-kỹ-thuật)
7. [API Reference](#7-api-reference)
8. [Hệ Thống Game](#8-hệ-thống-game)
9. [Customization Guide](#9-customization-guide)
10. [Troubleshooting](#10-troubleshooting)
11. [Changelog](#11-changelog)
12. [Contributing](#12-contributing)
13. [License](#13-license)

---

## 1. Giới Thiệu

### 1.1 Tổng Quan

**Đại Chiến Sử Việt - Hào Khí Đông A** là một web game chiến thuật thời gian thực (RTS) kết hợp yếu tố giáo dục lịch sử Việt Nam. Game lấy bối cảnh thời kỳ nhà Trần kháng chiến chống quân Nguyên Mông (thế kỷ 13), tái hiện tinh thần "Hào Khí Đông A" hào hùng của dân tộc.

### 1.2 Tính Năng Chính

| Tính Năng | Mô Tả |
|-----------|-------|
| 🎮 **Chiến Thuật RTS** | Xây dựng căn cứ, tuyển quân, điều binh đánh trận |
| 📚 **Quiz Lịch Sử** | Học lịch sử qua các câu hỏi trắc nghiệm |
| ⚔️ **Combat System** | Hệ thống chiến đấu direction-based |
| 🏰 **Base Building** | Quản lý tài nguyên, nâng cấp công trình |
| 🎖️ **Collection** | Thu thập tướng lĩnh hai phe |
| 🏆 **Rank System** | Hệ thống cấp bậc từ Lính Trơn đến Thần Tướng |
| 🎁 **Gacha System** | Mở rương nhận thưởng ngẫu nhiên |
| 🏛️ **Museum** | Bảo tàng cổ vật lịch sử |

### 1.3 Đối Tượng Người Dùng

- **Học sinh/Sinh viên**: Học lịch sử qua game
- **Game thủ casual**: Thích game chiến thuật nhẹ nhàng
- **Người yêu lịch sử**: Tìm hiểu về thời Trần
- **Giáo viên**: Công cụ hỗ trợ giảng dạy

### 1.4 Screenshots

```
┌─────────────────────────────────────────────────────────┐
│                    HÀO KHÍ ĐÔNG A                       │
│                   Bạch Đằng Giang                       │
│                                                         │
│                 ┌─────────────────┐                     │
│                 │   XUẤT KÍCH     │                     │
│                 └─────────────────┘                     │
│                 ┌─────────────────┐                     │
│                 │   LUYỆN BINH    │                     │
│                 └─────────────────┘                     │
│                                                         │
│    [Silhouette của tướng]     [Cờ: Phá cường địch]     │
│                                      Báo hoàng ân       │
└─────────────────────────────────────────────────────────┘
                    Menu Chính
```

---

## 2. Yêu Cầu Hệ Thống

### 2.1 Yêu Cầu Tối Thiểu

| Thành Phần | Yêu Cầu |
|------------|---------|
| **Trình duyệt** | Chrome 80+, Firefox 75+, Safari 13+, Edge 80+ |
| **JavaScript** | ES6+ support |
| **Màn hình** | Tối thiểu 1024x768 |
| **RAM** | 2GB+ |
| **Kết nối** | Không yêu cầu (offline capable) |

### 2.2 Yêu Cầu Khuyến Nghị

| Thành Phần | Yêu Cầu |
|------------|---------|
| **Trình duyệt** | Chrome/Edge phiên bản mới nhất |
| **Màn hình** | 1920x1080 trở lên |
| **RAM** | 4GB+ |
| **Âm thanh** | Có loa/tai nghe (cho voice feedback) |

### 2.3 Tính Năng Trình Duyệt Cần Thiết

```javascript
// Kiểm tra tính tương thích
const requirements = {
    speechSynthesis: 'speechSynthesis' in window,
    audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
    requestAnimationFrame: 'requestAnimationFrame' in window,
    cssTransform: CSS.supports('transform', 'scale(1)'),
    touchEvents: 'ontouchstart' in window
};
```

---

## 3. Cài Đặt & Triển Khai

### 3.1 Cài Đặt Local

```bash
# Clone repository
git clone https://github.com/your-repo/dai-chien-su-viet.git

# Di chuyển vào thư mục
cd dai-chien-su-viet

# Mở bằng Live Server (VS Code) hoặc
# Sử dụng Python simple server
python -m http.server 8000

# Hoặc Node.js
npx serve .
```

### 3.2 Cấu Trúc Thư Mục

```
dai-chien-su-viet/
│
├── index.html              # File HTML chính
├── style.css               # Stylesheet
├── script.js               # Game logic
│
├── hinh/                   # Thư mục assets
│   ├── thd.png            # Trần Hưng Đạo portrait
│   ├── omn.png            # Ô Mã Nhi portrait
│   ├── bandol.svg         # Bản đồ chính
│   ├── thanhtri.png       # Icon thành trì
│   ├── haucan.png         # Icon hậu cần
│   ├── bobinh.png         # Sprite bộ binh
│   └── kybinh.png         # Sprite kỵ binh
│
├── audio/                  # (Optional) Sound effects
│   └── sword.mp3
│
├── docs/                   # Tài liệu
│   ├── README.md
│   ├── SYSTEM_INSTRUCTIONS.md
│   └── API_REFERENCE.md
│
└── README.md               # Hướng dẫn nhanh
```

### 3.3 Triển Khai Production

#### Option 1: Static Hosting (GitHub Pages)

```bash
# Push code lên GitHub
git add .
git commit -m "Deploy v1.0"
git push origin main

# Vào Settings > Pages > Source: main branch
# URL: https://username.github.io/dai-chien-su-viet/
```

#### Option 2: Netlify

```bash
# Kéo thả folder vào Netlify Drop
# Hoặc connect GitHub repo
# Auto-deploy on push
```

#### Option 3: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3.4 Environment Configuration

Game không yêu cầu environment variables. Tuy nhiên, có thể customize qua:

```javascript
// Thêm vào đầu script.js nếu cần
const CONFIG = {
    DEBUG_MODE: false,
    INITIAL_GOLD: 500,
    INITIAL_FOOD: 0,
    MAP_WIDTH: 3000,
    MAP_HEIGHT: 2000,
    VOICE_ENABLED: true,
    LANGUAGE: 'vi-VN'
};
```

---

## 4. Cấu Trúc Dự Án

### 4.1 Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                         INDEX.HTML                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      SCREENS                                 ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │  Menu    │ │Selection │ │   Map    │ │ Combat   │       ││
│  │  │  (HKDA)  │ │  (Hero)  │ │  (Main)  │ │ (Battle) │       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │Logistics │ │ Training │ │Collection│ │ Tactical │       ││
│  │  │  (Base)  │ │  (Quiz)  │ │ (Heroes) │ │  (Map)   │       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                       MODALS                                 ││
│  │  Profile | Shop | Research | Sabotage | Confirm | Museum    ││
│  │  Gacha | Hero Detail | Attack Confirm                       ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   FLOATING PANELS                            ││
│  │  Thơ Thần | Binh Giới | Nông Nghiệp | Upgrade               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STYLE.CSS                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Base   │ │  Menu   │ │Gameplay │ │ Modals  │ │ System  │   │
│  │ Styles  │ │  HKDA   │ │  Main   │ │  All    │ │ Panels  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SCRIPT.JS                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    STATE MANAGEMENT                          ││
│  │  RESOURCES | myUnits | RESEARCH_LEVELS | USER_PROFILE       ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Menu   │ │   Map   │ │ Combat  │ │  Quiz   │ │ Profile │   │
│  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Unit   │ │Economy  │ │ Gacha   │ │ Museum  │ │ Upgrade │   │
│  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 File Breakdown

#### index.html (Cấu trúc)

```
index.html
├── <head>
│   ├── Meta tags
│   └── CSS link
│
├── <body>
│   ├── #hkda-scene-wrapper     [Menu chính]
│   ├── #screen-training        [Quiz mode]
│   ├── #screen-selection       [Chọn phe]
│   ├── #screen-bio             [Info tướng]
│   ├── #screen-map             [Bản đồ chính]
│   ├── #screen-logistics       [Hậu cần]
│   ├── #screen-combat          [Chiến đấu]
│   ├── #screen-tactical-map    [Bản đồ chiến thuật]
│   ├── #screen-collection      [Kho tướng]
│   │
│   ├── [MODALS]
│   │   ├── #modal-profile
│   │   ├── #modal-attack-confirm
│   │   ├── #shop-modal
│   │   ├── #research-modal
│   │   ├── #sabotage-modal
│   │   ├── #modal-confirm
│   │   ├── #modal-hero-detail
│   │   ├── #modal-museum
│   │   └── #modal-gacha
│   │
│   ├── [FLOATING PANELS]
│   │   ├── #btn-tho-than-container
│   │   ├── #panel-tho-than
│   │   ├── #btn-binh-gioi-main
│   │   ├── #panel-quan-su-overlay
│   │   ├── #btn-nong-nghiep-main
│   │   ├── #panel-nong-nghiep-overlay
│   │   ├── #btn-upgrade-main
│   │   └── #panel-upgrade-overlay
│   │
│   └── <script src="script.js">
```

#### style.css (Sections)

```
style.css
├── PHẦN 1: Reset & Base Styles
│   ├── Box-sizing reset
│   ├── Body defaults
│   ├── .hidden class
│   ├── .screen structure
│   └── Typography & buttons
│
├── PHẦN 2: Menu Chính (HKDA)
│   ├── Scene wrapper
│   ├── Layers (sky, river, stakes)
│   ├── Hero area & silhouette
│   ├── Menu buttons
│   ├── Settings panel
│   ├── Custom cursor
│   └── Ember particles
│
├── PHẦN 3: Chế Độ Luyện Binh
│   ├── Training screen
│   ├── Quiz stats bar
│   ├── Quiz container
│   ├── Campaign cards
│   ├── Answer grid
│   └── Result screen
│
├── PHẦN 4: Gameplay Chính
│   ├── Hero selection
│   ├── Bio screen
│   ├── Map screen
│   ├── HUD elements
│   ├── Minimap
│   ├── Action buttons
│   ├── Logistics screen
│   └── Combat screen
│
├── PHẦN 5: Modals
│   ├── Modal base
│   ├── Shop modal
│   ├── Confirm modal
│   ├── Hero detail modal
│   └── Attack confirm
│
├── PHẦN 6: Bảo Tàng & Gacha
│   ├── Museum artifacts
│   ├── Gacha chest
│   └── Reward cards
│
├── PHẦN 7: Profile & Rank
│   ├── Profile layout
│   ├── Avatar frames
│   ├── Rank titles
│   ├── Merit bar
│   └── Radar chart
│
├── PHẦN 8: Thơ Thần Panel
│   ├── Floating button
│   ├── Aura effect
│   ├── Scroll panel
│   └── Poem items
│
└── PHẦN 9: System Panels
    ├── System buttons
    ├── Military panel
    ├── Agriculture panel
    └── Upgrade panel
```

#### script.js (Modules)

```
script.js
├── PHẦN 1: Biến Toàn Cục & Dữ Liệu
│   ├── Game state variables
│   ├── RESOURCES object
│   ├── HERO_DATA constant
│   ├── ENEMIES array
│   ├── COLLECTION_DATA
│   ├── QUIZ_DATA
│   ├── RANK_SYSTEM
│   └── Upgrade data
│
├── PHẦN 2: Utility Functions
│   ├── speak()
│   ├── playSfx()
│   └── toggleSettings()
│
├── PHẦN 3: Menu & Core Logic
│   ├── initMenu() IIFE
│   ├── Cursor tracking
│   ├── Ember particles
│   └── startGame()
│
├── PHẦN 4: Hero Selection
│   ├── selectHero()
│   ├── showHeroInfo()
│   ├── backToSelection()
│   └── confirmHeroSelection()
│
├── PHẦN 5: Map Logic
│   ├── gameLoop()
│   ├── Camera controls
│   ├── Pan & zoom handlers
│   ├── placeStronghold()
│   └── spawnEnemiesOnMap()
│
├── PHẦN 6: Unit Logic
│   ├── spawnUnitVisual()
│   ├── updateUnitVisual()
│   ├── runUnitAI()
│   └── checkCombatCollision()
│
├── PHẦN 7: Minimap
│   ├── Viewport calculation
│   ├── Click navigation
│   └── Base indicator
│
├── PHẦN 8: Combat System
│   ├── startCombatMode()
│   ├── exitCombatMode()
│   ├── enemyAI_Loop()
│   ├── performEnemyAttack()
│   ├── Direction detection
│   ├── Attack/block logic
│   └── showFloatingText()
│
├── PHẦN 9: Logistics & Economy
│   ├── enterLogistics()
│   ├── buyUnit()
│   ├── tradeRiceForGold()
│   ├── upgradeTech()
│   ├── performSabotage()
│   └── Auto production
│
├── PHẦN 10: Tactical Map
│   ├── Keyboard handler (M)
│   ├── Zoom controls
│   └── Attack order system
│
├── PHẦN 11: Quiz System
│   ├── startTraining()
│   ├── chooseCampaign()
│   ├── loadQuestion()
│   ├── checkAnswer()
│   └── endQuiz()
│
├── PHẦN 12: Collection
│   ├── openGeneralCollection()
│   ├── selectHeroForDisplay()
│   ├── viewHeroDetail()
│   └── toggleSkillDesc()
│
├── PHẦN 13: Museum & Gacha
│   ├── openMuseum()
│   ├── craftArtifact()
│   ├── openGachaModal()
│   └── runGacha()
│
├── PHẦN 14: Profile System
│   ├── getCurrentRank()
│   ├── openProfile()
│   ├── renderProfileData()
│   └── drawRadarChart()
│
├── PHẦN 15: Thơ Thần
│   ├── toggleThoThanPanel()
│   └── chonBaiTho()
│
├── PHẦN 16: System Panels
│   ├── Military functions
│   ├── Agriculture functions
│   └── Panel toggles
│
├── PHẦN 17: Upgrade UI
│   ├── openUpgradeUI()
│   ├── updateUpgradeUI()
│   ├── startHold()
│   ├── cancelHold()
│   └── completeUpgrade()
│
└── PHẦN 18: Initialization
    └── DOMContentLoaded handler
```

---

## 5. Hướng Dẫn Sử Dụng

### 5.1 Bắt Đầu Game

```
1. Mở game → Màn hình Menu chính
2. Click "XUẤT KÍCH" để bắt đầu
3. Chọn phe: Đại Việt hoặc Nguyên Mông
4. Xem thông tin tướng → Click "XUẤT BINH"
5. Click vào bản đồ để đặt thành trì
```

### 5.2 Điều Khiển

| Hành Động | Điều Khiển |
|-----------|------------|
| Di chuyển bản đồ | Kéo chuột |
| Zoom | Scroll chuột |
| Đặt thành trì | Click vào bản đồ |
| Di chuyển quân | Double-click vào vị trí |
| Tấn công địch | Click vào icon địch |
| Mở bản đồ chiến thuật | Phím M |
| Block trong combat | Di chuột về hướng tấn công |
| Attack trong combat | Click chuột trái |

### 5.3 Game Flow

```
┌─────────────┐
│  Menu       │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Chọn Phe    │────►│ Xem Tướng   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
                 ▼
┌────────────────────────────────────────────────┐
│                   BẢN ĐỒ CHÍNH                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Đặt     │  │ Tuyển   │  │ Đánh    │        │
│  │ Thành   │─►│ Quân    │─►│ Địch    │        │
│  └─────────┘  └─────────┘  └────┬────┘        │
│                                 │              │
│                                 ▼              │
│                          ┌─────────────┐       │
│                          │  COMBAT     │       │
│                          │  MODE       │       │
│                          └──────┬──────┘       │
│                                 │              │
│                                 ▼              │
│                          ┌─────────────┐       │
│                          │ Thắng/Thua  │       │
│                          └─────────────┘       │
└────────────────────────────────────────────────┘
```

### 5.4 Hệ Thống Tài Nguyên

| Tài Nguyên | Cách Kiếm | Công Dụng |
|------------|-----------|-----------|
| 🥩 **Lúa** | Nông dân sản xuất tự động | Đổi thành Vàng |
| 💰 **Vàng** | Đổi từ Lúa, thắng trận, quiz | Mua đơn vị, nâng cấp |
| ⚔️ **Quân** | Tuyển bằng Vàng | Chiến đấu |

### 5.5 Đơn Vị

| Đơn Vị | Giá | Đặc Điểm |
|--------|-----|----------|
| 👨‍🌾 **Nông Dân** | 50 Vàng | Sản xuất 10 Lúa/giây |
| 🛡️ **Bộ Binh** | 100 Vàng | Tốc độ: 0.04, Damage cơ bản |
| 🐎 **Kỵ Binh** | 250 Vàng | Tốc độ: 0.08, Damage cao |

### 5.6 Combat System

```
         ┌─────────────┐
         │    TOP      │  ← Di chuột lên trên
         │   (BLOCK)   │
         └─────────────┘
              ▲
              │
┌───────┐    │    ┌───────┐
│ LEFT  │◄───┼───►│ RIGHT │
│(BLOCK)│    │    │(BLOCK)│
└───────┘    │    └───────┘
         ▼
    ┌─────────┐
    │ PLAYER  │
    └─────────┘

RULES:
- Địch sẽ tấn công từ 1 trong 3 hướng
- Di chuột về hướng đó để BLOCK
- Click chuột để tấn công khi địch không đánh
- Tấn công thành công khi stance ≠ enemy stance
```

---

## 6. Kiến Trúc Kỹ Thuật

### 6.1 State Management

```javascript
// Centralized State
┌─────────────────────────────────────────────┐
│               GLOBAL STATE                   │
├─────────────────────────────────────────────┤
│ currentFaction: 'VIETNAM' | 'INVADER'       │
│ hasBuiltStronghold: boolean                  │
│ tempX, tempY: number (stronghold position)  │
├─────────────────────────────────────────────┤
│ RESOURCES: { food, gold, army }              │
│ myUnits: Array<Unit>                         │
│ RESEARCH_LEVELS: { MILITARY, WEAPON, ... }   │
├─────────────────────────────────────────────┤
│ inCombat: boolean                            │
│ playerHP, enemyHP: number                    │
│ currentStance, enemyStance: string           │
├─────────────────────────────────────────────┤
│ target: { x, y, scale } (camera target)     │
│ current: { x, y, scale } (camera current)   │
└─────────────────────────────────────────────┘
```

### 6.2 Event Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ Event Listener  │
│ (DOM Events)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Handler Function│
│ (Business Logic)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  State Update   │
│ (Modify globals)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   updateUI()    │
│ (Sync DOM)      │
└────────┬────────┘
         │
         ▼
    DOM Updated
```

### 6.3 Render Loop

```javascript
function gameLoop() {
    // 1. Lerp camera position
    current.x += (target.x - current.x) * 0.1;
    current.y += (target.y - current.y) * 0.1;
    current.scale += (target.scale - current.scale) * 0.1;
    
    // 2. Apply transform
    mapContainer.style.transform = 
        `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
    
    // 3. Run unit AI
    runUnitAI();
    
    // 4. Request next frame
    requestAnimationFrame(gameLoop);
}
```

### 6.4 Z-Index Architecture

```
Layer 99999: Profile Modal (top-most)
Layer 10002: Upgrade Overlay
Layer 10001: Agriculture Overlay
Layer 10000: Military Overlay
Layer 9999:  System Buttons (fixed)
Layer 5100:  Quiz Stats Bar
Layer 5000:  Training Screen
Layer 4000:  Collection Screen
Layer 3000:  Standard Modals
Layer 2500:  Tactical Map
Layer 1000:  Menu Wrapper
Layer 950:   Top Intro Bar
Layer 900:   UI HUD, Minimap
Layer 200:   Combat Screen
Layer 100:   Logistics Screen
Layer 50:    Map Elements (stronghold, enemies)
Layer 40:    Map Units
Layer 20:    Bio Screen
Layer 10:    Map Screen
Layer 1-5:   Background layers
```

---

## 7. API Reference

### 7.1 Core Functions

#### startGame()
```javascript
/**
 * Bắt đầu game, chuyển từ menu sang màn chọn tướng
 * @returns {void}
 * @triggers Screen transition, voice feedback
 */
function startGame() { ... }
```

#### selectHero(faction)
```javascript
/**
 * Chọn phe chơi
 * @param {string} faction - 'VIETNAM' hoặc 'INVADER'
 * @returns {void}
 */
function selectHero(faction) { ... }
```

#### placeStronghold()
```javascript
/**
 * Đặt thành trì tại vị trí đã chọn (tempX, tempY)
 * @requires tempX, tempY được set trước đó
 * @modifies hasBuiltStronghold, UI elements
 * @spawns Enemies on map
 */
function placeStronghold() { ... }
```

### 7.2 Unit Functions

#### buyUnit(type)
```javascript
/**
 * Mua đơn vị mới
 * @param {string} type - 'PEASANT' | 'INFANTRY' | 'CAVALRY'
 * @modifies RESOURCES.gold, myUnits array
 * @spawns Unit visual on map
 */
function buyUnit(type) { ... }
```

#### spawnUnitVisual(type)
```javascript
/**
 * Tạo visual element cho unit trên bản đồ
 * @param {string} type - Loại unit
 * @requires hasBuiltStronghold === true
 */
function spawnUnitVisual(type) { ... }
```

### 7.3 Combat Functions

#### startCombatMode(enemy)
```javascript
/**
 * Bắt đầu combat với enemy
 * @param {Object} enemy - Enemy object từ ENEMIES array
 * @param {number} enemy.hp - Current HP
 * @param {string} enemy.name - Display name
 */
function startCombatMode(enemy) { ... }
```

#### exitCombatMode()
```javascript
/**
 * Thoát combat, quay về map
 * @clears Combat timer
 * @resets inCombat state
 */
function exitCombatMode() { ... }
```

### 7.4 Economy Functions

#### tradeRiceForGold()
```javascript
/**
 * Đổi 100 Lúa thành Vàng
 * @rate 100 Lúa = 50 * (1 + FARMING_BONUS) Vàng
 * @requires RESOURCES.food >= 100
 */
function tradeRiceForGold() { ... }
```

#### upgradeTech(type)
```javascript
/**
 * Nâng cấp công nghệ
 * @param {string} type - 'MILITARY' | 'WEAPON' | 'FARMING'
 * @cost 500 * (currentLevel + 1) Vàng
 */
function upgradeTech(type) { ... }
```

### 7.5 UI Functions

#### updateUI()
```javascript
/**
 * Cập nhật toàn bộ UI elements
 * @updates Resource displays, unit counts, weapon durability
 * @should_call After any state change
 */
function updateUI() { ... }
```

#### speak(text)
```javascript
/**
 * Text-to-speech feedback
 * @param {string} text - Vietnamese text to speak
 * @uses Web Speech API
 * @lang vi-VN
 */
function speak(text) { ... }
```

### 7.6 Profile Functions

#### getCurrentRank(xp)
```javascript
/**
 * Tính toán rank hiện tại dựa trên XP
 * @param {number} xp - Current XP
 * @returns {Object} { current: RankObject, nextMax: number, prevMax: number }
 */
function getCurrentRank(xp) { ... }
```

#### drawRadarChart()
```javascript
/**
 * Vẽ biểu đồ radar năng lực
 * @uses Canvas 2D API
 * @data USER_PROFILE.stats
 */
function drawRadarChart() { ... }
```

---

## 8. Hệ Thống Game

### 8.1 Research System

```
MILITARY Research:
├── Level 0: Base stats
├── Level 1: +20% unit strength
├── Level 2: +40% unit strength
└── Level N: +N*20% unit strength

WEAPON Research:
├── Level 0: 100 durability
├── Level 1: +10% damage, 150 max durability
├── Level 2: +20% damage, 200 max durability
└── Level N: +N*10% damage

FARMING Research:
├── Level 0: 10 food/peasant/second
├── Level 1: +50% food production
├── Level 2: +100% food production
└── Level N: +N*50% production
```

### 8.2 Rank System

```
┌─────────────────┬──────────┬───────────────┐
│     Rank        │  Max XP  │    Frame      │
├─────────────────┼──────────┼───────────────┤
│ Lính Trơn       │     100  │ frame-wood    │
│ Lính Tinh Nhuệ  │     300  │ frame-wood    │
│ Ngũ Trưởng      │     600  │ frame-bronze  │
│ Bách Phu Trưởng │   1,000  │ frame-bronze  │
│ Hiệu Úy         │   2,000  │ frame-silver  │
│ Tướng Quân      │   4,000  │ frame-silver  │
│ Đô Đốc          │   8,000  │ frame-gold    │
│ Thừa Tướng      │  15,000  │ frame-gold    │
│ THẦN TƯỚNG     │ 999,999  │ frame-legend  │
└─────────────────┴──────────┴───────────────┘
```

### 8.3 Gacha System

```
Gacha Pool:
├── 40% - Mảnh Cọc Gỗ Bạch Đằng
├── 30% - Túi Vàng (+150 gold)
├── 20% - Mảnh Hịch Tướng Sĩ
└── 10% - Lính Mới (Infantry)

Cost: 100 Gold per pull
```

### 8.4 Quiz Rewards

```
Per Correct Answer:
└── +100 Gold

Campaign Completion:
└── Unlock next campaign (future feature)
```

### 8.5 Combat Formulas

```javascript
// Player Damage
damage = 50 * (1 + RESEARCH_LEVELS.WEAPON * 0.1);

// Unit Damage (auto-combat)
unitDamage = 10 * (1 + RESEARCH_LEVELS.MILITARY * 0.2);

// Enemy Attack
enemyDamage = 100; // Fixed

// Block Success
if (currentStance === attackDirection) {
    damage = 0; // Blocked
}
```

---

## 9. Customization Guide

### 9.1 Thêm Tướng Mới

```javascript
// 1. Thêm vào COLLECTION_DATA
const COLLECTION_DATA = [
    // ... existing heroes
    {
        id: 5,                          // Unique ID
        faction: 'vietnam',              // 'vietnam' | 'invader'
        name: "Trần Quốc Toản",         // Display name
        img: "hinh/tqt.png",            // Image path
        str: 80,                        // Strength (0-100)
        int: 75,                        // Intelligence (0-100)
        lead: 85,                       // Leadership (0-100)
        skill: "Phá Cường Địch",        // Skill name
        desc: "Tăng damage khi đánh boss" // Skill description
    }
];

// 2. Thêm image vào folder hinh/
// 3. (Optional) Thêm vào HERO_DATA nếu playable
```

### 9.2 Thêm Câu Hỏi Quiz

```javascript
const QUIZ_DATA = {
    'mongol': [
        // ... existing questions
        {
            q: "Câu hỏi mới?",
            a: ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
            c: 0  // Index của đáp án đúng (0-3)
        }
    ],
    
    // Thêm campaign mới
    'new_campaign': [
        { q: "...", a: [...], c: 0 }
    ]
};

// Thêm card trong HTML #quiz-start-screen
```

### 9.3 Thêm Loại Đơn Vị

```javascript
// 1. Định nghĩa trong code
const NEW_UNIT = {
    type: 'ELEPHANT',
    cost: 500,
    speed: 0.02,
    damage: 50,
    sprite: 'hinh/tuongbinh.png'
};

// 2. Cập nhật buyUnit()
function buyUnit(type) {
    let cost;
    switch(type) {
        case 'PEASANT': cost = 50; break;
        case 'INFANTRY': cost = 100; break;
        case 'CAVALRY': cost = 250; break;
        case 'ELEPHANT': cost = 500; break;  // New
    }
    // ...
}

// 3. Cập nhật spawnUnitVisual()
function spawnUnitVisual(type) {
    // ...
    if (type === 'ELEPHANT') {
        img.src = 'hinh/tuongbinh.png';
        img.classList.add('unit-elephant');
    }
}

// 4. Thêm CSS
.unit-elephant { width: 70px; }

// 5. Thêm button trong logistics HTML
```

### 9.4 Thay Đổi Bản Đồ

```javascript
// 1. Thay thế file hinh/bandol.svg

// 2. Cập nhật dimensions nếu khác
const MAP_WIDTH = 3000;  // Thay đổi nếu cần
const MAP_HEIGHT = 2000; // Thay đổi nếu cần

// 3. Cập nhật trong HTML
<img src="hinh/new-map.svg" id="game-map">
<img src="hinh/new-map.svg" id="minimap-img">
<img src="hinh/new-map.svg" id="tactical-map-img">
```

### 9.5 Thêm Thơ Thần

```html
<!-- Trong #panel-tho-than .scroll-body -->
<div class="poem-item" onclick="chonBaiTho('NEW_POEM')">
    <div class="poem-icon">🏯</div>
    <div class="poem-info">
        <div class="poem-name">Tên Bài Thơ</div>
        <div class="poem-author">Tác Giả - <span class="buff-tag">Buff Effect</span></div>
    </div>
</div>
```

```javascript
// Trong chonBaiTho()
case 'NEW_POEM':
    tenBai = "Tên Bài Thơ";
    loiThoai = "Trích dẫn thơ...";
    // Thêm buff logic nếu cần
    break;
```

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Game không load
```
Nguyên nhân: File path sai hoặc CORS
Giải pháp:
1. Kiểm tra Console (F12) để xem lỗi
2. Chạy qua local server thay vì file://
3. Kiểm tra tất cả paths trong src/href
```

#### Voice không hoạt động
```
Nguyên nhân: Browser không hỗ trợ hoặc chưa interact
Giải pháp:
1. User phải click gì đó trước khi voice hoạt động
2. Kiểm tra: 'speechSynthesis' in window
3. Thử browser khác (Chrome recommended)
```

#### Map không zoom được
```
Nguyên nhân: Event passive hoặc conflict
Giải pháp:
1. Kiểm tra { passive: false } trong wheel listener
2. Đảm bảo không có overlay che map
3. Check z-index của map-container
```

#### Combat không detect hướng
```
Nguyên nhân: Mouse position calculation sai
Giải pháp:
1. Kiểm tra window.innerWidth/Height
2. Đảm bảo combat screen đang active
3. Check inCombat === true
```

### 10.2 Debug Mode

```javascript
// Thêm vào đầu script.js để debug
const DEBUG = true;

function log(...args) {
    if (DEBUG) console.log('[GAME]', ...args);
}

// Sử dụng
log('Current faction:', currentFaction);
log('Resources:', RESOURCES);
```

### 10.3 Performance Issues

```javascript
// Nếu game lag, kiểm tra:

// 1. Số lượng unit
console.log('Total units:', myUnits.length);
// Giảm nếu > 100

// 2. Ember particles
// Giảm interval từ 150ms lên 300ms
setInterval(createEmber, 300);

// 3. Minimap update
// Giảm từ 16ms (60fps) xuống 32ms (30fps)
setInterval(() => { /* minimap */ }, 32);
```

### 10.4 Mobile Issues

```
Touch không hoạt động:
1. Kiểm tra ontouchstart/ontouchend handlers
2. Thêm touch-action: none; vào CSS
3. Kiểm tra viewport meta tag

UI bị cắt:
1. Kiểm tra overflow: hidden;
2. Sử dụng % thay vì px cho kích thước
3. Test với Chrome DevTools mobile mode
```

---

## 11. Changelog

### Version 1.0.0 (Initial Release)

```
[FEATURES]
+ Menu chính với hiệu ứng Bạch Đằng
+ Chọn phe Đại Việt / Nguyên Mông
+ Hệ thống bản đồ với pan/zoom
+ Đặt thành trì và spawn quân
+ Combat system direction-based
+ Logistics: tuyển quân, nghiên cứu
+ Quiz mode với 3 campaigns
+ Kho tướng với 4 tướng
+ Profile với radar chart
+ Gacha system
+ Bảo tàng cổ vật
+ Thơ Thần panel
+ System panels (Binh Giới, Nông Nghiệp, Upgrade)

[TECHNICAL]
+ Pure HTML/CSS/JS (no framework)
+ Responsive design (partial)
+ Web Speech API integration
+ Canvas radar chart
+ CSS animations
+ Smooth camera lerping
```

### Roadmap (Future)

```
Version 1.1:
- [ ] Save/Load game state (localStorage)
- [ ] Sound effects và background music
- [ ] Thêm tướng mới
- [ ] Campaign story mode

Version 1.2:
- [ ] Multiplayer (WebSocket)
- [ ] Leaderboard
- [ ] Achievement system
- [ ] Daily rewards

Version 2.0:
- [ ] 3D graphics (Three.js)
- [ ] Mobile app (Capacitor)
- [ ] More historical periods
```

---

## 12. Contributing

### 12.1 Code Style

```javascript
// Tuân theo conventions trong SYSTEM_INSTRUCTIONS.md
// Sử dụng camelCase cho functions/variables
// UPPER_SNAKE_CASE cho constants
// Thêm comments cho logic phức tạp
```

### 12.2 Pull Request Process

```
1. Fork repository
2. Tạo branch: feature/ten-tinh-nang
3. Commit với message rõ ràng
4. Test kỹ trước khi PR
5. Mô tả changes trong PR description
```

### 12.3 Bug Reports

```markdown
## Bug Description
[Mô tả bug]

## Steps to Reproduce
1. Step 1
2. Step 2
3. ...

## Expected Behavior
[Điều gì đáng ra phải xảy ra]

## Actual Behavior
[Điều gì thực sự xảy ra]

## Environment
- Browser: 
- OS:
- Screen size:

## Screenshots
[Nếu có]
```

---

## 13. License

```
MIT License

Copyright (c) 2024 [Your Name/Team]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Phụ Lục

### A. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| M | Toggle bản đồ chiến thuật |
| ESC | Đóng modal hiện tại (future) |
| Space | Pause game (future) |

### B. Credits

```
Game Design: [Team]
Programming: [Developers]
Art Assets: [Artists/Sources]
Historical Research: [Historians]
Voice: Web Speech API (Vietnamese)
```

### C. Tài Liệu Tham Khảo

- [Lịch sử Việt Nam thời Trần](https://vi.wikipedia.org/wiki/Nhà_Trần)
- [Trận Bạch Đằng 1288](https://vi.wikipedia.org/wiki/Trận_Bạch_Đằng_(1288))
- [Hịch Tướng Sĩ](https://vi.wikipedia.org/wiki/Hịch_tướng_sĩ)

### D. Liên Hệ

```
Email: [contact@example.com]
GitHub: [github.com/your-repo]
Discord: [discord.gg/your-server]
```

---

*Tài liệu được cập nhật lần cuối: 2024*

*Phiên bản tài liệu: 1.0*