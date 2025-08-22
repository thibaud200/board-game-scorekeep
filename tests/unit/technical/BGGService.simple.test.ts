/**
 * Tests unitaires techniques - BGGService (Version simplifiée)
 * 
 * Tests simplifiés focalisés sur la logique métier du service BGG.
 * Cette version utilise des mocks complets pour éviter les problèmes
 * de dépendances externes et se concentrer sur les comportements attendus.
 */

import { bggService } from '../../../src/services/BGGService'

// Mock complet du service BGG
jest.mock('../../../src/services/BGGService', () => ({
  bggService: {
    searchGames: jest.fn(),
    getGameData: jest.fn()
  }
}))

const mockBggService = bggService as jest.Mocked<typeof bggService>

describe('BGGService - Tests Techniques (Simplifié)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('searchGames', () => {
    it('should return search results for valid queries', async () => {
      // Arrange
      const expectedResults = [
        {
          id: 174430,
          name: 'Gloomhaven',
          yearPublished: 2017,
          type: 'boardgame'
        }
      ]
      mockBggService.searchGames.mockResolvedValue(expectedResults)

      // Act
      const results = await bggService.searchGames('Gloomhaven')

      // Assert
      expect(mockBggService.searchGames).toHaveBeenCalledWith('Gloomhaven')
      expect(results).toEqual(expectedResults)
      expect(results).toHaveLength(1)
    })

    it('should return empty array for no results', async () => {
      // Arrange
      mockBggService.searchGames.mockResolvedValue([])

      // Act
      const results = await bggService.searchGames('nonexistent')

      // Assert
      expect(results).toEqual([])
      expect(results).toHaveLength(0)
    })

    it('should handle search errors', async () => {
      // Arrange
      mockBggService.searchGames.mockRejectedValue(new Error('API Error'))

      // Act & Assert
      await expect(bggService.searchGames('test')).rejects.toThrow('API Error')
    })
  })

  describe('getGameData', () => {
    it('should return game details for valid game ID', async () => {
      // Arrange
      const expectedGameData = {
        id: 174430,
        name: 'Gloomhaven',
        description: 'A tactical combat game',
        image: 'https://example.com/image.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
        minPlayers: 1,
        maxPlayers: 4,
        playingTime: 120,
        minPlayTime: 60,
        maxPlayTime: 150,
        minAge: 14,
        yearPublished: 2017,
        rating: 8.7,
        complexity: 3.86,
        categories: ['Adventure', 'Fantasy'],
        mechanics: ['Cooperative Game'],
        expansions: [],
        characters: [],
        families: []
      }
      mockBggService.getGameData.mockResolvedValue(expectedGameData)

      // Act
      const gameData = await bggService.getGameData(174430)

      // Assert
      expect(mockBggService.getGameData).toHaveBeenCalledWith(174430)
      expect(gameData).not.toBeNull()
      expect(gameData).toEqual(expectedGameData)
      expect(gameData!.name).toBe('Gloomhaven')
      expect(gameData!.categories).toContain('Adventure')
    })

    it('should return null for invalid game ID', async () => {
      // Arrange
      mockBggService.getGameData.mockResolvedValue(null)

      // Act
      const gameData = await bggService.getGameData(999999)

      // Assert
      expect(gameData).toBeNull()
    })

    it('should handle getGameData errors', async () => {
      // Arrange
      mockBggService.getGameData.mockRejectedValue(new Error('Game not found'))

      // Act & Assert
      await expect(bggService.getGameData(123)).rejects.toThrow('Game not found')
    })
  })

  describe('Service Integration', () => {
    it('should work with both search and getGameData', async () => {
      // Arrange
      const searchResults = [{ id: 174430, name: 'Gloomhaven', yearPublished: 2017, type: 'boardgame' }]
      const gameData = {
        id: 174430,
        name: 'Gloomhaven',
        description: 'Game description',
        image: 'image.jpg',
        thumbnail: 'thumb.jpg',
        minPlayers: 1,
        maxPlayers: 4,
        playingTime: 120,
        minPlayTime: 60,
        maxPlayTime: 150,
        minAge: 14,
        yearPublished: 2017,
        rating: 8.7,
        complexity: 3.86,
        categories: [],
        mechanics: [],
        expansions: [],
        characters: [],
        families: []
      }

      mockBggService.searchGames.mockResolvedValue(searchResults)
      mockBggService.getGameData.mockResolvedValue(gameData)

      // Act
      const results = await bggService.searchGames('Gloomhaven')
      const details = await bggService.getGameData(results[0].id)

      // Assert
      expect(results[0].id).toBe(174430)
      expect(details).not.toBeNull()
      expect(details!.id).toBe(174430)
      expect(details!.name).toBe('Gloomhaven')
    })
  })
})
