import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trophy, Calendar, Users, Trash, Clock, GameController, Eye, Skull } from '@phosphor-icons/react'
import { Player, GameSession } from '@/types'
import { useGameHistory } from '@/lib/database-hooks'
import { toast } from 'sonner'
import { useState } from 'react'

interface GameHistoryProps {
  players: Player[]
}

export function GameHistory({ players }: GameHistoryProps) {
  const { gameHistory, deleteGameSession } = useGameHistory()
  const [selectedGame, setSelectedGame] = useState<GameSession | null>(null)

  const completedGames = gameHistory.filter(game => game.completed).reverse()

  const getPlayer = (playerId: string) => {
    return players.find(p => p.id === playerId)
  }

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteGameSession(gameId)
      toast.success('Game deleted successfully')
    } catch (error) {
      toast.error('Failed to delete game')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (duration?: string | number) => {
    if (!duration) return 'Unknown'
    
    // Convert string to number if needed
    const minutes = typeof duration === 'string' ? parseFloat(duration) : duration
    if (isNaN(minutes)) return 'Unknown'
    
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const GameDetailDialog = ({ game }: { game: GameSession }) => {
    const winner = getPlayer(game.winner || '')
    const gamePlayers = game.players.map(id => getPlayer(id)).filter(Boolean) as Player[]
    
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GameController size={20} />
            {game.gameMode}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">{formatDate(game.date)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{formatDuration(game.duration)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Mode</div>
              <div className="font-medium">{game.isCooperative ? 'Cooperative' : 'Competitive'}</div>
            </div>
            {game.isCooperative && (
              <div>
                <div className="text-sm text-muted-foreground">Result</div>
                <Badge variant={game.cooperativeResult === 'victory' ? 'default' : 'destructive'}>
                  {game.cooperativeResult === 'victory' ? 'Victory' : 'Defeat'}
                </Badge>
              </div>
            )}
          </div>

          {/* Players */}
          <div>
            <h3 className="font-medium mb-3">Players ({gamePlayers.length})</h3>
            <div className="space-y-2">
              {gamePlayers.map((player) => {
                const isDead = game.deadCharacters?.[player.id]
                const newCharacterName = game.newCharacterNames?.[player.id]
                const score = game.scores[player.id]
                
                return (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={isDead ? 'bg-red-100 text-red-600' : ''}>
                          {getPlayerInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          {isDead && <Skull size={16} className="text-red-500" />}
                        </div>
                        {newCharacterName && (
                          <div className="text-sm text-muted-foreground">
                            New character: {newCharacterName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!game.isCooperative && score !== undefined && (
                        <div className="text-right">
                          <div className="font-medium">{score}</div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                      )}
                      {!game.isCooperative && winner?.id === player.id && (
                        <Trophy size={16} className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dead Characters Summary */}
          {game.deadCharacters && Object.keys(game.deadCharacters).some(id => game.deadCharacters![id]) && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Skull size={16} className="text-red-500" />
                Casualties ({Object.values(game.deadCharacters).filter(Boolean).length})
              </h3>
              <div className="text-sm text-muted-foreground">
                {Object.entries(game.deadCharacters)
                  .filter(([_, isDead]) => isDead)
                  .map(([playerId]) => getPlayer(playerId)?.name)
                  .filter(Boolean)
                  .join(', ')} lost their characters during this session.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    )
  }

  if (completedGames.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Game History</h2>
          <p className="text-muted-foreground">Your completed games will appear here</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No games completed yet</h3>
            <p className="text-muted-foreground">Complete your first game to see it here</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Game History</h2>
        <p className="text-muted-foreground">{completedGames.length} games completed</p>
      </div>

      <div className="space-y-4">
        {completedGames.map((game) => {
          const winner = getPlayer(game.winner || '')
          const gamePlayers = game.players.map(id => getPlayer(id)).filter(Boolean) as Player[]

          return (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {game.gameMode}
                      {game.isCooperative ? (
                        <Badge 
                          variant={game.cooperativeResult === 'victory' ? 'default' : 'destructive'} 
                          className="flex items-center gap-1"
                        >
                          <Users size={12} />
                          {game.cooperativeResult === 'victory' ? 'Victory' : 'Defeat'}
                        </Badge>
                      ) : winner ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Trophy size={12} />
                          {winner.name}
                        </Badge>
                      ) : null}
                      {game.extensions && game.extensions.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <GameController size={12} />
                          +{game.extensions.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(game.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {game.players.length} players
                      </div>
                      {game.duration && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(game.duration)}
                        </div>
                      )}
                      {!game.isCooperative && (
                        <div>
                          {game.winCondition === 'highest' ? 'Highest' : 'Lowest'} score wins
                        </div>
                      )}
                    </div>
                    {game.extensions && game.extensions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {game.extensions.map(ext => (
                          <Badge key={ext} variant="outline" className="text-xs">
                            {ext}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <GameDetailDialog game={game} />
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">
                    {game.isCooperative ? 'Team Scores' : 'Final Scores'}
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {gamePlayers
                      .sort((a, b) => {
                        if (game.isCooperative) return 0 // Keep original order for coop games
                        const scoreA = game.scores[a.id] || 0
                        const scoreB = game.scores[b.id] || 0
                        return game.winCondition === 'highest' ? scoreB - scoreA : scoreA - scoreB
                      })
                      .map((player, index) => {
                        const score = game.scores[player.id] || 0
                        const isWinner = !game.isCooperative && player.id === game.winner
                        
                        return (
                          <div
                            key={player.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              isWinner ? 'bg-accent/10 border border-accent/20' : 'bg-muted/50'
                            }`}
                          >
                            {!game.isCooperative && (
                              <div className="text-sm font-medium text-muted-foreground w-6">
                                #{index + 1}
                              </div>
                            )}
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${isWinner ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'} text-sm`}>
                                {getPlayerInitials(player.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{player.name}</div>
                              {game.characters && game.characters[player.id] && (
                                <div className="text-xs text-muted-foreground">
                                  {(() => {
                                    const char = game.characters[player.id]
                                    if (typeof char === 'string') {
                                      // Legacy format - just display the string
                                      return char
                                    } else if (char) {
                                      // New format with name and type
                                      const parts: string[] = []
                                      if (char.name) parts.push(char.name)
                                      if (char.type) parts.push(`(${char.type})`)
                                      return parts.join(' ')
                                    }
                                    return ''
                                  })()}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{score}</span>
                              {isWinner && <Trophy size={14} className="text-accent" />}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}