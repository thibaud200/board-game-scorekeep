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
 * - S'assurer que l'App se rend correctement en environnement de test
 * 
 * Tests des flux utilisateur complets :
 * - Recherche BGG → Sélection → Import → Sauvegarde
 * - Intégration entre composants
 * - Workflow de bout en bout
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App' // Chemin relatif
import { bggService } from '../../src/services/BGGService' // Chemin relatif

// Mock du service BGG avec données réalistes
jest.mock('../../src/services/BGGService', () => ({
  bggService: {
    searchGames: jest.fn(),
    getGameData: jest.fn()
  }
}))
const mockBggService = bggService as jest.Mocked<typeof bggService>

// Mock du contexte database 
jest.mock('../../src/lib/database-context', () => ({
  DatabaseProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useDatabase: () => ({
    db: null,
    isLoading: false,
    error: null
  })
}))

// Mock des hooks database
jest.mock('../../src/lib/database-hooks', () => ({
  usePlayers: () => ({ players: [], addPlayer: jest.fn(), updatePlayer: jest.fn(), deletePlayer: jest.fn() }),
  useGameHistory: () => ({ sessions: [], addSession: jest.fn() }),
  useGameTemplates: () => ({ templates: [], addTemplate: jest.fn(), updateTemplate: jest.fn(), deleteTemplate: jest.fn() }),
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
    
    // Mock des appels API serveur
    mockFetch.mockImplementation((url) => {
      const urlString = url.toString()
      
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

      // Act - Étape 1: Navigation vers Game Templates
      await waitFor(() => {
        expect(screen.getByText(/game templates/i)).toBeInTheDocument()
      })

      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      // Act - Étape 2: Ouverture du dialog d'ajout
      await waitFor(() => {
        expect(screen.getByText(/add template/i)).toBeInTheDocument()
      })

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      // Act - Étape 3: Recherche BGG
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search boardgamegeek/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
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
        expect(screen.getByText(/import this game/i)).toBeInTheDocument()
      })

      const importButton = screen.getByText(/import this game/i)
      await user.click(importButton)

      // Act - Étape 6: Vérification des données importées
      await waitFor(() => {
        expect(screen.getByDisplayValue('Gloomhaven')).toBeInTheDocument()
        expect(screen.getByDisplayValue(/brute, cragheart/i)).toBeInTheDocument()
        expect(screen.getByDisplayValue(/forgotten circles/i)).toBeInTheDocument()
      })

      // Vérifier que le mode coopératif est détecté
      const cooperativeCheckbox = screen.getByLabelText(/cooperative/i) as HTMLInputElement
      expect(cooperativeCheckbox.checked).toBe(true)

      // Act - Étape 7: Sauvegarde du template
      const saveButton = screen.getByText(/save/i)
      await user.click(saveButton)

      // Assert - Vérifier l'appel de sauvegarde
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/templates'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('Gloomhaven')
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
      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
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
      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      const importButton = screen.getByText(/import this game/i)
      await user.click(importButton)

      // Assert - Mode coopératif détecté
      await waitFor(() => {
        const cooperativeCheckbox = screen.getByLabelText(/cooperative/i) as HTMLInputElement
        expect(cooperativeCheckbox.checked).toBe(true)
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
      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
      await user.type(searchInput, 'Catan')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument() // Mock retourne toujours Gloomhaven
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/import this game/i)
      await user.click(importButton)

      // Assert - Mode compétitif détecté
      await waitFor(() => {
        const competitiveCheckbox = screen.getByLabelText(/competitive/i) as HTMLInputElement
        expect(competitiveCheckbox.checked).toBe(true)
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
      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
      await user.type(searchInput, 'Test Game')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/import this game/i)
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
      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
      await user.type(searchInput, 'Test Game')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/import this game/i)
      await user.click(importButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByDisplayValue(/first expansion, second expansion, third expansion/i)).toBeInTheDocument()
      })
    })
  })

  describe('Persistence et État', () => {
    it('should maintain form state during BGG interactions', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<App />)

      // Act - Remplir d'abord manuellement
      const gameTemplatesSection = screen.getByText(/game templates/i)
      await user.click(gameTemplatesSection)

      const addTemplateButton = screen.getByText(/add template/i)
      await user.click(addTemplateButton)

      const competitiveCheckbox = screen.getByLabelText(/competitive/i)
      await user.click(competitiveCheckbox)

      // Puis utiliser BGG
      const searchInput = screen.getByPlaceholderText(/search boardgamegeek/i)
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const result = screen.getByText('Gloomhaven')
      await user.click(result)

      const importButton = screen.getByText(/import this game/i)
      await user.click(importButton)

      // Assert - Les sélections manuelles sont préservées ou écrasées intelligemment
      await waitFor(() => {
        const cooperativeCheckbox = screen.getByLabelText(/cooperative/i) as HTMLInputElement
        const competitiveCheckboxAfter = screen.getByLabelText(/competitive/i) as HTMLInputElement
        
        // BGG devrait détecter le mode coopératif pour Gloomhaven
        expect(cooperativeCheckbox.checked).toBe(true)
        // Mais garder aussi le compétitif si compatible
        expect(competitiveCheckboxAfter.checked).toBe(true) // Si le jeu supporte les deux
      })
    })
  })
})
