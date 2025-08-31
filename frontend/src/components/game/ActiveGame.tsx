import { useState, useEffect } from 'react'
import { useDatabase } from '@/lib/database-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Trophy, Plus, Minus, CheckCircle, Clock, Play, Pause, User } from '@phosphor-icons/react'
import { Player, GameSession, CharacterEvent } from '@/types'
import { toast } from 'sonner'

interface ActiveGameProps {
  game: GameSession
  players: Player[]
  onGameComplete: () => void
}

// Standard character types for consistency
const CHARACTER_TYPES = [
  'Explorer',
  'Scholar', 
  'Occultist',
  'Psychic',
  'Dilettante',
  'Athlete',
  'Detective',
  'Medic',
  'Scientist',
  'Artist',
  'Engineer',
  'Archaeologist'
]

export function ActiveGame({ game, players, onGameComplete }: ActiveGameProps) {
  const { db } = useDatabase()
  const [currentGame, setCurrentGame] = useState<GameSession | null>(game)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [sessionDuration, setSessionDuration] = useState<string>('') // Manual input for duration
  const [deadCharacters, setDeadCharacters] = useState<Record<string, boolean>>({}) // Track dead characters
  const [newCharacterNames, setNewCharacterNames] = useState<Record<string, string>>({}) // New character names
  const [newCharacterTypes, setNewCharacterTypes] = useState<Record<string, string>>({}) // New character types
  const [characterHistory, setCharacterHistory] = useState<CharacterEvent[]>([])
  const [activeCharacters, setActiveCharacters] = useState<Record<string, {name: string, type?: string}>>({})

  // Get all used character combinations (name + type) in this session
  const getUsedCharacterCombinations = () => {
    const combinations = new Set<string>()
    
    // Add initial characters
    game.players.forEach(playerId => {
      const character = game.characters?.[playerId]
      if (character) {
        const name = typeof character === 'string' ? character : character.name || ''
        const type = typeof character === 'string' ? '' : character.type || ''
        if (name) {
          combinations.add(`${name.toLowerCase()}|${type.toLowerCase()}`)
        }
      }
    })
    
    // Add characters from history
    characterHistory.forEach(event => {
      if (event.characterName) {
        const name = event.characterName.toLowerCase()
        const type = (event.characterType || '').toLowerCase()
        combinations.add(`${name}|${type}`)
      }
    })
    
    return combinations
  }

  // Check if a character combination is already used
  const isCharacterCombinationUsed = (name: string, type: string = '') => {
    const combinations = getUsedCharacterCombinations()
    const combo = `${name.toLowerCase()}|${type.toLowerCase()}`
    return combinations.has(combo)
  }

  // Get current character for a player (either active or their last character)
  const getCurrentCharacterForPlayer = (playerId: string) => {
    const activeChar = activeCharacters[playerId]
    if (activeChar) return activeChar
    
    // Find last character from history
    const playerEvents = characterHistory.filter(e => e.playerId === playerId)
    const lastEvent = playerEvents[playerEvents.length - 1]
    if (lastEvent) {
      return {
        name: lastEvent.characterName,
        type: lastEvent.characterType
      }
    }
    
    // Fallback to initial character
    const character = game.characters?.[playerId]
    if (character) {
      return typeof character === 'string' 
        ? { name: character } 
        : { name: character.name || '', type: character.type }
    }
    
    return null
  }
  const [coopResult, setCoopResult] = useState<'won' | 'lost' | null>(null) // Coop game result

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const updateScore = (playerId: string, newScore: number) => {
    const updatedGame = {
      ...game,
      scores: {
        ...game.scores,
        [playerId]: Math.max(0, newScore)
      }
    }
    setCurrentGame(updatedGame)
  }

  const adjustScore = (playerId: string, adjustment: number) => {
    const currentScore = game.scores[playerId] || 0
    updateScore(playerId, currentScore + adjustment)
  }

  // Initialize character history and active characters with initial characters
  useEffect(() => {
    if (game.characters && characterHistory.length === 0) {
      const initialEvents: CharacterEvent[] = []
      const initialActive: Record<string, {name: string, type?: string}> = {}
      
      game.players.forEach(playerId => {
        const player = players.find(p => p.id === playerId)
        const character = game.characters?.[playerId]
        
        if (player && character) {
          const characterName = typeof character === 'string' ? character : (character.name || 'Unknown Character')
          const characterType = typeof character === 'string' ? undefined : character.type
          
          initialEvents.push({
            playerId,
            playerName: player.name,
            characterName,
            characterType,
            eventType: 'initial',
            timestamp: new Date().toISOString()
          })
          
          // Set as active character
          initialActive[playerId] = {
            name: characterName,
            type: characterType
          }
        }
      })
      
      setCharacterHistory(initialEvents)
      setActiveCharacters(initialActive)
    }
  }, [game.characters, game.players, players, characterHistory.length])

  /**
   * Handle character death/revival
   * Manages character state, updates history, and handles resurrection logic
   */
  const handleCharacterDeath = (playerId: string, isDead: boolean) => {
    const player = players.find(p => p.id === playerId)
    const activeChar = activeCharacters[playerId]
    
    if (isDead && player && activeChar) {
      // Mark character as dead
      setDeadCharacters(prev => ({ ...prev, [playerId]: true }))
      
      // Add death event to history
      const deathEvent: CharacterEvent = {
        playerId,
        playerName: player.name,
        characterName: activeChar.name,
        characterType: activeChar.type,
        eventType: 'death',
        timestamp: new Date().toISOString()
      }
      
      setCharacterHistory(prev => [...prev, deathEvent])
      
      // Remove from active characters
      setActiveCharacters(prev => {
        const updated = { ...prev }
        delete updated[playerId]
        return updated
      })
    } else if (!isDead) {
      // Revive character (undo death)
      setDeadCharacters(prev => ({ ...prev, [playerId]: false }))
      
      // Clear any pending new character data
      setNewCharacterNames(prev => {
        const updated = { ...prev }
        delete updated[playerId]
        return updated
      })
      setNewCharacterTypes(prev => {
        const updated = { ...prev }
        delete updated[playerId]
        return updated
      })
      
      // Restore the last living character as active
      const playerEvents = characterHistory.filter(e => e.playerId === playerId)
      const lastLivingChar = playerEvents
        .filter(e => e.eventType !== 'death')
        .pop()
      
      if (lastLivingChar) {
        setActiveCharacters(prev => ({
          ...prev,
          [playerId]: {
            name: lastLivingChar.characterName,
            type: lastLivingChar.characterType
          }
        }))
      }
    }
  }

  const handleNewCharacterName = (playerId: string, newName: string) => {
    setNewCharacterNames(prev => ({ ...prev, [playerId]: newName }))
  }

  const handleNewCharacterType = (playerId: string, newType: string) => {
    setNewCharacterTypes(prev => ({ ...prev, [playerId]: newType }))
  }

  /**
   * Create a new character to replace a dead one
   * Validates character uniqueness and updates game state
   */
  const handleCharacterReplacement = (playerId: string) => {
    const player = players.find(p => p.id === playerId)
    const newName = newCharacterNames[playerId]
    const newType = newCharacterTypes[playerId]
    
    if (player && newName) {
      // Check if this character combination is already used
      if (isCharacterCombinationUsed(newName, newType || '')) {
        // Show error message - character already exists
        return false
      }
      
      // Find the last character for this player
      const playerEvents = characterHistory.filter(e => e.playerId === playerId)
      const lastCharacter = playerEvents[playerEvents.length - 1]
      
      const replacementEvent: CharacterEvent = {
        playerId,
        playerName: player.name,
        characterName: newName,
        characterType: newType,
        eventType: 'replacement',
        timestamp: new Date().toISOString(),
        previousCharacter: lastCharacter ? {
          name: lastCharacter.characterName,
          type: lastCharacter.characterType
        } : undefined
      }
      
      setCharacterHistory(prev => [...prev, replacementEvent])
      
      // Set as new active character
      setActiveCharacters(prev => ({
        ...prev,
        [playerId]: {
          name: newName,
          type: newType
        }
      }))
      
      // Clear the input fields
      setNewCharacterNames(prev => {
        const updated = { ...prev }
        delete updated[playerId]
        return updated
      })
      setNewCharacterTypes(prev => {
        const updated = { ...prev }
        delete updated[playerId]
        return updated
      })
      
      // Mark as no longer dead since they have a new character
      setDeadCharacters(prev => ({ ...prev, [playerId]: false }))
      
      return true
    }
    return false
  }

  const getSortedPlayers = () => {
    const gamePlayers = players.filter(p => game.players.includes(p.id))
    return gamePlayers.sort((a, b) => {
      const scoreA = game.scores[a.id] || 0
      const scoreB = game.scores[b.id] || 0
      // Default to highest score wins for sorting
      return scoreB - scoreA
    })
  }

  const getPlayerPosition = (playerId: string) => {
    const sorted = getSortedPlayers()
    return sorted.findIndex(p => p.id === playerId) + 1
  }

  const getCurrentWinner = () => {
    const sorted = getSortedPlayers()
    return sorted[0]
  }

  /**
   * Complete the current game session
   * Validates required fields (duration, coop result) and saves to database
   */
  const handleCompleteGame = async () => {
    if (!db) return
    
    // Validate required fields
    if (!sessionDuration || parseInt(sessionDuration) <= 0) {
      toast.error('Please enter a valid game duration')
      return
    }
    
    // For cooperative games, require result selection
    if (game.isCooperative && !coopResult) {
      toast.error('Please select if the scenario was won or lost')
      return
    }
    
    const winner = game.isCooperative ? undefined : getCurrentWinner()
    const now = new Date()
    const duration = sessionDuration ? parseInt(sessionDuration) : 0 // Use manual duration input
    
    const completedGame: GameSession = {
      ...game,
      endTime: now.toISOString(),
      duration: sessionDuration || '0',
      cooperativeResult: game.isCooperative ? (coopResult === 'won' ? 'victory' : coopResult === 'lost' ? 'defeat' : undefined) : undefined,
      characterHistory // Include the full character history
    }

    try {
      await db.addGameSession(completedGame)
      setCurrentGame(null)
      
      if (game.isCooperative) {
        toast.success(`Cooperative game completed! Great teamwork! 🎉`)
      } else {
        toast.success(`Game completed! ${winner?.name} wins! 🎉`)
      }
      onGameComplete()
    } catch (error) {
      console.error('Error saving completed game:', error)
      toast.error('Failed to save game completion')
    }
  }

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sortedPlayers = getSortedPlayers()
  const currentWinner = getCurrentWinner()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="text-center space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{game.gameTemplate}</h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-muted-foreground">
                <span className="text-sm">
                  {game.gameMode ? 
                    `${game.gameMode.charAt(0).toUpperCase() + game.gameMode.slice(1)} Game` : 
                    (game.isCooperative ? 'Cooperative Game' : 'Competitive Game')
                  }
                </span>
              </div>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-muted-foreground" />
                    <label htmlFor="sessionDuration" className="text-sm font-medium flex items-center gap-1">
                      Duration (minutes)
                      <span className="text-xs text-red-500">*</span>
                    </label>
                  </div>
                  <Input
                    id="sessionDuration"
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    placeholder="Enter duration"
                    className={`w-24 text-center ${!sessionDuration ? "border-destructive" : ""}`}
                    min="1"
                  />
                  {!sessionDuration && (
                    <p className="text-xs text-destructive mt-1">Duration is required to end the game</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPlayers.map((player, index) => {
              const score = game.scores[player.id] || 0
              const isWinning = index === 0
              
              return (
                <Card key={player.id} className={isWinning ? 'ring-2 ring-accent' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${isWinning ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'} font-medium`}>
                            {getPlayerInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{player.name}</h3>
                          {isWinning && !game.isCooperative && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              <Trophy size={10} className="mr-1" />
                              Leading
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dead Characters List - only show if there are dead characters for this player */}
                    {game.characters && game.characters[player.id] && (() => {
                      const playerEvents = characterHistory.filter(e => e.characterId === player.id)
                      const deadEvents = playerEvents.filter(e => e.eventType === 'death')
                      
                      if (deadEvents.length === 0) return null
                      
                      return (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Previous Characters:</div>
                          <div className="space-y-1">
                            {deadEvents.map((event, index) => (
                              <div key={`${event.characterId}-${event.timestamp}-${index}`} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                <span>💀</span>
                                <span>{event.characterId}{event.characterId ? ` (${event.characterId})` : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    
                    {/* Character management */}
                    {game.characters && game.characters[player.id] && (
                      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                        {!deadCharacters[player.id] ? (
                          // Active character section
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-green-700">
                                🟢 Active Character
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCharacterDeath(player.id, true)}
                                className="h-7 text-xs"
                              >
                                Mark as Dead
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getCurrentCharacterForPlayer(player.id) ? (
                                (() => {
                                  const char = getCurrentCharacterForPlayer(player.id)!
                                  return `${char.name}${char.type ? ` (${char.type})` : ''}`
                                })()
                              ) : 'Unknown Character'}
                            </div>
                          </div>
                        ) : (
                          // Dead character section
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-red-700 flex items-center gap-2">
                                  💀 
                                  <span>
                                    {getCurrentCharacterForPlayer(player.id) ? (
                                      (() => {
                                        const char = getCurrentCharacterForPlayer(player.id)!
                                        return `${char.name}${char.type ? ` (${char.type})` : ''} - Dead`
                                      })()
                                    ) : 'Character Dead'}
                                  </span>
                                </div>
                                {game.allowResurrection && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCharacterDeath(player.id, false)}
                                    className="h-7 text-xs"
                                  >
                                    Revive
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3 border-t pt-3">
                              <div className="text-xs font-medium text-orange-700">
                                🟡 Add New Character:
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <Input
                                    placeholder="Enter new character name"
                                    value={newCharacterNames[player.id] || ''}
                                    onChange={(e) => handleNewCharacterName(player.id, e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                  {newCharacterNames[player.id] && isCharacterCombinationUsed(newCharacterNames[player.id], newCharacterTypes[player.id] || '') && (
                                    <div className="text-xs text-red-600 mt-1">
                                      ⚠️ This character combination is already used in this session
                                    </div>
                                  )}
                                </div>
                                <Select
                                  value={newCharacterTypes[player.id] || ''}
                                  onValueChange={(value) => handleNewCharacterType(player.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select character type/class" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CHARACTER_TYPES.map(type => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {newCharacterNames[player.id] && !isCharacterCombinationUsed(newCharacterNames[player.id], newCharacterTypes[player.id] || '') && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCharacterReplacement(player.id)}
                                  className="w-full h-8 text-xs"
                                >
                                  <User size={12} className="mr-1" />
                                  Confirm New Character
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Score section - only show if not cooperative */}
                    {!game.isCooperative && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold text-primary">{score}</div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustScore(player.id, -1)}
                            className="flex-1 h-10"
                          >
                            <Minus size={16} />
                          </Button>
                          
                          <Input
                            type="number"
                            value={score}
                            onChange={(e) => updateScore(player.id, parseInt(e.target.value) || 0)}
                            className="text-center font-medium h-10 text-lg"
                            min="0"
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustScore(player.id, 1)}
                            className="flex-1 h-10"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adjustScore(player.id, 1)}
                            className="text-xs h-8"
                          >
                            +1
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adjustScore(player.id, 5)}
                            className="text-xs h-8"
                          >
                            +5
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adjustScore(player.id, 10)}
                            className="text-xs h-8"
                          >
                            +10
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {/* Cooperative mode - show participation status */}
                    {game.isCooperative && (
                      <div className="text-center py-4">
                        <Badge variant="outline" className="text-sm">
                          <CheckCircle size={12} className="mr-1" />
                          Participating
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {!game.isCooperative && currentWinner && (
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="py-4 md:py-6">
                <div className="text-center">
                  <Trophy size={28} className="mx-auto mb-2 text-accent" />
                  <h3 className="text-lg font-semibold mb-1">
                    {currentWinner.name} is currently winning!
                  </h3>
                  <p className="text-muted-foreground">
                    {game.scores[currentWinner.id]} points
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {game.isCooperative && (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="py-4 md:py-6">
                <div className="text-center">
                  <Trophy size={28} className="mx-auto mb-2 text-primary" />
                  <h3 className="text-lg font-semibold mb-1">
                    Working together as a team!
                  </h3>
                  <p className="text-muted-foreground">
                    Cooperative game - everyone wins or loses together
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-center pb-4">
            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-success hover:bg-success/90 text-success-foreground h-12 px-6"
                  disabled={!sessionDuration || parseInt(sessionDuration) <= 0}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Complete Game
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4">
                <DialogHeader>
                  <DialogTitle>Complete Game</DialogTitle>
                  <DialogDescription>
                    Confirm the game completion and set the final results.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to complete this game?</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} />
                      <span className="font-medium">
                        Game Duration: {sessionDuration ? `${sessionDuration} minutes` : 'Not set'}
                      </span>
                    </div>
                  </div>
                  {!game.isCooperative && currentWinner && (
                    <div className="p-4 bg-accent/10 rounded-lg text-center">
                      <Trophy size={24} className="mx-auto mb-2 text-accent" />
                      <div className="font-medium">{currentWinner.name} wins!</div>
                      <div className="text-sm text-muted-foreground">
                        {game.scores[currentWinner.id]} points
                      </div>
                    </div>
                  )}
                  {game.isCooperative && (
                    <div className="space-y-3">
                      <div className="p-4 bg-primary/10 rounded-lg text-center">
                        <Trophy size={24} className="mx-auto mb-2 text-primary" />
                        <div className="font-medium">Cooperative Scenario</div>
                        <div className="text-sm text-muted-foreground">
                          How did the team perform?
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Scenario Result:</label>
                        <div className="flex gap-2">
                          <Button
                            variant={coopResult === 'won' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCoopResult('won')}
                            className="flex-1"
                          >
                            <Trophy size={14} className="mr-1" />
                            Victory
                          </Button>
                          <Button
                            variant={coopResult === 'lost' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => setCoopResult('lost')}
                            className="flex-1"
                          >
                            ☠️ Defeat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleCompleteGame} className="flex-1 h-11">
                      Yes, Complete Game
                    </Button>
                    <Button variant="outline" onClick={() => setShowCompleteDialog(false)} className="h-11">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}