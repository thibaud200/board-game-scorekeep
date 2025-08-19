import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Target, Calendar } from '@phosphor-icons/react'
import { Player, GameSession } from '@/App'

export function PlayerStats() {
  const [players] = useKV<Player[]>('players', [])
  const [gameHistory] = useKV<GameSession[]>('gameHistory', [])

  const completedGames = gameHistory.filter(game => game.completed)

  const getPlayerStats = (player: Player) => {
    const playerGames = completedGames.filter(game => game.players.includes(player.id))
    const wins = completedGames.filter(game => game.winner === player.id).length
    const winRate = playerGames.length > 0 ? (wins / playerGames.length) * 100 : 0
    
    const totalScore = playerGames.reduce((sum, game) => sum + (game.scores[player.id] || 0), 0)
    const averageScore = playerGames.length > 0 ? totalScore / playerGames.length : 0

    const gameTypes = new Set(playerGames.map(game => game.gameType))
    
    return {
      gamesPlayed: playerGames.length,
      wins,
      winRate,
      averageScore,
      gameTypes: gameTypes.size,
      lastPlayed: playerGames.length > 0 ? new Date(Math.max(...playerGames.map(g => new Date(g.date).getTime()))) : null
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

  const getTopPerformer = () => {
    if (players.length === 0) return null
    
    return players.reduce((best, player) => {
      const stats = getPlayerStats(player)
      const bestStats = getPlayerStats(best)
      
      if (stats.wins > bestStats.wins) return player
      if (stats.wins === bestStats.wins && stats.winRate > bestStats.winRate) return player
      return best
    })
  }

  const getMostActivePlayer = () => {
    if (players.length === 0) return null
    
    return players.reduce((mostActive, player) => {
      const stats = getPlayerStats(player)
      const mostActiveStats = getPlayerStats(mostActive)
      return stats.gamesPlayed > mostActiveStats.gamesPlayed ? player : mostActive
    })
  }

  const topPerformer = getTopPerformer()
  const mostActive = getMostActivePlayer()

  if (players.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Player Statistics</h2>
          <p className="text-muted-foreground">Player performance and game statistics</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No players added yet</h3>
            <p className="text-muted-foreground">Add players to see their statistics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Player Statistics</h2>
        <p className="text-muted-foreground">Performance across all games</p>
      </div>

      {completedGames.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {topPerformer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-accent" size={20} />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                      {getPlayerInitials(topPerformer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{topPerformer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getPlayerStats(topPerformer).wins} wins • {getPlayerStats(topPerformer).winRate.toFixed(1)}% win rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {mostActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-secondary" size={20} />
                  Most Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                      {getPlayerInitials(mostActive.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{mostActive.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getPlayerStats(mostActive).gamesPlayed} games played
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => {
          const stats = getPlayerStats(player)
          
          return (
            <Card key={player.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {getPlayerInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{player.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.gamesPlayed === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No games played yet</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{stats.wins}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{stats.gamesPlayed}</div>
                        <div className="text-xs text-muted-foreground">Games</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Win Rate</span>
                        <span>{stats.winRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={stats.winRate} className="h-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Score</span>
                        <span className="font-medium">{stats.averageScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Game Types</span>
                        <span className="font-medium">{stats.gameTypes}</span>
                      </div>
                      {stats.lastPlayed && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Played</span>
                          <span className="font-medium">
                            {stats.lastPlayed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    {stats.wins > 0 && (
                      <Badge variant="secondary" className="w-full justify-center">
                        <Trophy size={12} className="mr-1" />
                        {stats.wins} {stats.wins === 1 ? 'Victory' : 'Victories'}
                      </Badge>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}