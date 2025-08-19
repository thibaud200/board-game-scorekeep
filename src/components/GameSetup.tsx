import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Play } from '@phosphor-icons/react'
import { Player, GameSession } from '@/App'

interface GameSetupProps {
  players: Player[]
  onCancel: () => void
  onStartGame: (game: GameSession) => void
}

export function GameSetup({ players, onCancel, onStartGame }: GameSetupProps) {
  const [gameType, setGameType] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [winCondition, setWinCondition] = useState<'highest' | 'lowest'>('highest')

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    )
  }

  const handleStartGame = () => {
    if (!gameType.trim() || selectedPlayers.length < 2) return

    const newGame: GameSession = {
      id: Date.now().toString(),
      gameType: gameType.trim(),
      players: selectedPlayers,
      scores: selectedPlayers.reduce((acc, playerId) => {
        acc[playerId] = 0
        return acc
      }, {} as Record<string, number>),
      winCondition,
      date: new Date().toISOString(),
      completed: false,
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">New Game Setup</h1>
              <p className="text-muted-foreground">Configure your game settings</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gameType">Game Name</Label>
                <Input
                  id="gameType"
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  placeholder="e.g., Settlers of Catan, Monopoly, Chess"
                />
              </div>

              <div>
                <Label>Win Condition</Label>
                <RadioGroup value={winCondition} onValueChange={(value: 'highest' | 'lowest') => setWinCondition(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="highest" id="highest" />
                    <Label htmlFor="highest">Highest score wins</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lowest" id="lowest" />
                    <Label htmlFor="lowest">Lowest score wins</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Players ({selectedPlayers.length} selected)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {players.map((player) => {
                  const isSelected = selectedPlayers.includes(player.id)
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handlePlayerToggle(player.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handlePlayerToggle(player.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                          {getPlayerInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  )
                })}
              </div>
              {selectedPlayers.length < 2 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Select at least 2 players to start the game
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleStartGame}
              disabled={!gameType.trim() || selectedPlayers.length < 2}
              size="lg"
              className="flex-1"
            >
              <Play size={20} className="mr-2" />
              Start Game
            </Button>
            <Button variant="outline" onClick={onCancel} size="lg">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}