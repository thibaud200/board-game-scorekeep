import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Trophy, Users, GameController, Calendar, Clock, Eye, Skull } from '@phosphor-icons/react'
import { Player, GameSession } from '@/App'
import { useGameHistory, usePlayers } from '@/lib/database-hooks'

interface GameTypeDetailProps {
  gameType: string
  onBack: () => void
}

export function GameTypeDetail({ gameType, onBack }: GameTypeDetailProps) {
  const { gameHistory } = useGameHistory()
  const { players } = usePlayers()

  const gameTypeSessions = gameHistory.filter(game => 
    game.completed && game.gameType === gameType
  )

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (duration?: string | number) => {
    if (!duration) return 'Unknown'
    const minutes = typeof duration === 'string' ? parseFloat(duration) : duration
    if (isNaN(minutes)) return 'Unknown'
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Calculate statistics
  const totalSessions = gameTypeSessions.length
  const coopSessions = gameTypeSessions.filter(game => game.isCooperative)
  const competitiveSessions = gameTypeSessions.filter(game => !game.isCooperative)
  const coopWins = coopSessions.filter(game => game.cooperativeResult === 'victory').length
  const coopWinRate = coopSessions.length > 0 ? ((coopWins / coopSessions.length) * 100).toFixed(1) : '0.0'
  
  const totalDuration = gameTypeSessions.reduce((sum, game) => {
    const duration = typeof game.duration === 'string' ? parseFloat(game.duration) : (game.duration || 0)
    return sum + duration
  }, 0)
  const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0
  
  const totalPlayers = [...new Set(gameTypeSessions.flatMap(game => game.players))].length
  const totalDeaths = gameTypeSessions.reduce((sum, game) => 
    sum + (game.deadCharacters ? Object.values(game.deadCharacters).filter(Boolean).length : 0), 0
  )

  // Player statistics
  const playerStats = players.map(player => {
    const playerGames = gameTypeSessions.filter(game => game.players.includes(player.id))
    const wins = playerGames.filter(game => 
      game.isCooperative 
        ? game.cooperativeResult === 'victory'
        : game.winner === player.id
    ).length
    const avgScore = playerGames.filter(g => !g.isCooperative).length > 0
      ? (playerGames.filter(g => !g.isCooperative).reduce((sum, game) => sum + (game.scores[player.id] || 0), 0) / playerGames.filter(g => !g.isCooperative).length).toFixed(1)
      : '0.0'
    const deaths = playerGames.filter(game => game.deadCharacters?.[player.id]).length
    
    return {
      player,
      gamesPlayed: playerGames.length,
      wins,
      winRate: playerGames.length > 0 ? ((wins / playerGames.length) * 100).toFixed(1) : '0.0',
      avgScore: parseFloat(avgScore),
      deaths
    }
  }).filter(stat => stat.gamesPlayed > 0)
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)

  const GameDetailDialog = ({ game }: { game: GameSession }) => {
    const winner = getPlayer(game.winner || '')
    const gamePlayers = game.players.map(id => getPlayer(id)).filter(Boolean) as Player[]
    
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GameController size={20} />
            {game.gameType}
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

  if (totalSessions === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GameController size={32} />
              {gameType}
            </h1>
            <p className="text-muted-foreground">Game Statistics</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <GameController size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No sessions found</h3>
            <p className="text-muted-foreground">No completed sessions for this game type</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GameController size={32} />
            {gameType}
          </h1>
          <p className="text-muted-foreground">Game Statistics</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
              <GameController size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(averageDuration)}</p>
              </div>
              <Clock size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Players</p>
                <p className="text-2xl font-bold">{totalPlayers}</p>
                <p className="text-xs text-muted-foreground">different players</p>
              </div>
              <Users size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deaths</p>
                <p className="text-2xl font-bold">{totalDeaths}</p>
                <p className="text-xs text-muted-foreground">total casualties</p>
              </div>
              <Skull size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Mode Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Competitive Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitiveSessions.length}</div>
            <p className="text-sm text-muted-foreground">
              {((competitiveSessions.length / totalSessions) * 100).toFixed(1)}% of all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cooperative Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coopSessions.length}</div>
            <p className="text-sm text-muted-foreground">
              {coopSessions.length > 0 && `${coopWinRate}% win rate (${coopWins} victories)`}
              {coopSessions.length === 0 && '0% of all sessions'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Player Performance */}
      {playerStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Player Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerStats.map((stat) => (
                <div key={stat.player.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getPlayerInitials(stat.player.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{stat.player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.gamesPlayed} games • {stat.wins} wins • {stat.winRate}% win rate
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right">
                    {competitiveSessions.length > 0 && (
                      <div>
                        <div className="font-medium">{stat.avgScore}</div>
                        <div className="text-xs text-muted-foreground">avg score</div>
                      </div>
                    )}
                    {stat.deaths > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <Skull size={16} />
                        <span className="font-medium">{stat.deaths}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions ({totalSessions})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gameTypeSessions.reverse().map((game) => {
              const winner = getPlayer(game.winner || '')
              const gamePlayers = game.players.map(id => getPlayer(id)).filter(Boolean) as Player[]
              const casualtyCount = game.deadCharacters ? Object.values(game.deadCharacters).filter(Boolean).length : 0

              return (
                <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {game.gameType}
                        {game.isCooperative ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users size={12} />
                            Cooperative
                          </Badge>
                        ) : winner ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Trophy size={12} />
                            {winner.name}
                          </Badge>
                        ) : null}
                        {casualtyCount > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Skull size={12} />
                            {casualtyCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(game.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          {game.players.length} players
                        </div>
                        {game.duration && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(game.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={
                      game.isCooperative 
                        ? (game.cooperativeResult === 'victory' ? 'default' : 'destructive')
                        : 'secondary'
                    }>
                      {game.isCooperative 
                        ? (game.cooperativeResult === 'victory' ? 'Victory' : 'Defeat')
                        : 'Competitive'
                      }
                    </Badge>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye size={16} />
                        </Button>
                      </DialogTrigger>
                      <GameDetailDialog game={game} />
                    </Dialog>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
