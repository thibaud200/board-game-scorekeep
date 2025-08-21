/**
 * Fixtures pour les tests - Données BGG réalistes
 * 
 * Données de test basées sur de vrais jeux BoardGameGeek
 * pour assurer la cohérence des tests
 */

// Types BGG locaux pour éviter les imports circulaires
export interface BGGSearchResult {
  id: number
  name: string
  yearPublished?: number
  type: string
}

export interface BGGExpansion {
  id: number
  name: string
}

export interface BGGGameData {
  id: number
  name: string
  description: string
  image: string
  thumbnail: string
  minPlayers: number
  maxPlayers: number
  playingTime: number
  minPlayTime: number
  maxPlayTime: number
  minAge: number
  yearPublished: number
  categories: string[]
  mechanics: string[]
  expansions: BGGExpansion[]
  characters: string[]
  families: string[]
  rating: number
  complexity: number
}

export interface GameTemplate {
  name: string
  hasCharacters: boolean
  characters: string
  hasExtensions: boolean
  extensions: string
  supportsCooperative: boolean
  supportsCompetitive: boolean
  supportsCampaign: boolean
  defaultMode: 'cooperative' | 'competitive' | 'campaign'
}

// === FIXTURES BGG SEARCH RESULTS ===

export const mockGloomhavenSearchResults: BGGSearchResult[] = [
  {
    id: 174430,
    name: 'Gloomhaven',
    yearPublished: 2017,
    type: 'boardgame'
  },
  {
    id: 291457,
    name: 'Gloomhaven: Jaws of the Lion',
    yearPublished: 2020,
    type: 'boardgame'
  }
]

export const mockCatanSearchResults: BGGSearchResult[] = [
  {
    id: 13,
    name: 'Catan',
    yearPublished: 1995,
    type: 'boardgame'
  },
  {
    id: 278,
    name: 'Catan: 5-6 Player Extension',
    yearPublished: 1996,
    type: 'boardgameexpansion'
  }
]

export const mockPandemicSearchResults: BGGSearchResult[] = [
  {
    id: 30549,
    name: 'Pandemic',
    yearPublished: 2008,
    type: 'boardgame'
  },
  {
    id: 40849,
    name: 'Pandemic: On the Brink',
    yearPublished: 2009,
    type: 'boardgameexpansion'
  }
]

// === FIXTURES BGG GAME DETAILS ===

export const mockGloomhavenDetails: BGGGameData = {
  id: 174430,
  name: 'Gloomhaven',
  description: 'Gloomhaven is a game of Euro-inspired tactical combat in a persistent fantasy world. Players will take on the role of a wandering adventurer with their own special set of skills and their own reasons for traveling to this dark corner of the world.',
  image: 'https://cf.geekdo-images.com/original/img/lDN3Eqn7c6dWf_VzQz8Pl_xtPzM=/0x0/pic2437871.jpg',
  thumbnail: 'https://cf.geekdo-images.com/thumb/img/e7GyV6BdvdybVANYhNuDEZW5Z8s=/fit-in/200x150/pic2437871.jpg',
  minPlayers: 1,
  maxPlayers: 4,
  playingTime: 120,
  minPlayTime: 60,
  maxPlayTime: 150,
  minAge: 14,
  yearPublished: 2017,
  categories: ['Adventure', 'Exploration', 'Fantasy', 'Fighting', 'Miniatures'],
  mechanics: [
    'Action Point Allowance System',
    'Card Drafting', 
    'Cooperative Play',
    'Grid Movement',
    'Hand Management',
    'Modular Board',
    'Role Playing',
    'Simultaneous Action Selection',
    'Storytelling',
    'Variable Player Powers'
  ],
  expansions: [
    {
      id: 239220,
      name: 'Gloomhaven: Forgotten Circles'
    },
    {
      id: 291457,
      name: 'Gloomhaven: Jaws of the Lion'
    }
  ],
  characters: ['Brute', 'Cragheart', 'Mindthief', 'Scoundrel', 'Spellweaver', 'Tinkerer'],
  families: ['Campaign Games', 'Crowdfunding: Kickstarter', 'Legacy'],
  rating: 8.7,
  complexity: 3.86
}

export const mockCatanDetails: BGGGameData = {
  id: 13,
  name: 'Catan',
  description: 'In Catan, players try to be the dominant force on the island of Catan by building settlements, cities, and roads.',
  image: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__original/img/M_3Vv0jN5Ns9-0aVJsKQUcgDWCU=/0x0/pic2419375.jpg',
  thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8A9Gy0BTDZ46-ZP3b_lYzBx_KJI=/fit-in/200x150/pic2419375.jpg',
  minPlayers: 3,
  maxPlayers: 4,
  playingTime: 75,
  minPlayTime: 60,
  maxPlayTime: 90,
  minAge: 10,
  yearPublished: 1995,
  categories: ['Economic', 'Negotiation'],
  mechanics: ['Dice Rolling', 'Hand Management', 'Modular Board', 'Network and Route Building', 'Trading'],
  expansions: [
    {
      id: 278,
      name: 'Catan: 5-6 Player Extension'
    },
    {
      id: 926,
      name: 'Catan: Seafarers'
    }
  ],
  characters: [],
  families: ['Catan', 'Catan Universe'],
  rating: 7.2,
  complexity: 2.33
}

export const mockPandemicDetails: BGGGameData = {
  id: 30549,
  name: 'Pandemic',
  description: 'In Pandemic, several virulent diseases have broken out simultaneously all over the world! The players are disease-fighting specialists whose mission is to treat disease hotspots while researching cures for each of four plagues before they get out of hand.',
  image: 'https://cf.geekdo-images.com/cTrAWasNHyKMcNs8Zrv5O7sKS6M=/fit-in/246x300/pic1534148.jpg',
  thumbnail: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVqA__thumb/img/jYVVqr1-YPv_7A8Gr6P5_-jdVYM=/fit-in/200x150/pic1534148.jpg',
  minPlayers: 2,
  maxPlayers: 4,
  playingTime: 45,
  minPlayTime: 45,
  maxPlayTime: 45,
  minAge: 8,
  yearPublished: 2008,
  categories: ['Medical'],
  mechanics: ['Action Point Allowance System', 'Cooperative Play', 'Hand Management', 'Point to Point Movement', 'Set Collection', 'Trading', 'Variable Player Powers'],
  expansions: [
    {
      id: 40849,
      name: 'Pandemic: On the Brink'
    },
    {
      id: 137136,
      name: 'Pandemic: In the Lab'
    }
  ],
  characters: ['Contingency Planner', 'Dispatcher', 'Medic', 'Operations Expert', 'Quarantine Specialist', 'Researcher', 'Scientist'],
  families: ['Pandemic'],
  rating: 7.6,
  complexity: 2.4
}

// === FIXTURES GAME TEMPLATES ===

export const mockGloomhavenTemplate: GameTemplate = {
  name: 'Gloomhaven',
  hasCharacters: true,
  characters: 'Brute, Cragheart, Mindthief, Scoundrel, Spellweaver, Tinkerer',
  hasExtensions: true,
  extensions: 'Gloomhaven: Forgotten Circles, Gloomhaven: Jaws of the Lion',
  supportsCooperative: true,
  supportsCompetitive: false,
  supportsCampaign: true,
  defaultMode: 'campaign'
}

export const mockCatanTemplate: GameTemplate = {
  name: 'Catan',
  hasCharacters: false,
  characters: '',
  hasExtensions: true,
  extensions: 'Catan: 5-6 Player Extension, Catan: Seafarers',
  supportsCooperative: false,
  supportsCompetitive: true,
  supportsCampaign: false,
  defaultMode: 'competitive'
}

export const mockPandemicTemplate: GameTemplate = {
  name: 'Pandemic',
  hasCharacters: true,
  characters: 'Contingency Planner, Dispatcher, Medic, Operations Expert, Quarantine Specialist, Researcher, Scientist',
  hasExtensions: true,
  extensions: 'Pandemic: On the Brink, Pandemic: In the Lab',
  supportsCooperative: true,
  supportsCompetitive: false,
  supportsCampaign: false,
  defaultMode: 'cooperative'
}

// === FIXTURES ERROR SCENARIOS ===

export const mockEmptySearchResults: BGGSearchResult[] = []

export const mockBGGErrorResponse = {
  error: 'BGG API Error',
  message: 'Service temporarily unavailable'
}

export const mockNetworkError = new Error('Network request failed')

export const mockTimeoutError = new Error('Request timeout')

// === FIXTURES EDGE CASES ===

export const mockGameWithoutYear: BGGSearchResult = {
  id: 999999,
  name: 'Game Without Year',
  type: 'boardgame'
  // yearPublished intentionally omitted
}

export const mockGameWithMinimalData: BGGGameData = {
  id: 999999,
  name: 'Minimal Game',
  description: '',
  image: '',
  thumbnail: '',
  minPlayers: 2,
  maxPlayers: 4,
  playingTime: 30,
  minPlayTime: 30,
  maxPlayTime: 30,
  minAge: 10,
  yearPublished: 2023,
  categories: [],
  mechanics: [],
  expansions: [],
  characters: [],
  families: [],
  rating: 0,
  complexity: 0
}

export const mockGameWithSpecialCharacters: BGGGameData = {
  id: 888888,
  name: 'Game with "Special" & Characters',
  description: 'A game with special characters: áéíóú, àèìòù, äëïöü',
  image: '',
  thumbnail: '',
  minPlayers: 1,
  maxPlayers: 8,
  playingTime: 60,
  minPlayTime: 45,
  maxPlayTime: 90,
  minAge: 12,
  yearPublished: 2022,
  categories: ['Fantasy', 'Adventure'],
  mechanics: ['Storytelling'],
  expansions: [
    {
      id: 888889,
      name: 'Expansion with "Quotes" & Symbols'
    }
  ],
  characters: ['Hero "The Brave"', 'Villain & Dragons'],
  families: [],
  rating: 7.5,
  complexity: 2.8
}

// === HELPERS DE TEST ===

export const createMockGameTemplate = (overrides: Partial<GameTemplate> = {}): GameTemplate => ({
  name: 'Default Game',
  hasCharacters: false,
  characters: '',
  hasExtensions: false,
  extensions: '',
  supportsCooperative: false,
  supportsCompetitive: true,
  supportsCampaign: false,
  defaultMode: 'competitive',
  ...overrides
})

export const createMockBGGGameData = (overrides: Partial<BGGGameData> = {}): BGGGameData => ({
  id: 123456,
  name: 'Mock Game',
  description: 'A mock game for testing',
  image: 'https://example.com/image.jpg',
  thumbnail: 'https://example.com/thumb.jpg',
  minPlayers: 2,
  maxPlayers: 4,
  playingTime: 60,
  minPlayTime: 45,
  maxPlayTime: 75,
  minAge: 10,
  yearPublished: 2023,
  categories: ['Strategy'],
  mechanics: ['Hand Management'],
  expansions: [],
  characters: [],
  families: [],
  rating: 7.0,
  complexity: 2.5,
  ...overrides
})
