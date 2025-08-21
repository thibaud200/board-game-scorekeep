/**
 * Mocks pour les tests - Services et API
 * 
 * Mocks réutilisables pour les tests unitaires et d'intégration
 */

// Types BGG locaux
interface BGGSearchResult {
  id: number
  name: string
  yearPublished?: number
  type: string
}

interface BGGGameData {
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
  expansions: Array<{ id: number; name: string }>
  characters: string[]
  families: string[]
  rating: number
  complexity: number
}

// === MOCK BGG SERVICE ===

export const createMockBGGService = () => ({
  searchGames: jest.fn<Promise<BGGSearchResult[]>, [string]>(),
  getGameDetails: jest.fn<Promise<BGGGameData>, [number]>(),
  getGameData: jest.fn<Promise<BGGGameData>, [number]>() // Ajout de la méthode manquante
})

// === MOCK DATABASE CONTEXT ===

export const createMockDatabaseContext = () => ({
  templates: [],
  players: [],
  sessions: [],
  addTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  addPlayer: jest.fn(),
  updatePlayer: jest.fn(),
  deletePlayer: jest.fn(),
  addSession: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  refreshData: jest.fn()
})

// === MOCK FETCH ===

export const createMockFetch = () => {
  const mockFetch = jest.fn()
  
  // Configuration par défaut
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/templates')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    }
    
    if (url.includes('/api/players')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    }
    
    if (url.includes('/api/sessions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    }
    
    // BGG Proxy routes
    if (url.includes('/api/bgg/search')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`<?xml version="1.0" encoding="utf-8"?>
          <items total="0" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
          </items>`)
      })
    }
    
    if (url.includes('/api/bgg/thing')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`<?xml version="1.0" encoding="utf-8"?>
          <items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
            <item type="boardgame" id="123">
              <name type="primary" value="Mock Game"/>
              <yearpublished value="2023"/>
              <minplayers value="2"/>
              <maxplayers value="4"/>
              <playingtime value="60"/>
            </item>
          </items>`)
      })
    }
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    })
  })
  
  return mockFetch
}

// === HELPERS DE SETUP ===

export const setupMockEnvironment = () => {
  // Mock global fetch
  Object.defineProperty(global, 'fetch', {
    writable: true,
    value: createMockFetch()
  })
  
  // Mock console methods pour éviter les logs pendant les tests
  const originalConsole = { ...console }
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
  
  return {
    restoreConsole: () => {
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
    }
  }
}

export const teardownMockEnvironment = () => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
}

// === MOCK DATA BUILDERS ===

export class MockDataBuilder {
  static bggSearchResult(overrides: Partial<BGGSearchResult> = {}): BGGSearchResult {
    return {
      id: 123456,
      name: 'Mock Game',
      yearPublished: 2023,
      type: 'boardgame',
      ...overrides
    }
  }
  
  static bggGameData(overrides: Partial<BGGGameData> = {}): BGGGameData {
    return {
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
    }
  }
  
  static gameTemplate(overrides: any = {}) {
    return {
      name: 'Mock Game',
      hasCharacters: false,
      characters: '',
      hasExtensions: false,
      extensions: '',
      supportsCooperative: false,
      supportsCompetitive: true,
      supportsCampaign: false,
      defaultMode: 'competitive',
      ...overrides
    }
  }
}

// === ASSERTIONS PERSONNALISÉES ===

export const customMatchers = {
  toHaveValidGameTemplate: (received: any) => {
    const required = ['name', 'hasCharacters', 'hasExtensions', 'supportsCooperative', 'supportsCompetitive', 'supportsCampaign', 'defaultMode']
    const missing = required.filter(field => !(field in received))
    
    if (missing.length > 0) {
      return {
        message: () => `Expected object to have required game template fields. Missing: ${missing.join(', ')}`,
        pass: false
      }
    }
    
    return {
      message: () => 'Expected object not to be a valid game template',
      pass: true
    }
  },
  
  toHaveValidBGGData: (received: any) => {
    const required = ['id', 'name', 'minPlayers', 'maxPlayers', 'playingTime']
    const missing = required.filter(field => !(field in received))
    
    if (missing.length > 0) {
      return {
        message: () => `Expected object to have required BGG data fields. Missing: ${missing.join(', ')}`,
        pass: false
      }
    }
    
    return {
      message: () => 'Expected object not to be valid BGG data',
      pass: true
    }
  }
}

// Étendre Jest avec les matchers personnalisés
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidGameTemplate(): R
      toHaveValidBGGData(): R
    }
  }
}
