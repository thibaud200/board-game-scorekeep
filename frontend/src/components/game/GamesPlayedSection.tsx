import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GameController, Trophy, Users, Clock, Skull, Eye } from '@phosphor-icons/react'
import { useGameHistory } from '@/lib/database-hooks'
import { GameTypeDetail } from '@/components/game/GameTypeDetail'

interface GamesPlayedSectionProps {
  onBack: () => void
}

export function GamesPlayedSection({ onBack }: GamesPlayedSectionProps) {
  const { gameHistory } = useGameHistory()
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null)

  if (selectedGameType) {
    return (
      <GameTypeDetail 
        gameType={selectedGameType} 
        onBack={() => setSelectedGameType(null)} 
      />
    )
  }

  const completedGames = gameHistory.filter(game => game.completed)
  
  // Group games by type and calculate statistics
  const gameTypeStats = completedGames.reduce((acc, game) => {
    const gameType = game.gameMode || game.gameTemplate || 'Unknown'
    if (!acc[gameType]) {
      acc[gameType] = {
        gameType: gameType,
        totalSessions: 0,
        coopSessions: 0,
        competitiveSessions: 0,
        coopWins: 0,
        totalDuration: 0,
        totalDeaths: 0,
        uniquePlayers: new Set<string>(),
        lastPlayed: game.date || ''
      }
    }
    
    const stat = acc[gameType]
    stat.totalSessions++
    
    if (game.isCooperative) {
      stat.coopSessions++
      if (game.cooperativeResult === 'victory') {
        stat.coopWins++
      }
    } else {
      stat.competitiveSessions++
    }
    
    const duration = typeof game.duration === 'string' ? parseFloat(game.duration) : (game.duration || 0)
    stat.totalDuration += duration
    game.players.forEach(playerId => stat.uniquePlayers.add(playerId))
    
    if (game.deadCharacters) {
      stat.totalDeaths += Object.values(game.deadCharacters).filter(Boolean).length
    }
    
    // Keep the most recent date
    if (game.date && stat.lastPlayed && new Date(game.date) > new Date(stat.lastPlayed)) {
      stat.lastPlayed = game.date
    } else if (game.date && !stat.lastPlayed) {
      stat.lastPlayed = game.date
    }
    
    return acc
  }, {} as Record<string, {
    gameType: string
    totalSessions: number
    coopSessions: number
    competitiveSessions: number
    coopWins: number
    totalDuration: number
    totalDeaths: number
    uniquePlayers: Set<string>
    lastPlayed: string
  }>)

  const gameTypes = Object.values(gameTypeStats).sort((a, b) => b.totalSessions - a.totalSessions)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'Unknown'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const totalSessions = completedGames.length
  const totalGameTypes = gameTypes.length
  const totalDuration = completedGames.reduce((sum, game) => {
    const duration = typeof game.duration === 'string' ? parseFloat(game.duration) : (game.duration || 0)
    return sum + duration
  }, 0)
  const totalDeaths = completedGames.reduce((sum, game) => 
    sum + (game.deadCharacters ? Object.values(game.deadCharacters).filter(Boolean).length : 0), 0
  )

  if (gameTypes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Games Played</h1>
            <p className="text-muted-foreground">Overview of all game types and sessions</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <GameController size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No games completed yet</h3>
            <p className="text-muted-foreground">Complete your first game to see statistics here</p>
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
          <h1 className="text-3xl font-bold">Games Played</h1>
          <p className="text-muted-foreground">Overview of all game types and sessions</p>
        </div>
      </div>

      {/* Overall Statistics */}
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
                <p className="text-sm font-medium text-muted-foreground">Game Types</p>
                <p className="text-2xl font-bold">{totalGameTypes}</p>
              </div>
              <Trophy size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
              </div>
              <Clock size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deaths</p>
                <p className="text-2xl font-bold">{totalDeaths}</p>
              </div>
              <Skull size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Game Types ({totalGameTypes})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gameTypes.map((stat) => {
              const avgDuration = stat.totalSessions > 0 ? Math.round(stat.totalDuration / stat.totalSessions) : 0
              const coopWinRate = stat.coopSessions > 0 ? ((stat.coopWins / stat.coopSessions) * 100).toFixed(1) : '0.0'

              return (
                <div 
                  key={stat.gameType} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedGameType(stat.gameType)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                      <GameController size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">{stat.gameType}</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{stat.totalSessions} sessions</span>
                        <span>•</span>
                        <span>{stat.uniquePlayers.size} players</span>
                        <span>•</span>
                        <span>Last played {formatDate(stat.lastPlayed)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                      <div className="font-medium">{formatDuration(avgDuration)}</div>
                    </div>

                    {stat.coopSessions > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Coop Win Rate</div>
                        <div className="font-medium">{coopWinRate}%</div>
                      </div>
                    )}

                    {stat.totalDeaths > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Deaths</div>
                        <div className="font-medium flex items-center gap-1">
                          <Skull size={16} className="text-red-500" />
                          {stat.totalDeaths}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {stat.competitiveSessions > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {stat.competitiveSessions} Competitive
                        </Badge>
                      )}
                      {stat.coopSessions > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {stat.coopSessions} Cooperative
                        </Badge>
                      )}
                    </div>

                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
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
