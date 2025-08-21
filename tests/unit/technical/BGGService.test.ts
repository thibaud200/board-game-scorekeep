/**
 * Tests unitaires techniques - Service BGG
 * 
 * FIXME: Ces tests ont quelques erreurs TypeScript liées aux types de retour nullables.
 * Les méthodes BGGService peuvent retourner null mais les tests supposent des valeurs non-null.
 * 
 * TODO:
 * - Ajouter des vérifications de nullité dans les tests
 * - Adapter les assertions pour gérer les cas où getGameData retourne null
 * - Corriger les types et assertions pour correspondre à l'interface réelle
 * 
 * Tests des fonctionnalités de l'API BoardGameGeek :
 * - Recherche de jeux
 * - Récupération de détails
 * - Parsing XML
 * - Gestion d'erreurs
 */

import { bggService } from '../../../src/services/BGGService'

// Mock de fetch pour les tests
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('BGGService - Tests Techniques', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('searchGames', () => {
    it('should search games and parse XML response correctly', async () => {
      // Arrange
      const mockXMLResponse = `<?xml version="1.0" encoding="utf-8"?>
        <items total="2" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
          <item type="boardgame" id="174430">
            <name type="primary" value="Gloomhaven"/>
            <yearpublished value="2017"/>
          </item>
          <item type="boardgame" id="291457">
            <name type="primary" value="Gloomhaven: Jaws of the Lion"/>
            <yearpublished value="2020"/>
          </item>
        </items>`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXMLResponse)
      } as Response)

      // Act
      const results = await bggService.searchGames('Gloomhaven')

      // Assert
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({
        id: 174430,
        name: 'Gloomhaven',
        yearPublished: 2017,
        type: 'boardgame'
      })
      expect(results[1]).toEqual({
        id: 291457,
        name: 'Gloomhaven: Jaws of the Lion',
        yearPublished: 2020,
        type: 'boardgame'
      })
    })

    it('should handle empty search results', async () => {
      // Arrange
      const mockEmptyResponse = `<?xml version="1.0" encoding="utf-8"?>
        <items total="0" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
        </items>`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockEmptyResponse)
      } as Response)

      // Act
      const results = await bggService.searchGames('NonExistentGame')

      // Assert
      expect(results).toHaveLength(0)
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Act & Assert
      await expect(bggService.searchGames('test')).rejects.toThrow('Network error')
    })

    it('should handle malformed XML', async () => {
      // Arrange
      const malformedXML = '<?xml version="1.0"?><invalid><incomplete'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(malformedXML)
      } as Response)

      // Act & Assert
      await expect(bggService.searchGames('test')).rejects.toThrow()
    })
  })

  describe('getGameDetails', () => {
    it('should fetch and parse game details correctly', async () => {
      // Arrange
      const mockDetailResponse = `<?xml version="1.0" encoding="utf-8"?>
        <items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
          <item type="boardgame" id="174430">
            <thumbnail>https://cf.geekdo-images.com/thumb.jpg</thumbnail>
            <image>https://cf.geekdo-images.com/original.jpg</image>
            <name type="primary" value="Gloomhaven"/>
            <description>A tactical combat game...</description>
            <yearpublished value="2017"/>
            <minplayers value="1"/>
            <maxplayers value="4"/>
            <playingtime value="120"/>
            <minplaytime value="60"/>
            <maxplaytime value="150"/>
            <minage value="14"/>
            <link type="boardgamecategory" id="1022" value="Adventure"/>
            <link type="boardgamemechanic" id="2023" value="Cooperative Game"/>
            <link type="boardgameexpansion" id="291457" value="Gloomhaven: Jaws of the Lion"/>
            <link type="boardgamehonor" id="8374" value="2017 Golden Geek Best Thematic Board Game Winner"/>
            <statistics>
              <ratings>
                <average value="8.7"/>
                <averageweight value="3.86"/>
              </ratings>
            </statistics>
          </item>
        </items>`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockDetailResponse)
      } as Response)

      // Act
      const gameData = await bggService.getGameData(174430)

      // Assert
      expect(gameData).toMatchObject({
        id: 174430,
        name: 'Gloomhaven',
        description: 'A tactical combat game...',
        image: 'https://cf.geekdo-images.com/original.jpg',
        thumbnail: 'https://cf.geekdo-images.com/thumb.jpg',
        minPlayers: 1,
        maxPlayers: 4,
        playingTime: 120,
        minPlayTime: 60,
        maxPlayTime: 150,
        minAge: 14,
        yearPublished: 2017,
        rating: 8.7,
        complexity: 3.86
      })
      expect(gameData.categories).toContain('Adventure')
      expect(gameData.mechanics).toContain('Cooperative Game')
      expect(gameData.expansions).toHaveLength(1)
      expect(gameData.expansions[0]).toMatchObject({
        id: 291457,
        name: 'Gloomhaven: Jaws of the Lion'
      })
    })

    it('should handle missing optional fields', async () => {
      // Arrange
      const minimalResponse = `<?xml version="1.0" encoding="utf-8"?>
        <items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
          <item type="boardgame" id="123">
            <name type="primary" value="Test Game"/>
            <yearpublished value="2023"/>
            <minplayers value="2"/>
            <maxplayers value="4"/>
            <playingtime value="30"/>
          </item>
        </items>`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(minimalResponse)
      } as Response)

      // Act
      const gameData = await bggService.getGameData(123)

      // Assert
      expect(gameData.name).toBe('Test Game')
      expect(gameData.description).toBe('')
      expect(gameData.categories).toEqual([])
      expect(gameData.mechanics).toEqual([])
      expect(gameData.expansions).toEqual([])
      expect(gameData.characters).toEqual([])
    })
  })

  describe('XML Parsing Edge Cases', () => {
    it('should handle special characters in game names', async () => {
      // Arrange
      const specialCharsXML = `<?xml version="1.0" encoding="utf-8"?>
        <items total="1">
          <item type="boardgame" id="123">
            <name type="primary" value="Game with &amp; Special &quot;Characters&quot;"/>
            <yearpublished value="2023"/>
          </item>
        </items>`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(specialCharsXML)
      } as Response)

      // Act
      const results = await bggService.searchGames('test')

      // Assert
      expect(results[0].name).toBe('Game with & Special "Characters"')
    })

    it('should handle missing year published', async () => {
      // Arrange
      const noYearXML = `<?xml version="1.0" encoding="utf-8"?>
        <items total="1">
          <item type="boardgame" id="123">
            <name type="primary" value="Game Without Year"/>
          </item>
        </items>`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(noYearXML)
      } as Response)

      // Act
      const results = await bggService.searchGames('test')

      // Assert
      expect(results[0].yearPublished).toBeUndefined()
    })
  })

  describe('Rate Limiting', () => {
    it('should respect rate limiting between requests', async () => {
      // Arrange
      const startTime = Date.now()
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<?xml version="1.0"?><items total="0"></items>')
      } as Response)

      // Act
      await bggService.searchGames('game1')
      await bggService.searchGames('game2')
      const endTime = Date.now()

      // Assert
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000) // Au moins 1 seconde entre les requêtes
    })
  })
})
