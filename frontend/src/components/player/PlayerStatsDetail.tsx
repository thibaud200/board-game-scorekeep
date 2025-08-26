import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Trophy, Users, GameController, Calendar, Clock, Eye, Skull, User } from '@phosphor-icons/react'
import { Player, GameSession } from '@/App'
import { useGameHistory } from '@/lib/database-hooks'

interface PlayerStatsDetailProps {
  player: Player
  onBack: () => void
}

export function PlayerStatsDetail({ player, onBack }: PlayerStatsDetailProps) {
  const { gameHistory } = useGameHistory()

  const playerGames = gameHistory.filter(game => 
    game.completed && game.players.includes(player.id)
  )

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
  const totalGames = playerGames.length
  const coopGames = playerGames.filter(game => game.isCooperative)
  const competitiveGames = playerGames.filter(game => !game.isCooperative)
  const wins = competitiveGames.filter(game => game.winner === player.id).length
  const coopWins = coopGames.filter(game => game.cooperativeResult === 'victory').length
  const totalWins = wins + coopWins
  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0'
  
  const deathCount = playerGames.filter(game => game.deadCharacters?.[player.id]).length
  const averageScore = competitiveGames.length > 0 
    ? (competitiveGames.reduce((sum, game) => sum + (game.scores[player.id] || 0), 0) / competitiveGames.length).toFixed(1)
    : '0.0'
  
  const totalDuration = playerGames.reduce((sum, game) => {
    const duration = typeof game.duration === 'string' ? parseFloat(game.duration) : (game.duration || 0)
    return sum + duration
  }, 0)
  const averageDuration = totalGames > 0 ? Math.round(totalDuration / totalGames) : 0

  // Game types played
  const gameTypes = [...new Set(playerGames.map(game => game.gameTemplate))]

  const GameDetailDialog = ({ game }: { game: GameSession }) => {
    const winner = game.winner ? gameHistory.find(g => g.players.includes(game.winner!)) : null
    const gamePlayers = game.players.map(id => {
      // Find player name from the game context or current players
      return { id, name: id === player.id ? player.name : `Player ${id}` }
    })
    
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GameController size={20} />
            {game.gameTemplate}
          </DialogTitle>
          <DialogDescription>
            Detailed view of this game session
          </DialogDescription>
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

          {/* Extensions utilisées */}
          {Array.isArray(game.extensions) && game.extensions.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Extensions utilisées</div>
              <div className="flex flex-wrap gap-2">
                {game.extensions.map((ext, idx) => (
                  <Badge key={idx} variant="outline">{ext}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Character History */}
          {game.characterHistory && game.characterHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User size={16} />
                Character History
              </h4>
              <div className="space-y-2">
                {(() => {
                  const playerEvents = game.characterHistory.filter(event => event.playerId === player.id)
                  
                  // Group events by character progression
                  const characterProgressions: Array<{
                    initialCharacter: string
                    initialType?: string
                    died: boolean
                    replacements: Array<{name: string, type?: string}>
                  }> = []
                  
                  let currentProgression: any = null
                  
                  playerEvents.forEach(event => {
                    if (event.eventType === 'initial') {
                      // Start a new progression
                      currentProgression = {
                        initialCharacter: event.characterName,
                        initialType: event.characterType,
                        died: false,
                        replacements: []
                      }
                      characterProgressions.push(currentProgression)
                    } else if (event.eventType === 'death' && currentProgression) {
                      currentProgression.died = true
                    } else if (event.eventType === 'replacement' && currentProgression) {
                      currentProgression.replacements.push({
                        name: event.characterName,
                        type: event.characterType
                      })
                    }
                  })
                  
                  return characterProgressions.map((progression, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg text-sm">
                      <div className="flex-shrink-0">
                        🎭
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {progression.initialCharacter}
                          {progression.initialType && ` (${progression.initialType})`}
                          {progression.died && progression.replacements.length === 0 && (
                            <span className="text-red-600 ml-2">💀 Died</span>
                          )}
                          {progression.replacements.length > 0 && (
                            <span className="text-orange-600 ml-2">
                              → {progression.replacements.map(r => 
                                `${r.name}${r.type ? ` (${r.type})` : ''}`
                              ).join(' → ')}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {progression.replacements.length > 0 
                            ? `Character progression (${progression.replacements.length + 1} characters)`
                            : progression.died 
                              ? 'Character died during the game'
                              : 'Survived the entire game'
                          }
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* Player's performance */}
          <div>
            <h3 className="font-medium mb-3">Your Performance</h3>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={game.deadCharacters?.[player.id] ? 'bg-red-100 text-red-600' : ''}>
                      {getPlayerInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.name}</span>
                      {game.deadCharacters?.[player.id] && <Skull size={16} className="text-red-500" />}
                      {game.winner === player.id && <Trophy size={16} className="text-yellow-500" />}
                    </div>
                    {game.newCharacterNames?.[player.id] && (
                      <div className="text-sm text-muted-foreground">
                        New character: {game.newCharacterNames[player.id]}
                      </div>
                    )}
                  </div>
                </div>
                
                {!game.isCooperative && (
                  <div className="text-right">
                    <div className="font-bold text-lg">{game.scores[player.id] || 0}</div>
                    <div className="text-sm text-muted-foreground">points</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (totalGames === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground">Player Statistics</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No games played yet</h3>
            <p className="text-muted-foreground">This player hasn't participated in any completed games</p>
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
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <p className="text-muted-foreground">Player Statistics</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{totalGames}</p>
              </div>
              <GameController size={24} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-xs text-muted-foreground">{totalWins} wins</p>
              </div>
              <Trophy size={24} className="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{averageScore}</p>
                <p className="text-xs text-muted-foreground">competitive games</p>
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
                <p className="text-2xl font-bold">{deathCount}</p>
                <p className="text-xs text-muted-foreground">characters lost</p>
              </div>
              <Skull size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Types */}
      <Card>
        <CardHeader>
          <CardTitle>Game Types Played ({gameTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {gameTypes.map(gameType => {
              const gameCount = playerGames.filter(g => g.gameTemplate === gameType).length
              return (
                <Badge key={gameType} variant="outline">
                  {gameType} ({gameCount})
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>All Games ({totalGames})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playerGames.reverse().map((game) => {
              const isWinner = game.winner === player.id
              const isCoopVictory = game.isCooperative && game.cooperativeResult === 'victory'
              const isDead = game.deadCharacters?.[player.id]
              const score = game.scores[player.id] || 0

              return (
                <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {game.gameTemplate}
                        {(isWinner || isCoopVictory) && <Trophy size={16} className="text-yellow-500" />}
                        {isDead && <Skull size={16} className="text-red-500" />}
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
                    {!game.isCooperative && (
                      <div className="text-right">
                        <div className="font-bold">{score}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    )}
                    
                    <Badge variant={
                      game.isCooperative 
                        ? (game.cooperativeResult === 'victory' ? 'default' : 'destructive')
                        : (isWinner ? 'default' : 'secondary')
                    }>
                      {game.isCooperative 
                        ? (game.cooperativeResult === 'victory' ? 'Victory' : 'Defeat')
                        : (isWinner ? 'Won' : 'Lost')
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
