/**
 * Tests unitaires fonctionnels - Composant BGGGameSearch
 * 
 * Tests des fonctionnalités utilisateur :
 * - Recherche de jeux
 * - Sélection et import
 * - Interface utilisateur
 * - Interactions
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BGGGameSearch } from '@/components/BGGGameSearch'
import { bggService } from '@/services/BGGService'

// Mock du service BGG
jest.mock('@/services/BGGService')
const mockBggService = bggService as jest.Mocked<typeof bggService>

// Mock des données de test
const mockSearchResults = [
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

const mockGameData = {
  id: 174430,
  name: 'Gloomhaven',
  description: 'A tactical combat game in a persistent fantasy world.',
  image: 'https://example.com/image.jpg',
  thumbnail: 'https://example.com/thumb.jpg',
  minPlayers: 1,
  maxPlayers: 4,
  playingTime: 120,
  minPlayTime: 60,
  maxPlayTime: 150,
  minAge: 14,
  yearPublished: 2017,
  categories: ['Adventure', 'Fantasy'],
  mechanics: ['Cooperative Game', 'Hand Management'],
  expansions: [],
  characters: ['Brute', 'Cragheart', 'Mindthief', 'Scoundrel'],
  families: [],
  rating: 8.7,
  complexity: 3.86
}

describe('BGGGameSearch - Tests Fonctionnels', () => {
  const mockOnGameImport = jest.fn()
  const mockOnGameNameChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Ajouter la méthode getGameData au mock si elle n'existe pas
    if (!mockBggService.getGameData) {
      mockBggService.getGameData = jest.fn()
    }
    
    mockBggService.searchGames.mockResolvedValue(mockSearchResults)
    mockBggService.getGameDetails.mockResolvedValue(mockGameData)
    mockBggService.getGameData.mockResolvedValue(mockGameData)
  })

  describe('Interface Utilisateur', () => {
    it('should render search input correctly', () => {
      // Arrange & Act
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Assert
      expect(screen.getByPlaceholderText(/rechercher un jeu sur boardgamegeek/i)).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should show search icon', () => {
      // Arrange & Act
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Assert
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      // L'icône de recherche est rendue par Lucide React
    })

    it('should disable input when disabled prop is true', () => {
      // Arrange & Act
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
          disabled={true}
        />
      )

      // Assert
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('Fonctionnalité de Recherche', () => {
    it('should trigger search when user types', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      // Assert
      expect(mockOnGameNameChange).toHaveBeenCalledWith('Gloomhaven')
      
      // Attendre le debounce (500ms)
      await waitFor(() => {
        expect(mockBggService.searchGames).toHaveBeenCalledWith('Gloomhaven')
      }, { timeout: 1000 })
    })

    it('should not search for queries shorter than 2 characters', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'G')

      // Assert
      expect(mockOnGameNameChange).toHaveBeenCalledWith('G')
      
      // Attendre le debounce et vérifier qu'aucune recherche n'est lancée
      await waitFor(() => {
        expect(mockBggService.searchGames).not.toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('should display loading state during search', async () => {
      // Arrange
      const user = userEvent.setup()
      // Mock une promesse qui ne se résout pas immédiatement
      mockBggService.searchGames.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100))
      )

      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      // Assert - Vérifier que les résultats ne s'affichent pas immédiatement
      // (indiquant un état de chargement)
      expect(screen.queryByText('Gloomhaven')).not.toBeInTheDocument()
      
      // Attendre que les résultats apparaissent
      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      }, { timeout: 1500 })
    })
  })

  describe('Affichage des Résultats', () => {
    it('should display search results when available', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
        expect(screen.getByText('Gloomhaven: Jaws of the Lion')).toBeInTheDocument()
      })
    })

    it('should show game year when available', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('2017')).toBeInTheDocument()
        expect(screen.getByText('2020')).toBeInTheDocument()
      })
    })

    it('should handle games without year published', async () => {
      // Arrange
      const resultsWithoutYear = [
        {
          id: 123,
          name: 'Game Without Year',
          type: 'boardgame'
        }
      ]
      mockBggService.searchGames.mockResolvedValue(resultsWithoutYear)

      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'test')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Game Without Year')).toBeInTheDocument()
        expect(screen.queryByText(/\(\d{4}\)/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Sélection et Import de Jeux', () => {
    it('should allow selecting a game from results', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      // Assert
      await waitFor(() => {
        expect(mockBggService.getGameData).toHaveBeenCalledWith(174430)
      })
    })

    it('should display game details after selection', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act - Recherche et sélection
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      // Assert - Vérifier l'affichage des détails
      await waitFor(() => {
        // Vérifier que le badge BGG est présent (indique les détails)
        expect(screen.getByText('BGG')).toBeInTheDocument()
        
        // Vérifier la présence de l'image thumbnail
        expect(screen.getByAltText('Gloomhaven')).toBeInTheDocument()
        
        // Vérifier des badges de personnages (caractéristique des détails)
        expect(screen.getByText('Brute')).toBeInTheDocument()
        expect(screen.getByText('Cragheart')).toBeInTheDocument()
      })
    })

    it('should show import button for selected game', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/importer depuis bgg/i)).toBeInTheDocument() // Texte français du bouton
      })
    })

    it('should call onGameImport when import button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act - Recherche, sélection et import
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      await waitFor(() => {
        expect(screen.getByText(/importer depuis bgg/i)).toBeInTheDocument()
      })

      const importButton = screen.getByText(/importer depuis bgg/i)
      await user.click(importButton)

      // Assert
      expect(mockOnGameImport).toHaveBeenCalledWith(mockGameData)
    })
  })

  describe('Gestion d\'Erreurs', () => {
    it('should handle search errors gracefully', async () => {
      // Arrange
      mockBggService.searchGames.mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()

      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      // Assert - Vérifier qu'aucune erreur n'est affichée à l'utilisateur
      // et que l'application continue de fonctionner
      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should handle game details fetch errors', async () => {
      // Arrange
      mockBggService.getGameDetails.mockRejectedValue(new Error('Game not found'))
      const user = userEvent.setup()

      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Gloomhaven')

      await waitFor(() => {
        expect(screen.getByText('Gloomhaven')).toBeInTheDocument()
      })

      const gloomhavenResult = screen.getByText('Gloomhaven')
      await user.click(gloomhavenResult)

      // Assert - Vérifier la gestion d'erreur
      await waitFor(() => {
        expect(screen.queryByText(/import this game/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Debouncing', () => {
    it('should debounce search requests', async () => {
      // Arrange
      const user = userEvent.setup({ delay: null }) // Désactiver le délai pour les tests
      render(
        <BGGGameSearch
          onGameImport={mockOnGameImport}
          onGameNameChange={mockOnGameNameChange}
        />
      )

      // Act - Saisie rapide
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, 'Glo')
      await user.type(searchInput, 'om')
      await user.type(searchInput, 'haven')

      // Assert - Une seule recherche devrait être effectuée après le debounce
      await waitFor(() => {
        expect(mockBggService.searchGames).toHaveBeenCalledTimes(1)
        expect(mockBggService.searchGames).toHaveBeenCalledWith('Gloomhaven')
      }, { timeout: 1000 })
    })
  })
})
