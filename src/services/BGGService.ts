/**
 * BoardGameGeek API Service
 * 
 * Interface avec l'API XML officielle de BoardGameGeek pour :
 * - Recherche de jeux par nom
 * - Import de métadonnées complètes
 * - Extraction d'extensions et personnages
 */

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
  expansions: BGGExpansion[]
  characters: string[] // Extrait depuis boardgamehonor, boardgamefamily
  families: string[]
  rating: number
  complexity: number
}

interface BGGExpansion {
  id: number
  name: string
  yearPublished?: number
}

class BGGService {
  private readonly baseUrl = 'https://boardgamegeek.com/xmlapi2'
  private readonly corsProxy = 'http://localhost:3001/api/bgg' // URL complète vers notre serveur

  /**
   * Recherche de jeux par nom avec auto-suggestion
   */
  async searchGames(query: string): Promise<BGGSearchResult[]> {
    if (query.length < 2) return []

    console.log('BGGService: Starting search for:', query) // Debug log

    try {
      const url = `${this.corsProxy}/search?query=${encodeURIComponent(query)}&type=boardgame`
      console.log('BGGService: Fetching URL:', url) // Debug log
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`BGG API Error: ${response.status}`)
      }

      const xmlText = await response.text()
      console.log('BGGService: Received XML:', xmlText.substring(0, 200) + '...') // Debug log
      return this.parseSearchResults(xmlText)
    } catch (error) {
      console.error('BGG Search Error:', error)
      return []
    }
  }

  /**
   * Import complet des données d'un jeu
   */
  async getGameData(gameId: number): Promise<BGGGameData | null> {
    try {
      console.log('BGGService: Fetching game data for ID:', gameId) // Debug log
      
      const response = await fetch(
        `${this.corsProxy}/thing?id=${gameId}&stats=1&versions=1`
      )

      if (!response.ok) {
        throw new Error(`BGG API Error: ${response.status}`)
      }

      const xmlText = await response.text()
      console.log('BGGService: Received game XML:', xmlText.substring(0, 500) + '...') // Debug log
      
      const gameData = this.parseGameData(xmlText)
      console.log('BGGService: Parsed game data:', gameData) // Debug log
      
      return gameData
    } catch (error) {
      console.error('BGG Game Data Error:', error)
      return null
    }
  }

  /**
   * Parse XML de recherche → résultats structurés
   */
  private parseSearchResults(xmlText: string): BGGSearchResult[] {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const items = xmlDoc.querySelectorAll('item')

    return Array.from(items).map(item => ({
      id: parseInt(item.getAttribute('id') || '0'),
      name: item.querySelector('name')?.getAttribute('value') || '',
      yearPublished: parseInt(item.querySelector('yearpublished')?.getAttribute('value') || '0') || undefined,
      type: item.getAttribute('type') || 'boardgame'
    }))
  }

  /**
   * Parse XML de données complètes → objet structuré
   */
  private parseGameData(xmlText: string): BGGGameData | null {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const item = xmlDoc.querySelector('item')

    if (!item) return null

    // Extraction des données de base
    const id = parseInt(item.getAttribute('id') || '0')
    const names = item.querySelectorAll('name')
    const primaryName = Array.from(names).find(n => n.getAttribute('type') === 'primary')?.getAttribute('value') || ''
    
    // Métadonnées de jeu
    const minPlayers = parseInt(item.querySelector('minplayers')?.getAttribute('value') || '1')
    const maxPlayers = parseInt(item.querySelector('maxplayers')?.getAttribute('value') || '4')
    const playingTime = parseInt(item.querySelector('playingtime')?.getAttribute('value') || '60')
    const minPlayTime = parseInt(item.querySelector('minplaytime')?.getAttribute('value') || playingTime.toString())
    const maxPlayTime = parseInt(item.querySelector('maxplaytime')?.getAttribute('value') || playingTime.toString())
    const minAge = parseInt(item.querySelector('minage')?.getAttribute('value') || '8')
    const yearPublished = parseInt(item.querySelector('yearpublished')?.getAttribute('value') || '0')

    // Images
    const image = item.querySelector('image')?.textContent || ''
    const thumbnail = item.querySelector('thumbnail')?.textContent || ''

    // Description
    const description = item.querySelector('description')?.textContent || ''

    // Catégories et mécaniques
    const categories = this.extractLinksByType(item, 'boardgamecategory')
    const mechanics = this.extractLinksByType(item, 'boardgamemechanic')
    const families = this.extractLinksByType(item, 'boardgamefamily')

    // Extensions
    const expansions = this.extractExpansions(item)

    // Personnages (depuis boardgamehonor et families)
    const characters = [
      ...this.extractLinksByType(item, 'boardgamehonor'),
      ...families.filter(f => f.toLowerCase().includes('character') || f.toLowerCase().includes('hero'))
    ]

    // Statistiques
    const statistics = item.querySelector('statistics ratings')
    const rating = parseFloat(statistics?.querySelector('average')?.getAttribute('value') || '0')
    const complexity = parseFloat(statistics?.querySelector('averageweight')?.getAttribute('value') || '0')

    return {
      id,
      name: primaryName,
      description,
      image,
      thumbnail,
      minPlayers,
      maxPlayers,
      playingTime,
      minPlayTime,
      maxPlayTime,
      minAge,
      yearPublished,
      categories,
      mechanics,
      expansions,
      characters,
      families,
      rating,
      complexity
    }
  }

  /**
   * Extrait les liens d'un type spécifique (catégories, mécaniques, etc.)
   */
  private extractLinksByType(item: Element, type: string): string[] {
    const links = item.querySelectorAll(`link[type="${type}"]`)
    return Array.from(links).map(link => link.getAttribute('value') || '')
  }

  /**
   * Extrait les extensions d'un jeu
   */
  private extractExpansions(item: Element): BGGExpansion[] {
    const expansionLinks = item.querySelectorAll('link[type="boardgameexpansion"]')
    return Array.from(expansionLinks).map(link => ({
      id: parseInt(link.getAttribute('id') || '0'),
      name: link.getAttribute('value') || '',
      yearPublished: undefined // Pourrait être récupéré avec une requête supplémentaire
    }))
  }

  /**
   * Rate limiting pour éviter les erreurs 503
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const bggService = new BGGService()
export type { BGGSearchResult, BGGGameData, BGGExpansion }
