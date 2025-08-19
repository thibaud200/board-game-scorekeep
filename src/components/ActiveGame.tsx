import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trophy, Plus, Minus, CheckCircle } from '@phosphor-icons/react'
import { Player, GameSession } from '@/App'
import { toast } from 'sonner'

interface ActiveGameProps {
  game: GameSession
  players: Player[]
  onGameComplete: () => void
}

export function ActiveGame({ game, players, onGameComplete }: ActiveGameProps) {
  const [currentGame, setCurrentGame] = useKV<GameSession | null>('currentGame', null)
  const [gameHistory, setGameHistory] = useKV<GameSession[]>('gameHistory', [])
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

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

  const getSortedPlayers = () => {
    const gamePlayers = players.filter(p => game.players.includes(p.id))
    return gamePlayers.sort((a, b) => {
      const scoreA = game.scores[a.id] || 0
      const scoreB = game.scores[b.id] || 0
      
      if (game.winCondition === 'highest') {
        return scoreB - scoreA
      } else {
        return scoreA - scoreB
      }
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

  const handleCompleteGame = () => {
    const winner = getCurrentWinner()
    const completedGame: GameSession = {
      ...game,
      winner: winner?.id,
      completed: true
    }

    setGameHistory((current) => [...current, completedGame])
    setCurrentGame(null)
    
    toast.success(`Game completed! ${winner?.name} wins! 🎉`)
    onGameComplete()
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{game.gameType}</h1>
            <p className="text-muted-foreground">
              {game.winCondition === 'highest' ? 'Highest' : 'Lowest'} score wins
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                        <div>
                          <h3 className="font-medium">{player.name}</h3>
                          {isWinning && (
                            <Badge variant="secondary" className="text-xs">
                              <Trophy size={12} className="mr-1" />
                              Leading
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">#{getPlayerPosition(player.id)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{score}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustScore(player.id, -1)}
                        className="flex-1"
                      >
                        <Minus size={16} />
                      </Button>
                      
                      <Input
                        type="number"
                        value={score}
                        onChange={(e) => updateScore(player.id, parseInt(e.target.value) || 0)}
                        className="text-center font-medium"
                        min="0"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustScore(player.id, 1)}
                        className="flex-1"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => adjustScore(player.id, 1)}
                        className="text-xs"
                      >
                        +1
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => adjustScore(player.id, 5)}
                        className="text-xs"
                      >
                        +5
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => adjustScore(player.id, 10)}
                        className="text-xs"
                      >
                        +10
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {currentWinner && (
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="py-6">
                <div className="text-center">
                  <Trophy size={32} className="mx-auto mb-2 text-accent" />
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

          <div className="flex gap-3 justify-center">
            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-success hover:bg-success/90 text-success-foreground">
                  <CheckCircle size={20} className="mr-2" />
                  Complete Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Game</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to complete this game?</p>
                  {currentWinner && (
                    <div className="p-4 bg-accent/10 rounded-lg text-center">
                      <Trophy size={24} className="mx-auto mb-2 text-accent" />
                      <div className="font-medium">{currentWinner.name} wins!</div>
                      <div className="text-sm text-muted-foreground">
                        {game.scores[currentWinner.id]} points
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleCompleteGame} className="flex-1">
                      Yes, Complete Game
                    </Button>
                    <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
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