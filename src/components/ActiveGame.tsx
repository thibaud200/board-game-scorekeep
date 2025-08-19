import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trophy, Plus, Minus, CheckCircle, Clock, Play, Pause } from '@phosphor-icons/react'
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
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  // Timer effect
  useEffect(() => {
    let interval: number | undefined
    
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        const startTime = new Date(game.startTime || game.date)
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, game.startTime, game.date])

  // Initialize timer on mount
  useEffect(() => {
    const startTime = new Date(game.startTime || game.date)
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
    setElapsedTime(elapsed)
  }, [game.startTime, game.date])

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
    const winner = game.isCooperative ? undefined : getCurrentWinner()
    const now = new Date()
    const startTime = new Date(game.startTime || game.date)
    const duration = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60)) // duration in minutes
    
    const completedGame: GameSession = {
      ...game,
      winner: winner?.id,
      endTime: now.toISOString(),
      duration,
      completed: true
    }

    setGameHistory((current) => [...current, completedGame])
    setCurrentGame(null)
    
    if (game.isCooperative) {
      toast.success(`Cooperative game completed! Great teamwork! 🎉`)
    } else {
      toast.success(`Game completed! ${winner?.name} wins! 🎉`)
    }
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
          <div className="text-center space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{game.gameType}</h1>
              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <span>
                  {game.isCooperative ? 'Cooperative Game' : 
                   game.winCondition === 'highest' ? 'Highest score wins' : 'Lowest score wins'}
                </span>
                {game.extensions && game.extensions.length > 0 && (
                  <div className="flex gap-1">
                    {game.extensions.map(ext => (
                      <Badge key={ext} variant="outline" className="text-xs">
                        {ext}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-muted-foreground" />
                    <span className="text-2xl font-mono font-bold">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                          {game.characters && game.characters[player.id] && (
                            <div className="text-xs text-muted-foreground">
                              {game.characters[player.id]}
                            </div>
                          )}
                          {isWinning && !game.isCooperative && (
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

          {!game.isCooperative && currentWinner && (
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

          {game.isCooperative && (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="py-6">
                <div className="text-center">
                  <Trophy size={32} className="mx-auto mb-2 text-primary" />
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
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} />
                      <span className="font-medium">Game Duration: {formatTime(elapsedTime)}</span>
                    </div>
                    {game.extensions && game.extensions.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Extensions: {game.extensions.join(', ')}
                      </div>
                    )}
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
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <Trophy size={24} className="mx-auto mb-2 text-primary" />
                      <div className="font-medium">Team Effort Complete!</div>
                      <div className="text-sm text-muted-foreground">
                        Cooperative victory achieved
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