import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trophy, Users, GameController, ArrowRight } from '@phosphor-icons/react'
import { Player, GameSession, GameTemplate } from '@/App'
import { PlayerSection } from '@/components/sections/PlayerSection'
import { GameTemplateSection } from '@/components/sections/GameTemplateSection'
import { GamesPlayedSection } from '@/components/game/GamesPlayedSection'
import { DatabaseManager } from '@/components/DatabaseManager'
import { useGameHistory } from '@/lib/database-hooks'

interface DashboardProps {
  players: Player[]
  gameTemplates: GameTemplate[]
  onStartGame: () => void
}

export function Dashboard({ players, gameTemplates, onStartGame }: DashboardProps) {
  const { gameHistory } = useGameHistory()
  const [activeSection, setActiveSection] = useState<'dashboard' | 'players' | 'templates' | 'games-played'>('dashboard')

  const completedGames = gameHistory.filter(game => game.completed)
  const recentGames = completedGames.slice(-3).reverse()

  const handleStartGame = () => {
    if (players.length < 2) {
      setActiveSection('players')
      return
    }
    onStartGame()
  }

  if (activeSection === 'players') {
    return (
      <PlayerSection 
        players={players}
        onBack={() => setActiveSection('dashboard')}
      />
    )
  }

  if (activeSection === 'templates') {
    return (
      <GameTemplateSection 
        gameTemplates={gameTemplates}
        onBack={() => setActiveSection('dashboard')}
      />
    )
  }

  if (activeSection === 'games-played') {
    return (
      <GamesPlayedSection 
        onBack={() => setActiveSection('dashboard')}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Board Game Tracker</h1>
        <p className="text-muted-foreground text-sm md:text-base">Track scores, celebrate wins, and build your gaming legacy</p>
      </div>

      {/* Quick Start Section */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Ready to Play?</h2>
                <p className="text-sm text-muted-foreground">Start a new game session</p>
              </div>
              <Button onClick={handleStartGame} size="lg" className="w-full sm:w-auto">
                <Plus size={20} className="mr-2" />
                New Game
              </Button>
            </div>
            {players.length < 2 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Add at least 2 players to start playing
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Players Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('players')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users size={18} />
              Players
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowRight size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{players.length}</div>
            <p className="text-xs text-muted-foreground">Active players</p>
            {players.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {players.slice(0, 3).map((player) => (
                  <Badge key={player.id} variant="outline" className="text-xs">
                    {player.name}
                  </Badge>
                ))}
                {players.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{players.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Games Played Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('games-played')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy size={18} />
              Games Played
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowRight size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{completedGames.length}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
            {completedGames.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  Last played: {completedGames[completedGames.length - 1]?.date ? new Date(completedGames[completedGames.length - 1].date!).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Templates Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1" onClick={() => setActiveSection('templates')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GameController size={18} />
              Game Templates
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowRight size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{gameTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Available games</p>
            {gameTemplates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {gameTemplates.slice(0, 2).map((template) => (
                  <Badge key={template.name} variant="outline" className="text-xs">
                    {template.name}
                  </Badge>
                ))}
                {gameTemplates.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{gameTemplates.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Management */}
      <div className="mb-6">
        <DatabaseManager />
      </div>

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGames.map((game) => {
                const gamePlayers = players.filter(p => game.players.includes(p.id))
                const winner = players.find(p => p.id === game.winner)
                
                return (
                  <div key={game.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2">
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        {game.gameType}
                        {game.isCooperative && (
                          <Badge variant="outline" className="text-xs">
                            <Users size={12} className="mr-1" />
                            Coop
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>{game.date ? new Date(game.date).toLocaleDateString() : 'Unknown date'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{gamePlayers.length} players</span>
                          {game.duration && (
                            <span>• {Math.floor(Number(game.duration) / 60)}h {Number(game.duration) % 60}m</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {game.isCooperative ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Trophy size={14} />
                          Team Victory
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Trophy size={14} />
                          {winner?.name || 'Unknown'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {completedGames.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <GameController size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Games Yet</h3>
            <p className="text-muted-foreground mb-4">Start your first game to see your gaming history</p>
            <Button onClick={handleStartGame} disabled={players.length < 2}>
              <Plus size={16} className="mr-2" />
              Start Your First Game
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}