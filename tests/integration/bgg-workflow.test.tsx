/**
 * Tests d'intégration - Workflow complet BGG
 * 
 * FIXME: Ces tests échouent actuellement avec l'erreur "Objects are not valid as a React child".
 * Le problème semble lié aux mocks lucide-react qui ne sont pas correctement configurés
 * pour les tests d'intégration qui rendent l'App complète.
 * 
 * TODO: 
 * - Corriger les mocks lucide-react pour les tests d'intégration
 * - Vérifier que tous les composants UI shadcn sont correctement mockés
 * -       const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      // Wait for BGGGameSearch component to appear
      const searchInput = await screen.findByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Test Game')

      await waitFor(() => {er que l'App se rend correctement en environnement de test
 * 
 * Tests des flux utilisateur complets :
 * - Recherche BGG → Sélection → Import → Sauvegarde
 * - Intégration entre composants
 * - Workflow de bout en bout
 */

import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../frontend/src/App' // Chemin relatif
import { bggService } from '../../frontend/src/services/BGGService' // Chemin relatif

// Mock window.matchMedia pour les tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

// Mock du service BGG avec données réalistes
jest.mock('../../src/services/BGGService', () => ({
  bggService: {
    searchGames: jest.fn(),
    getGameData: jest.fn()
  }
}))
const mockBggService = bggService as jest.Mocked<typeof bggService>

// Mock database object
const mockDb = {
  addGameTemplate: jest.fn(),
  updateGameTemplate: jest.fn(),
  deleteGameTemplate: jest.fn(),
  getGameTemplates: jest.fn(),
  addPlayer: jest.fn(),
  updatePlayer: jest.fn(),
  deletePlayer: jest.fn(),
  getPlayers: jest.fn(),
  addGameSession: jest.fn(),
  getGameHistory: jest.fn(),
  setCurrentGame: jest.fn(),
  getCurrentGame: jest.fn(),
  finishGame: jest.fn()
}

// Mock du contexte database 
jest.mock('../../src/lib/database-context', () => ({
  DatabaseProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDatabase: () => ({
    db: mockDb,
    isLoading: false,
    error: null
  })
}))

// Mock des hooks database
jest.mock('../../src/lib/database-hooks', () => ({
  usePlayers: () => ({ players: [], addPlayer: jest.fn(), updatePlayer: jest.fn(), deletePlayer: jest.fn() }),
  useGameHistory: () => ({ gameHistory: [], addGameSession: jest.fn(), refreshGameHistory: jest.fn() }),
  useGameTemplates: () => ({ gameTemplates: [], addTemplate: jest.fn(), updateTemplate: jest.fn(), deleteTemplate: jest.fn() }),
  useCurrentGame: () => ({ currentGame: null, setCurrentGame: jest.fn(), finishGame: jest.fn() })
}))

// Mock de fetch pour les appels API serveur
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Données de test réalistes
const mockGloomhavenSearch = [
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

const mockGloomhavenDetails = {
  id: 174430,
  name: 'Gloomhaven',
  description: 'Gloomhaven is a game of Euro-inspired tactical combat in a persistent fantasy world.',
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
  mechanics: ['Action Point Allowance System', 'Card Drafting', 'Cooperative Play', 'Grid Movement', 'Hand Management', 'Modular Board', 'Role Playing', 'Simultaneous Action Selection', 'Storytelling', 'Variable Player Powers'],
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

describe('BGG Integration - Tests d\'Intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset du mock database
    mockDb.addGameTemplate.mockClear()
    mockDb.updateGameTemplate.mockClear()
    mockDb.deleteGameTemplate.mockClear()
    
    // Mock des appels API serveur
    mockFetch.mockImplementation((url) => {
      const urlString = url.toString()
      // Ajout d'un log pour vérifier que l'API est toujours appelée
      // eslint-disable-next-line no-console
      console.log('API call:', urlString)
      if (urlString.includes('/api/templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        } as Response)
      }
      if (urlString.includes('/api/players')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        } as Response)
      }
      if (urlString.includes('/api/sessions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response)
    })

    // Mock du service BGG
    mockBggService.searchGames.mockResolvedValue(mockGloomhavenSearch)
    mockBggService.getGameData.mockResolvedValue(mockGloomhavenDetails)
  })

  describe('Workflow Complet : Recherche → Import → Sauvegarde', () => {
    it('should complete full BGG import workflow', async () => {
      // Arrange
      const user = userEvent.setup()
      
      // Mock de la sauvegarde de template
      mockFetch.mockImplementationOnce((url) => {
        if (url.toString().includes('/api/templates') && url.toString().includes('POST')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          } as Response)
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        } as Response)
      })

      render(<App />)

      // Wait for the app to fully load and the dashboard to be rendered
      await waitFor(() => {
        expect(screen.getByText(/Game Templates/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      // Act - Étape 1: Navigation vers Game Templates
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('div[class*="cursor-pointer"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card with cursor-pointer')
      }
      await user.click(gameTemplatesCard)

      // Wait for navigation to complete and GameTemplateSection to render
      await waitFor(() => {
        expect(screen.getByText(/add template/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      // Act - Étape 2: Ouverture du dialog d'ajout
      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      // Wait for the dialog to open and show BGG search
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/rechercher un jeu sur boardgamegeek/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      const searchInput = screen.getByPlaceholderText(/rechercher un jeu sur boardgamegeek/i)
      await user.type(searchInput, 'Gloomhaven')

      // Attendre les résultats de recherche
      await waitFor(() => {
        expect(mockBggService.searchGames).toHaveBeenCalledWith('Gloomhaven')
      }, { timeout: 2000 })

      // Act - Étape 4: Sélection du jeu
      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      // Attendre les détails du jeu
      await waitFor(() => {
        expect(mockBggService.getGameData).toHaveBeenCalledWith(174430)
      })

      // Act - Étape 5: Import des données
      await waitFor(() => {
        expect(screen.getByText(/importer depuis bgg/i)).toBeInTheDocument()
      })

      const importButton = screen.getByText(/importer depuis bgg/i)
      await user.click(importButton)

      // Act - Étape 6: Vérification des données importées
      await waitFor(() => {
        expect(screen.getByDisplayValue('Gloomhaven')).toBeInTheDocument()
        expect(screen.getByDisplayValue(/brute, cragheart/i)).toBeInTheDocument()
        expect(screen.getByDisplayValue(/forgotten circles/i)).toBeInTheDocument()
      })

      // Vérifier que le mode coopératif est détecté
      const cooperativeCheckbox = screen.getByRole('checkbox', { name: /cooperative/i })
      expect(cooperativeCheckbox).toHaveAttribute('data-state', 'checked')

      // Act - Étape 7: Sauvegarde du template
      // Try different approaches to find and click the save button
      await waitFor(async () => {
        // Look for a button that contains "Add Template" text and is not disabled
        const allButtons = screen.getAllByRole('button')
        
        // First try: find by text content
        let saveButton = allButtons.find(btn => 
          btn.textContent?.toLowerCase().includes('add template') && 
          !btn.hasAttribute('disabled') &&
          !btn.hasAttribute('aria-disabled')
        )
        
        // If not found, try finding by form submission button
        if (!saveButton) {
          saveButton = screen.getByRole('button', { name: /add.*template/i })
        }
        
        expect(saveButton).toBeDefined()
        
        // Try clicking with force if pointer events are disabled
        try {
          await user.click(saveButton!)
        } catch (error) {
          // If click fails due to pointer events, try triggering the form submission directly
          const form = saveButton!.closest('form')
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
            form.dispatchEvent(submitEvent)
          } else {
            // Last resort: programmatically click
            saveButton!.click()
          }
        }
      })

      // Assert - Vérifier l'appel de sauvegarde à la base de données
      await waitFor(() => {
        expect(mockDb.addGameTemplate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Gloomhaven',
            hasCharacters: true,
            characters: expect.arrayContaining(['Brute', 'Cragheart', 'Mindthief', 'Scoundrel', 'Spellweaver', 'Tinkerer']),
            hasExtensions: true,
            extensions: expect.arrayContaining(['Gloomhaven: Forgotten Circles', 'Gloomhaven: Jaws of the Lion']),
            supportsCooperative: true,
            supportsCompetitive: true, // Auto-détecté comme true
            supportsCampaign: false,   // Auto-détecté comme false
            defaultMode: 'cooperative'
          })
        )
      })
    }, 10000) // Timeout étendu pour le workflow complet

    it('should handle BGG API errors gracefully in full workflow', async () => {
      // Arrange
      const user = userEvent.setup()
      mockBggService.searchGames.mockRejectedValue(new Error('BGG API Error'))

      render(<App />)

      // Act
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card')
      }
      await user.click(gameTemplatesCard)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Gloomhaven')

      // Assert - L'application devrait continuer de fonctionner
      await waitFor(() => {
        expect(searchInput).toBeInTheDocument()
        // Pas de crash, l'utilisateur peut continuer manuellement
      }, { timeout: 2000 })
    })
  })

  describe('Analyse Intelligente des Modes', () => {
    it('should correctly detect cooperative mode from BGG mechanics', async () => {
      // Arrange
      const cooperativeGameData = {
        ...mockGloomhavenDetails,
        mechanics: ['Cooperative Play', 'Hand Management'],
        categories: ['Adventure', 'Cooperative']
      }
      mockBggService.getGameData.mockResolvedValue(cooperativeGameData)

      const user = userEvent.setup()
      render(<App />)

      // Act - Workflow jusqu'à l'import
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card')
      }
      await user.click(gameTemplatesCard)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      // Wait for BGGGameSearch component to appear
      const searchInput = await screen.findByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      const importButton = screen.getByText(/Importer depuis BGG/i)
      await user.click(importButton)

      // Assert - Mode coopératif détecté
      await waitFor(() => {
        const cooperativeCheckbox = screen.getByRole('checkbox', { name: /cooperative/i })
        expect(cooperativeCheckbox).toHaveAttribute('data-state', 'checked')
      })
    })

    it('should correctly detect competitive mode for strategy games', async () => {
      // Arrange
      const competitiveGameData = {
        ...mockGloomhavenDetails,
        name: 'Catan',
        mechanics: ['Dice Rolling', 'Trading'],
        categories: ['Strategy'],
        maxPlayers: 4
      }
      mockBggService.getGameData.mockResolvedValue(competitiveGameData)

      const user = userEvent.setup()
      render(<App />)

      // Act
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card')
      }
      await user.click(gameTemplatesCard)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      // Wait for BGGGameSearch component to appear
      const searchInput = await screen.findByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Catan')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument() // Mock retourne toujours Gloomhaven
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/Importer depuis BGG/i)
      await user.click(importButton)

      // Assert - Mode compétitif détecté
      await waitFor(() => {
        const competitiveCheckbox = screen.getByRole('checkbox', { name: /competitive/i })
        expect(competitiveCheckbox).toHaveAttribute('data-state', 'checked')
      })
    })
  })

  describe('Extraction de Données BGG', () => {
    it('should extract characters from BGG data correctly', async () => {
      // Arrange
      const gameWithCharacters = {
        ...mockGloomhavenDetails,
        characters: ['Hero', 'Villain', 'Wizard', 'Warrior']
      }
      mockBggService.getGameData.mockResolvedValue(gameWithCharacters)

      const user = userEvent.setup()
      render(<App />)

      // Act
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card')
      }
      await user.click(gameTemplatesCard)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Test Game')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/Importer depuis BGG/i)
      await user.click(importButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByDisplayValue(/hero, villain, wizard, warrior/i)).toBeInTheDocument()
      })
    })

    it('should extract extensions from BGG expansions', async () => {
      // Arrange
      const gameWithExpansions = {
        ...mockGloomhavenDetails,
        expansions: [
          { id: 1, name: 'First Expansion' },
          { id: 2, name: 'Second Expansion' },
          { id: 3, name: 'Third Expansion' }
        ]
      }
      mockBggService.getGameData.mockResolvedValue(gameWithExpansions)

      const user = userEvent.setup()
      render(<App />)

      // Act
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card')
      }
      await user.click(gameTemplatesCard)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      // Wait for BGGGameSearch component to appear
      const searchInput = await screen.findByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Test Game')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/Importer depuis BGG/i)
      await user.click(importButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByDisplayValue(/first expansion, second expansion, third expansion/i)).toBeInTheDocument()
      })
    })
  })

  describe('Persistence et État', () => {
    it('should fallback to localStorage if API fails', async () => {
      // Arrange
      // Simule une erreur API
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        clone: () => undefined,
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
        json: async () => ({}),
        text: async () => '',
      } as unknown as Response))
      // Mock localStorage
      const localPlayers = [{ id: 1, name: 'OfflinePlayer' }]
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
        if (key === 'players') return JSON.stringify(localPlayers)
        return null
      })
      // Mock du contexte database pour simuler une erreur sur getPlayers
      jest.mock('../../src/lib/database-context', () => ({
        DatabaseProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useDatabase: () => ({
          db: {
            getPlayers: jest.fn().mockRejectedValue(new Error('API fail')),
            addPlayer: jest.fn(),
            updatePlayer: jest.fn(),
            deletePlayer: jest.fn()
          },
          isLoading: false,
          error: null
        })
      }))
      const user = userEvent.setup()
      render(<App />)
      // Act
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) throw new Error('Could not find Game Templates card')
      await user.click(gameTemplatesCard)
      // Assert - Vérifie que les données locales sont utilisées
      await waitFor(() => {
        expect(screen.getByText('OfflinePlayer')).toBeInTheDocument()
      })
      // Nettoyage du mock
      jest.restoreAllMocks()
    })
    it('should maintain form state during BGG interactions', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<App />)

      // Act - Remplir d'abord manuellement
      const gameTemplatesElement = screen.getByText(/Game Templates/i)
      const gameTemplatesCard = gameTemplatesElement.closest('[data-slot="card"]')
      if (!gameTemplatesCard) {
        throw new Error('Could not find Game Templates card')
      }
      await user.click(gameTemplatesCard)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const competitiveCheckbox = screen.getByLabelText(/competitive/i)
      await user.click(competitiveCheckbox)

      // Puis utiliser BGG
      const searchInput = await screen.findByPlaceholderText(/Rechercher un jeu sur BoardGameGeek/i)
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/Importer depuis BGG/i)
      await user.click(importButton)

      // Assert - Les sélections manuelles sont préservées ou écrasées intelligemment
      await waitFor(() => {
        const cooperativeCheckbox = screen.getByRole('checkbox', { name: /cooperative/i })
        const competitiveCheckboxAfter = screen.getByRole('checkbox', { name: /competitive/i })
        
        // BGG devrait détecter le mode coopératif pour Gloomhaven
        expect(cooperativeCheckbox).toHaveAttribute('data-state', 'checked')
        // Mais garder aussi le compétitif si compatible
        expect(competitiveCheckboxAfter).toHaveAttribute('data-state', 'checked') // Si le jeu supporte les deux
      })
    })
  })
})
