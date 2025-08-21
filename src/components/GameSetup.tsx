import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Users, GameController, Clock, Trophy, Bookmark } from '@phosphor-icons/react'
import { Player, GameSession, GameTemplate } from '@/App'

interface GameSetupProps {
  players: Player[]
  gameTemplates: GameTemplate[]
  onCancel: () => void
  onStartGame: (game: GameSession) => void
}

export function GameSetup({ players, gameTemplates, onCancel, onStartGame }: GameSetupProps) {
  const [gameType, setGameType] = useState('')
  const [gameMode, setGameMode] = useState<'cooperative' | 'competitive' | 'campaign'>('competitive')
  const [isCooperative, setIsCooperative] = useState(false) // Keep for backward compatibility
  const [allowResurrection, setAllowResurrection] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [winCondition, setWinCondition] = useState<'highest' | 'lowest' | 'cooperative'>('highest')
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])
  const [playerCharacters, setPlayerCharacters] = useState<Record<string, string>>({})
  const [playerCharacterNames, setPlayerCharacterNames] = useState<Record<string, string>>({})
  
  const selectedTemplate = gameTemplates.find(t => t.name === gameType)

  const handleGameTypeChange = (value: string) => {
    setGameType(value)
    const template = gameTemplates.find(t => t.name === value)
    if (template) {
      // Set default mode from template
      const defaultMode = template.defaultMode || 'competitive'
      setGameMode(defaultMode)
      setIsCooperative(defaultMode === 'cooperative')
      setWinCondition(defaultMode === 'cooperative' ? 'cooperative' : 'highest')
      setSelectedExtensions([])
      setPlayerCharacters({})
      setPlayerCharacterNames({})
    } else {
      setGameMode('competitive')
      setIsCooperative(false)
      setWinCondition('highest')
      setSelectedExtensions([])
      setPlayerCharacters({})
      setPlayerCharacterNames({})
    }
  }

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((current) => {
      const newSelected = current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
      
      // Remove character assignment if player is deselected
      if (!newSelected.includes(playerId)) {
        setPlayerCharacters(prev => {
          const { [playerId]: removed, ...rest } = prev
          return rest
        })
        setPlayerCharacterNames(prev => {
          const { [playerId]: removed, ...rest } = prev
          return rest
        })
      }
      
      return newSelected
    })
  }

  const handleExtensionToggle = (extension: string) => {
    setSelectedExtensions(current =>
      current.includes(extension)
        ? current.filter(e => e !== extension)
        : [...current, extension]
    )
  }

  const handleCharacterSelect = (playerId: string, character: string) => {
    setPlayerCharacters(prev => ({
      ...prev,
      [playerId]: character
    }))
  }

  const handleCharacterNameChange = (playerId: string, name: string) => {
    setPlayerCharacterNames(prev => ({
      ...prev,
      [playerId]: name
    }))
  }

  const handleStartGame = () => {
    if (!gameType.trim() || selectedPlayers.length < 2) return

    // Create characters object if there are character assignments
    let charactersData: Record<string, { name?: string; type?: string }> | undefined
    if (Object.keys(playerCharacters).length > 0 || Object.keys(playerCharacterNames).length > 0) {
      charactersData = {}
      selectedPlayers.forEach(playerId => {
        const charName = playerCharacterNames[playerId]
        const charType = playerCharacters[playerId]
        if (charName || charType) {
          charactersData![playerId] = {
            name: charName || undefined,
            type: charType || undefined
          }
        }
      })
      if (Object.keys(charactersData).length === 0) {
        charactersData = undefined
      }
    }

    const newGame: GameSession = {
      id: Date.now().toString(),
      gameTemplate: gameType.trim(),
      gameMode,
      isCooperative, // Keep for backward compatibility
      allowResurrection: gameMode === 'cooperative' ? allowResurrection : undefined,
      players: selectedPlayers,
      scores: selectedPlayers.reduce((acc, playerId) => {
        acc[playerId] = 0
        return acc
      }, {} as Record<string, number>),
      characters: charactersData,
      startTime: new Date().toISOString(),
    }

    onStartGame(newGame)
  }

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onCancel} size="sm">
              <ArrowLeft size={16} className="md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">New Game Setup</h1>
              <p className="text-muted-foreground text-sm">Configure your game settings</p>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GameController size={18} />
                Game Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="gameType" className="text-sm font-medium">Game Name</Label>
                <div className="space-y-2">
                  <Select value={gameType} onValueChange={handleGameTypeChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a game or type custom name" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameTemplates.map(template => (
                        <SelectItem key={template.name} value={template.name}>
                          <div className="flex items-center gap-2">
                            {template.name}
                            <div className="flex gap-1">
                              {template.supportsCooperative && (
                                <Badge variant="outline" className="text-xs">Coop</Badge>
                              )}
                              {template.supportsCompetitive && (
                                <Badge variant="secondary" className="text-xs">Comp</Badge>
                              )}
                              {template.supportsCampaign && (
                                <Badge variant="default" className="text-xs">Campaign</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="gameType"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                    placeholder="Or type a custom game name"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Game Mode Selection */}
              {selectedTemplate && (selectedTemplate.supportsCooperative || selectedTemplate.supportsCompetitive || selectedTemplate.supportsCampaign) && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Game Mode</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedTemplate.supportsCooperative && (
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          gameMode === 'cooperative' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setGameMode('cooperative')
                          setIsCooperative(true)
                          setWinCondition('cooperative')
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={16} />
                          <span className="font-medium text-sm">Cooperative</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Work together as a team</p>
                      </div>
                    )}
                    
                    {selectedTemplate.supportsCompetitive && (
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          gameMode === 'competitive' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setGameMode('competitive')
                          setIsCooperative(false)
                          setWinCondition('highest')
                          setPlayerCharacters({})
                          setPlayerCharacterNames({})
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy size={16} />
                          <span className="font-medium text-sm">Competitive</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Compete against each other</p>
                      </div>
                    )}
                    
                    {selectedTemplate.supportsCampaign && (
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          gameMode === 'campaign' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setGameMode('campaign')
                          setIsCooperative(false)
                          setWinCondition('highest')
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Bookmark size={16} />
                          <span className="font-medium text-sm">Campaign</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Multi-session story</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode-specific options */}
              {gameMode === 'cooperative' && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-800">Cooperative Options</Label>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="resurrection"
                      checked={allowResurrection}
                      onCheckedChange={(checked) => setAllowResurrection(checked as boolean)}
                    />
                    <Label htmlFor="resurrection" className="flex items-center gap-2 cursor-pointer text-sm">
                      <span>🔄</span>
                      Allow character resurrection
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If enabled, dead characters can be revived during the game. Otherwise, dead characters cannot be reused by any player.
                  </p>
                </div>
              )}

              {(gameMode === 'competitive' || gameMode === 'campaign') && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Win Condition</Label>
                  <RadioGroup value={winCondition} onValueChange={(value: 'highest' | 'lowest') => setWinCondition(value)}>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                      <RadioGroupItem value="highest" id="highest" />
                      <Label htmlFor="highest" className="cursor-pointer">Highest score wins</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                      <RadioGroupItem value="lowest" id="lowest" />
                      <Label htmlFor="lowest" className="cursor-pointer">Lowest score wins</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedTemplate?.hasExtensions && selectedTemplate.extensions && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Extensions ({selectedExtensions.length} selected)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTemplate.extensions.map(extension => (
                      <div
                        key={extension}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                          selectedExtensions.includes(extension)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleExtensionToggle(extension)}
                      >
                        <Checkbox
                          checked={selectedExtensions.includes(extension)}
                          onCheckedChange={() => handleExtensionToggle(extension)}
                        />
                        <span className="text-sm flex-1">{extension}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users size={18} />
                Select Players ({selectedPlayers.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player) => {
                  const isSelected = selectedPlayers.includes(player.id)
                  return (
                    <div key={player.id} className="space-y-2">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handlePlayerToggle(player.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handlePlayerToggle(player.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                            {getPlayerInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium flex-1">{player.name}</span>
                      </div>
                      
                      {isSelected && isCooperative && selectedTemplate?.hasCharacters && selectedTemplate.characters && (
                        <div className="ml-6 mr-3 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`character-name-${player.id}`} className="text-xs text-muted-foreground">
                                Character Name
                              </Label>
                              <Input
                                id={`character-name-${player.id}`}
                                placeholder="Enter character name"
                                className="h-9 text-sm"
                                value={playerCharacterNames[player.id] || ''}
                                onChange={(e) => handleCharacterNameChange(player.id, e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`character-type-${player.id}`} className="text-xs text-muted-foreground">
                                Character Type
                              </Label>
                              <Select
                                value={playerCharacters[player.id] || ''}
                                onValueChange={(value) => handleCharacterSelect(player.id, value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedTemplate.characters.map(character => (
                                    <SelectItem key={character} value={character}>
                                      {character}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {selectedPlayers.length < 2 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Select at least 2 players to start the game
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleStartGame}
              disabled={!gameType.trim() || selectedPlayers.length < 2}
              size="lg"
              className="w-full sm:flex-1 h-12"
            >
              <Play size={18} className="mr-2" />
              Start Game
            </Button>
            <Button variant="outline" onClick={onCancel} size="lg" className="w-full sm:w-auto h-12">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}