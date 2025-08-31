import React, { useState, useEffect, useCallback } from 'react'
import { Search, Download, ExternalLink, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { bggService, type BGGSearchResult, type BGGGameData } from '@/services/BGGService'

// Fonction debounce utilitaire
function debounce<T extends (arg: string) => unknown>(func: T, wait: number): (arg: string) => void {
  let timeout: NodeJS.Timeout;
  return (arg: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(arg), wait);
  };
}

interface BGGGameSearchProps {
  onGameImport: (gameData: BGGGameData) => void
  onGameNameChange: (name: string) => void
  disabled?: boolean
  key?: string // Prop pour forcer le re-render
}

/**
 * Composant de recherche et import de jeux depuis BoardGameGeek
 * 
 * Fonctionnalités :
 * - Auto-suggestion pendant la saisie
 * - Preview des données avant import
 * - Import one-click des métadonnées
 */
export function BGGGameSearch({ onGameImport, onGameNameChange, disabled }: BGGGameSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<BGGGameData | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Debounced search pour éviter trop de requêtes
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      console.log('BGG Search: Starting search for:', query) // Debug log
      
      if (query.length < 2) {
        console.log('BGG Search: Query too short, clearing results') // Debug log
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        console.log('BGG Search: Calling bggService.searchGames...') // Debug log
        const results = await bggService.searchGames(query)
        console.log('BGG Search: Results received:', results) // Debug log
        setSearchResults(results.slice(0, 5)) // Limite à 5 résultats
        setShowResults(results.length > 0)
        console.log('BGG Search: showResults set to:', results.length > 0) // Debug log
      } catch (error) {
        console.error('Erreur de recherche BGG:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onGameNameChange(value)
    setSelectedGame(null)
  }

  const handleGameSelect = async (game: BGGSearchResult) => {
    setIsLoadingDetails(true)
    setShowResults(false)

    try {
      const gameData = await bggService.getGameData(game.id)
      if (gameData) {
        setSelectedGame(gameData)
        setSearchQuery(gameData.name)
        onGameNameChange(gameData.name)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleImportGame = () => {
    if (selectedGame) {
      onGameImport(selectedGame)
    }
  }

  return (
    <div className="space-y-4 relative">
      {/* Champ de recherche */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un jeu sur BoardGameGeek..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={disabled}
            className="pl-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {/* Résultats de recherche */}
        {/* TODO: PROBLÈME UI - Fenêtre de suggestions coupée dans les Dialogs
            - Les suggestions BGG peuvent être coupées par les DialogContent avec overflow
            - Solutions possibles :
              1. Utiliser un Portal pour rendre les suggestions en dehors du Dialog
              2. Ajuster dynamiquement la position selon l'espace disponible
              3. Utiliser un Popover ou ComboBox de Radix UI
            - Priorité: Moyenne (amélioration UX)
        */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-[9999] mt-1 max-h-64 overflow-y-auto shadow-lg border">
            <CardContent className="p-2">
              {searchResults.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  disabled={disabled || isLoadingDetails}
                  className="w-full text-left p-2 rounded hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  <div className="font-medium">{game.name}</div>
                  {game.yearPublished && (
                    <div className="text-sm text-muted-foreground">
                      {game.yearPublished}
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loader pour les détails */}
      {isLoadingDetails && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview du jeu sélectionné */}
      {selectedGame && !isLoadingDetails && (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              {selectedGame.thumbnail && (
                <img
                  src={selectedGame.thumbnail}
                  alt={selectedGame.name}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {selectedGame.name}
                  <Badge variant="secondary">BGG</Badge>
                </CardTitle>
                <CardDescription>
                  {selectedGame.yearPublished} • {selectedGame.minPlayers}-{selectedGame.maxPlayers} joueurs • {selectedGame.playingTime}min
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Note BGG:</span> {selectedGame.rating.toFixed(1)}/10
              </div>
              <div>
                <span className="font-medium">Complexité:</span> {selectedGame.complexity.toFixed(1)}/5
              </div>
            </div>

            {/* Extensions */}
            {selectedGame.expansions.length > 0 && (
              <div>
                <span className="font-medium text-sm">Extensions trouvées:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedGame.expansions.slice(0, 3).map((expansion) => (
                    <Badge key={expansion.id} variant="outline" className="text-xs">
                      {expansion.name}
                    </Badge>
                  ))}
                  {selectedGame.expansions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedGame.expansions.length - 3} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Personnages */}
            {selectedGame.characters.length > 0 && (
              <div>
                <span className="font-medium text-sm">Personnages détectés:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedGame.characters.slice(0, 5).map((character, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {character}
                    </Badge>
                  ))}
                  {selectedGame.characters.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedGame.characters.length - 5} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleImportGame}
                disabled={disabled}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Importer depuis BGG
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://boardgamegeek.com/boardgame/${selectedGame.id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
