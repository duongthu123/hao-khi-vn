/**
 * Hero data constants
 * Contains all Vietnamese and Mongol heroes with stats, abilities, and historical context
 */

import { Hero, HeroFaction, HeroRarity } from '@/types/hero';

/**
 * Vietnamese Heroes
 * Historical figures from the Trần Dynasty who defended Vietnam against Mongol invasions
 */

export const TRAN_HUNG_DAO: Hero = {
  id: 'hero-tran-hung-dao',
  name: 'Tran Hung Dao',
  nameVietnamese: 'Trần Hưng Đạo',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.LEGENDARY,
  stats: {
    attack: 95,
    defense: 90,
    speed: 85,
    leadership: 100,
    intelligence: 98,
  },
  abilities: [
    {
      id: 'ability-hich-tuong-si',
      name: 'Rally the Troops',
      nameVietnamese: 'Hịch Tướng Sĩ',
      description: 'Increases morale and speed of all allied units',
      descriptionVietnamese: 'Tăng sĩ khí và tốc độ toàn quân',
      cooldown: 60,
      cost: 100,
      effect: {
        type: 'buff',
        stat: 'speed',
        value: 20,
        duration: 30,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Supreme Commander of the Vietnamese forces during the Mongol invasions',
  descriptionVietnamese: 'Thống soái tối cao của quân đội Đại Việt trong các cuộc kháng chiến chống Mông Cổ',
  historicalContext: 'Prince Trần Quốc Tuấn (1228-1300), known as Trần Hưng Đạo, was the supreme commander who led Vietnam to victory against three Mongol invasions (1258, 1285, 1288). His military genius and the famous "Hịch tướng sĩ" proclamation inspired Vietnamese forces to defend their homeland.',
  historicalContextVietnamese: 'Hưng Đạo Vương Trần Quốc Tuấn (1228-1300) là vị thống soái tài ba đã lãnh đạo quân dân Đại Việt đánh thắng ba lần quân Mông Cổ xâm lược (1258, 1285, 1288). Bài "Hịch tướng sĩ" nổi tiếng của ông đã khơi dậy tinh thần yêu nước và ý chí chiến đấu của toàn quân toàn dân.',
  unlockCondition: {
    type: 'level',
    requirement: 1,
  },
};

export const YET_KIEU: Hero = {
  id: 'hero-yet-kieu',
  name: 'Yet Kieu',
  nameVietnamese: 'Yết Kiêu',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.EPIC,
  stats: {
    attack: 85,
    defense: 75,
    speed: 90,
    leadership: 80,
    intelligence: 70,
  },
  abilities: [
    {
      id: 'ability-thuy-quai',
      name: 'Water Monster',
      nameVietnamese: 'Thủy Quái',
      description: 'Expert in naval warfare, can sabotage enemy ships',
      descriptionVietnamese: 'Giỏi thủy chiến, đục thuyền địch',
      cooldown: 45,
      cost: 80,
      effect: {
        type: 'damage',
        value: 150,
        radius: 3,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Legendary naval commander known for underwater combat tactics',
  descriptionVietnamese: 'Danh tướng thủy quân nổi tiếng với chiến thuật đánh úp dưới nước',
  historicalContext: 'Yết Kiêu was a skilled naval warrior who fought in the Battle of Bạch Đằng River (1288). According to legend, he could swim underwater and drill holes in enemy ships, earning him the nickname "Water Monster".',
  historicalContextVietnamese: 'Yết Kiêu là một chiến sĩ thủy quân dũng cảm trong trận Bạch Đằng năm 1288. Theo truyền thuyết, ông có thể lặn dưới nước và đục thủng thuyền địch, được mệnh danh là "Thủy Quái".',
  unlockCondition: {
    type: 'level',
    requirement: 5,
  },
};

export const TRAN_QUOC_TOAN: Hero = {
  id: 'hero-tran-quoc-toan',
  name: 'Tran Quoc Toan',
  nameVietnamese: 'Trần Quốc Toản',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.EPIC,
  stats: {
    attack: 92,
    defense: 88,
    speed: 80,
    leadership: 90,
    intelligence: 85,
  },
  abilities: [
    {
      id: 'ability-chien-than',
      name: 'War God',
      nameVietnamese: 'Chiến Thần',
      description: 'Massive attack boost in critical situations',
      descriptionVietnamese: 'Tăng sức tấn công mạnh mẽ trong tình huống nguy cấp',
      cooldown: 90,
      cost: 120,
      effect: {
        type: 'buff',
        stat: 'attack',
        value: 50,
        duration: 20,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Fierce general known for his bravery and tactical brilliance',
  descriptionVietnamese: 'Danh tướng dũng mãnh nổi tiếng với lòng dũng cảm và tài năng chiến thuật',
  historicalContext: 'Prince Trần Quốc Toản (1267-1329) was one of the most valiant generals under Trần Hưng Đạo. He played crucial roles in the victories of 1285 and 1288, known for his fearless charges and strategic acumen.',
  historicalContextVietnamese: 'Chiêu Minh Vương Trần Quốc Toản (1267-1329) là một trong những danh tướng dũng cảm nhất dưới quyền Hưng Đạo Vương. Ông có vai trò quan trọng trong các chiến thắng năm 1285 và 1288, nổi tiếng với những đợt xung phong dũng mãnh.',
  unlockCondition: {
    type: 'achievement',
    requirement: 'win-10-battles',
  },
};

/**
 * Mongol Heroes
 * Historical commanders from the Mongol Empire who led invasions of Vietnam
 */

export const O_MA_NHI: Hero = {
  id: 'hero-o-ma-nhi',
  name: 'Uriyangkhadai',
  nameVietnamese: 'Ô Mã Nhi',
  faction: HeroFaction.MONGOL,
  rarity: HeroRarity.LEGENDARY,
  stats: {
    attack: 92,
    defense: 85,
    speed: 88,
    leadership: 85,
    intelligence: 80,
  },
  abilities: [
    {
      id: 'ability-van-ky',
      name: 'Ten Thousand Cavalry',
      nameVietnamese: 'Vạn Kỵ',
      description: 'Cavalry units become extremely powerful on land',
      descriptionVietnamese: 'Kỵ binh cực mạnh trên bộ',
      cooldown: 60,
      cost: 100,
      effect: {
        type: 'buff',
        stat: 'attack',
        value: 30,
        duration: 25,
      },
    },
  ],
  portrait: '/images/heroes/omn.png',
  description: 'Mongol general who led the first invasion of Vietnam in 1258',
  descriptionVietnamese: 'Tướng quân Mông Cổ chỉ huy cuộc xâm lược Đại Việt lần thứ nhất năm 1258',
  historicalContext: 'Uriyangkhadai (Ô Mã Nhi) was a Mongol general and son of Subutai. He led the first Mongol invasion of Vietnam in 1258 but was ultimately defeated by Vietnamese forces under the Trần Dynasty.',
  historicalContextVietnamese: 'Ô Mã Nhi là một tướng quân Mông Cổ, con trai của Tốc Bột Thai. Ông chỉ huy cuộc xâm lược Đại Việt lần thứ nhất năm 1258 nhưng cuối cùng bị quân Trần đánh bại.',
  unlockCondition: {
    type: 'level',
    requirement: 1,
  },
};

export const TOA_DO: Hero = {
  id: 'hero-toa-do',
  name: 'Toghan',
  nameVietnamese: 'Toa Đô',
  faction: HeroFaction.MONGOL,
  rarity: HeroRarity.EPIC,
  stats: {
    attack: 90,
    defense: 82,
    speed: 85,
    leadership: 80,
    intelligence: 75,
  },
  abilities: [
    {
      id: 'ability-cuong-no',
      name: 'Berserker Rage',
      nameVietnamese: 'Cuồng Nộ',
      description: 'Increases attack power when health is low',
      descriptionVietnamese: 'Tăng sức tấn công khi máu thấp',
      cooldown: 30,
      cost: 50,
      effect: {
        type: 'buff',
        stat: 'attack',
        value: 40,
        duration: 15,
      },
    },
  ],
  portrait: '/images/heroes/omn.png',
  description: 'Fierce Mongol commander known for aggressive tactics',
  descriptionVietnamese: 'Tướng quân Mông Cổ hung hãn nổi tiếng với chiến thuật tấn công mạnh mẽ',
  historicalContext: 'Toghan (Toa Đô) was a Mongol general who participated in the invasions of Vietnam. Known for his aggressive and relentless fighting style, he led several campaigns but was ultimately repelled by Vietnamese defenders.',
  historicalContextVietnamese: 'Toa Đô là một tướng quân Mông Cổ tham gia các cuộc xâm lược Đại Việt. Nổi tiếng với lối đánh hung hãn và không ngừng nghỉ, ông đã chỉ huy nhiều chiến dịch nhưng cuối cùng bị quân Đại Việt đánh lui.',
  unlockCondition: {
    type: 'level',
    requirement: 3,
  },
};

export const TRAN_BINH_TRONG: Hero = {
  id: 'hero-tran-binh-trong',
  name: 'Tran Binh Trong',
  nameVietnamese: 'Trần Bình Trọng',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.RARE,
  stats: {
    attack: 88,
    defense: 80,
    speed: 85,
    leadership: 85,
    intelligence: 90,
  },
  abilities: [
    {
      id: 'ability-bat-khuong',
      name: 'Unyielding Spirit',
      nameVietnamese: 'Bất Khuông',
      description: 'Increases defense and morale of nearby units',
      descriptionVietnamese: 'Tăng phòng thủ và tinh thần cho các đơn vị gần đó',
      cooldown: 50,
      cost: 70,
      effect: {
        type: 'buff',
        stat: 'defense',
        value: 25,
        duration: 30,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Young general famous for his unwavering loyalty and courage',
  descriptionVietnamese: 'Thiếu tướng trẻ tuổi nổi tiếng với lòng trung thành và dũng cảm kiên cường',
  historicalContext: 'Trần Bình Trọng (1259-1285) was a young general who fought bravely in the second Mongol invasion. Captured by the enemy, he famously declared "I would rather be a ghost of the South than a king of the North" before being executed at age 26.',
  historicalContextVietnamese: 'Trần Bình Trọng (1259-1285) là một thiếu tướng dũng cảm trong cuộc kháng chiến chống Mông Cổ lần thứ hai. Bị bắt làm tù binh, ông nói câu nói bất hủ "Thà làm quỷ nước Nam, còn hơn làm vương đất Bắc" trước khi hy sinh ở tuổi 26.',
  unlockCondition: {
    type: 'quest',
    requirement: 'complete-loyalty-quest',
  },
};

export const PHAM_NGU_LAO: Hero = {
  id: 'hero-pham-ngu-lao',
  name: 'Pham Ngu Lao',
  nameVietnamese: 'Phạm Ngũ Lão',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.RARE,
  stats: {
    attack: 87,
    defense: 85,
    speed: 82,
    leadership: 88,
    intelligence: 83,
  },
  abilities: [
    {
      id: 'ability-phuc-kich',
      name: 'Ambush Master',
      nameVietnamese: 'Phục Kích',
      description: 'Deals massive damage from hidden positions',
      descriptionVietnamese: 'Gây sát thương lớn từ vị trí ẩn náu',
      cooldown: 70,
      cost: 90,
      effect: {
        type: 'damage',
        value: 200,
        radius: 2,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Skilled tactician known for ambush strategies',
  descriptionVietnamese: 'Chiến lược gia tài ba nổi tiếng với chiến thuật phục kích',
  historicalContext: 'Phạm Ngũ Lão was a general under Trần Hưng Đạo who excelled in guerrilla warfare and ambush tactics. He played a key role in harassing Mongol supply lines and disrupting their formations.',
  historicalContextVietnamese: 'Phạm Ngũ Lão là một tướng quân dưới quyền Hưng Đạo Vương, xuất sắc trong chiến thuật du kích và phục kích. Ông có vai trò quan trọng trong việc quấy rối đường tiếp tế và phá vỡ đội hình quân Mông Cổ.',
  unlockCondition: {
    type: 'achievement',
    requirement: 'win-5-ambush-battles',
  },
};

export const SOGETU: Hero = {
  id: 'hero-sogetu',
  name: 'Sogetu',
  nameVietnamese: 'Toa Đô (Sơ Cách Đô)',
  faction: HeroFaction.MONGOL,
  rarity: HeroRarity.RARE,
  stats: {
    attack: 86,
    defense: 80,
    speed: 88,
    leadership: 82,
    intelligence: 78,
  },
  abilities: [
    {
      id: 'ability-thao-ma',
      name: 'Swift Cavalry',
      nameVietnamese: 'Thảo Mã',
      description: 'Increases cavalry speed and maneuverability',
      descriptionVietnamese: 'Tăng tốc độ và khả năng cơ động của kỵ binh',
      cooldown: 40,
      cost: 60,
      effect: {
        type: 'buff',
        stat: 'speed',
        value: 35,
        duration: 20,
      },
    },
  ],
  portrait: '/images/heroes/omn.png',
  description: 'Mongol cavalry commander known for rapid strikes',
  descriptionVietnamese: 'Chỉ huy kỵ binh Mông Cổ nổi tiếng với các đòn tấn công nhanh',
  historicalContext: 'Sogetu was a Mongol general who led cavalry units in the invasions of Vietnam. His forces were known for their speed and mobility, though they struggled in the difficult terrain and climate of Vietnam.',
  historicalContextVietnamese: 'Sơ Cách Đô là một tướng quân Mông Cổ chỉ huy các đơn vị kỵ binh trong các cuộc xâm lược Đại Việt. Quân của ông nổi tiếng về tốc độ và tính cơ động, nhưng gặp khó khăn với địa hình và khí hậu Việt Nam.',
  unlockCondition: {
    type: 'gacha',
    requirement: 'rare-pull',
  },
};

export const OMAR: Hero = {
  id: 'hero-omar',
  name: 'Omar',
  nameVietnamese: 'Ô Mã Nhi (Omar)',
  faction: HeroFaction.MONGOL,
  rarity: HeroRarity.RARE,
  stats: {
    attack: 84,
    defense: 78,
    speed: 86,
    leadership: 80,
    intelligence: 76,
  },
  abilities: [
    {
      id: 'ability-thiet-ky',
      name: 'Iron Cavalry',
      nameVietnamese: 'Thiết Kỵ',
      description: 'Heavily armored cavalry charge',
      descriptionVietnamese: 'Kỵ binh giáp nặng xung phong',
      cooldown: 55,
      cost: 75,
      effect: {
        type: 'damage',
        value: 180,
        radius: 2,
      },
    },
  ],
  portrait: '/images/heroes/omn.png',
  description: 'Mongol general specializing in heavy cavalry tactics',
  descriptionVietnamese: 'Tướng quân Mông Cổ chuyên về chiến thuật kỵ binh nặng',
  historicalContext: 'Omar was one of the Mongol commanders who participated in the later invasions of Vietnam. He commanded heavy cavalry units that were formidable on open plains but less effective in Vietnamese forests and rivers.',
  historicalContextVietnamese: 'Omar là một trong những chỉ huy Mông Cổ tham gia các cuộc xâm lược Đại Việt sau này. Ông chỉ huy các đơn vị kỵ binh nặng đáng gờm trên đồng bằng nhưng kém hiệu quả trong rừng rậm và sông nước Việt Nam.',
  unlockCondition: {
    type: 'level',
    requirement: 8,
  },
};

/**
 * Common Heroes
 * Regular soldiers and officers
 */

export const VIETNAMESE_SOLDIER: Hero = {
  id: 'hero-vietnamese-soldier',
  name: 'Vietnamese Soldier',
  nameVietnamese: 'Lính Đại Việt',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.COMMON,
  stats: {
    attack: 65,
    defense: 60,
    speed: 70,
    leadership: 55,
    intelligence: 50,
  },
  abilities: [
    {
      id: 'ability-chien-dau',
      name: 'Combat Training',
      nameVietnamese: 'Chiến Đấu',
      description: 'Basic combat skills',
      descriptionVietnamese: 'Kỹ năng chiến đấu cơ bản',
      cooldown: 30,
      cost: 30,
      effect: {
        type: 'buff',
        stat: 'attack',
        value: 10,
        duration: 15,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Brave soldier defending the homeland',
  descriptionVietnamese: 'Chiến sĩ dũng cảm bảo vệ quê hương',
  historicalContext: 'Common soldiers formed the backbone of the Vietnamese army, fighting with determination to defend their homeland against foreign invaders.',
  historicalContextVietnamese: 'Những người lính thường là xương sống của quân đội Đại Việt, chiến đấu với quyết tâm bảo vệ quê hương trước giặc ngoại xâm.',
  unlockCondition: {
    type: 'level',
    requirement: 1,
  },
};

export const MONGOL_WARRIOR: Hero = {
  id: 'hero-mongol-warrior',
  name: 'Mongol Warrior',
  nameVietnamese: 'Chiến Binh Mông Cổ',
  faction: HeroFaction.MONGOL,
  rarity: HeroRarity.COMMON,
  stats: {
    attack: 70,
    defense: 55,
    speed: 75,
    leadership: 50,
    intelligence: 45,
  },
  abilities: [
    {
      id: 'ability-ky-xa',
      name: 'Mounted Archery',
      nameVietnamese: 'Kỵ Xạ',
      description: 'Shoot arrows while riding',
      descriptionVietnamese: 'Bắn cung trên lưng ngựa',
      cooldown: 25,
      cost: 25,
      effect: {
        type: 'damage',
        value: 80,
        radius: 1,
      },
    },
  ],
  portrait: '/images/heroes/omn.png',
  description: 'Skilled horseman from the steppes',
  descriptionVietnamese: 'Kỵ binh thiện xạ từ thảo nguyên',
  historicalContext: 'Mongol warriors were renowned for their horsemanship and archery skills, forming the core of the Mongol military might.',
  historicalContextVietnamese: 'Chiến binh Mông Cổ nổi tiếng với kỹ năng cưỡi ngựa và bắn cung, là lực lượng chủ lực của quân đội Mông Cổ.',
  unlockCondition: {
    type: 'level',
    requirement: 1,
  },
};

export const VILLAGE_MILITIA: Hero = {
  id: 'hero-village-militia',
  name: 'Village Militia',
  nameVietnamese: 'Dân Binh',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.COMMON,
  stats: {
    attack: 60,
    defense: 65,
    speed: 65,
    leadership: 60,
    intelligence: 55,
  },
  abilities: [
    {
      id: 'ability-bao-ve',
      name: 'Defend Home',
      nameVietnamese: 'Bảo Vệ',
      description: 'Increased defense when protecting territory',
      descriptionVietnamese: 'Tăng phòng thủ khi bảo vệ lãnh thổ',
      cooldown: 35,
      cost: 35,
      effect: {
        type: 'buff',
        stat: 'defense',
        value: 15,
        duration: 20,
      },
    },
  ],
  portrait: '/images/heroes/thd.png',
  description: 'Local militia defending their village',
  descriptionVietnamese: 'Dân binh địa phương bảo vệ làng mạc',
  historicalContext: 'Village militias played a crucial role in Vietnamese resistance, using their knowledge of local terrain to harass and ambush invaders.',
  historicalContextVietnamese: 'Dân binh làng xã đóng vai trò quan trọng trong kháng chiến, sử dụng hiểu biết về địa hình để quấy rối và phục kích quân xâm lược.',
  unlockCondition: {
    type: 'level',
    requirement: 1,
  },
};

/**
 * Hero Collections
 */

export const VIETNAMESE_HEROES: Hero[] = [
  TRAN_HUNG_DAO,
  YET_KIEU,
  TRAN_QUOC_TOAN,
  TRAN_BINH_TRONG,
  PHAM_NGU_LAO,
  VIETNAMESE_SOLDIER,
  VILLAGE_MILITIA,
];

export const MONGOL_HEROES: Hero[] = [
  O_MA_NHI,
  TOA_DO,
  SOGETU,
  OMAR,
  MONGOL_WARRIOR,
];

export const ALL_HEROES: Hero[] = [
  ...VIETNAMESE_HEROES,
  ...MONGOL_HEROES,
];

/**
 * Hero lookup by ID
 */
export const HEROES_BY_ID: Record<string, Hero> = ALL_HEROES.reduce(
  (acc, hero) => {
    acc[hero.id] = hero;
    return acc;
  },
  {} as Record<string, Hero>
);

/**
 * Hero lookup by faction
 */
export const HEROES_BY_FACTION: Record<HeroFaction, Hero[]> = {
  [HeroFaction.VIETNAMESE]: VIETNAMESE_HEROES,
  [HeroFaction.MONGOL]: MONGOL_HEROES,
};

/**
 * Hero lookup by rarity
 */
export const HEROES_BY_RARITY: Record<HeroRarity, Hero[]> = {
  [HeroRarity.LEGENDARY]: ALL_HEROES.filter(h => h.rarity === HeroRarity.LEGENDARY),
  [HeroRarity.EPIC]: ALL_HEROES.filter(h => h.rarity === HeroRarity.EPIC),
  [HeroRarity.RARE]: ALL_HEROES.filter(h => h.rarity === HeroRarity.RARE),
  [HeroRarity.COMMON]: ALL_HEROES.filter(h => h.rarity === HeroRarity.COMMON),
};

/**
 * Get hero by ID
 */
export function getHeroById(id: string): Hero | undefined {
  return HEROES_BY_ID[id];
}

/**
 * Get heroes by faction
 */
export function getHeroesByFaction(faction: HeroFaction): Hero[] {
  return HEROES_BY_FACTION[faction] || [];
}

/**
 * Get heroes by rarity
 */
export function getHeroesByRarity(rarity: HeroRarity): Hero[] {
  return HEROES_BY_RARITY[rarity] || [];
}

/**
 * Get unlocked heroes based on player progress
 */
export function getUnlockedHeroes(
  playerLevel: number,
  achievements: string[],
  completedQuests: string[]
): Hero[] {
  return ALL_HEROES.filter(hero => {
    if (!hero.unlockCondition) return true;

    switch (hero.unlockCondition.type) {
      case 'level':
        return playerLevel >= (hero.unlockCondition.requirement as number);
      case 'achievement':
        return achievements.includes(hero.unlockCondition.requirement as string);
      case 'quest':
        return completedQuests.includes(hero.unlockCondition.requirement as string);
      case 'gacha':
        // Gacha heroes are unlocked through the gacha system
        return false;
      default:
        return true;
    }
  });
}
