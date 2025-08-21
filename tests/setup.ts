/**
 * Configuration globale des tests
 * 
 * Setup des environnements de test, mocks globaux,
 * et configuration React Testing Library
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configuration React Testing Library
configure({ testIdAttribute: 'data-testid' })

// Mock des APIs externes
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: jest.fn()
})

// Mock de l'API BoardGameGeek
jest.mock('@/services/BGGService', () => ({
  bggService: {
    searchGames: jest.fn(),
    getGameDetails: jest.fn()
  }
}))

// Mock du context de base de données
jest.mock('@/lib/database-context', () => ({
  useDatabaseContext: jest.fn(() => ({
    templates: [],
    addTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn()
  }))
}))

// Suppression des warnings React 18
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks()
})
