import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, Users, Trash2 } from '@phosphor-icons/react'
import { Player, GameSession } from '@/App'

export function GameHistory() {
  const [players] = useKV<Player[]>('players', [])
  const [gameHistory, setGameHistory] = useKV<GameSession[]>('gameHistory', [])

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

  const handleDeleteGame = (gameId: string) => {
    setGameHistory((current) => current.filter(game => game.id !== gameId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                      {game.gameType}
                      {winner && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Trophy size={12} />
                          {winner.name}
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
                      <div>
                        {game.winCondition === 'highest' ? 'Highest' : 'Lowest'} score wins
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGame(game.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Final Scores</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {gamePlayers
                      .sort((a, b) => {
                        const scoreA = game.scores[a.id] || 0
                        const scoreB = game.scores[b.id] || 0
                        return game.winCondition === 'highest' ? scoreB - scoreA : scoreA - scoreB
                      })
                      .map((player, index) => {
                        const score = game.scores[player.id] || 0
                        const isWinner = player.id === game.winner
                        
                        return (
                          <div
                            key={player.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              isWinner ? 'bg-accent/10 border border-accent/20' : 'bg-muted/50'
                            }`}
                          >
                            <div className="text-sm font-medium text-muted-foreground w-6">
                              #{index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${isWinner ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'} text-sm`}>
                                {getPlayerInitials(player.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{player.name}</div>
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