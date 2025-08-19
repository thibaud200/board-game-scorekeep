import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { Plus, Trophy, Users, BarChart3, Clock, GameController } from '@phosphor-icons/react'
import { PlayerManager } from '@/components/PlayerManager'
import { GameSetup } from '@/components/GameSetup'
import { ActiveGame } from '@/components/ActiveGame'
import { GameHistory } from '@/components/GameHistory'
import { GameTemplates } from '@/components/GameTemplates'
import { PlayerStats } from '@/components/PlayerStats'

export interface Player {
  id: string
  name: string
  avatar?: string
}

export interface GameSession {
  id: string
  gameType: string
  isCooperative: boolean
  players: string[]
  scores: Record<string, number>
  characters?: Record<string, string> // playerId -> character name
  extensions?: string[]
  winner?: string
  winCondition: 'highest' | 'lowest' | 'cooperative'
  date: string
  startTime?: string
  endTime?: string
  duration?: number // in minutes
  completed: boolean
}

export interface GameTemplate {
  name: string
  hasCharacters: boolean
  characters?: string[]
  hasExtensions: boolean
  extensions?: string[]
  isCooperativeByDefault: boolean
}

function App() {
  const [players] = useKV<Player[]>('players', [])
  const [gameHistory] = useKV<GameSession[]>('gameHistory', [])
  const [gameTemplates] = useKV<GameTemplate[]>('gameTemplates', [
    {
      name: 'Cthulhu',
      hasCharacters: true,
      characters: ['Investigator', 'Detective', 'Journalist', 'Professor', 'Doctor', 'Mystic'],
      hasExtensions: true,
      extensions: ['Dunwich Horror', 'King in Yellow', 'The Lurker at the Threshold'],
      isCooperativeByDefault: true
    },
    {
      name: 'Demeure de l\'Épouvante',
      hasCharacters: true,
      characters: ['Explorer', 'Scholar', 'Occultist', 'Psychic', 'Dilettante', 'Athlete'],
      hasExtensions: true,
      extensions: ['Widow\'s Walk', 'Cosmic Horror'],
      isCooperativeByDefault: true
    }
  ])
  const [currentGame, setCurrentGame] = useKV<GameSession | null>('currentGame', null)
  const [showGameSetup, setShowGameSetup] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const completedGames = gameHistory.filter(game => game.completed)
  const recentGames = completedGames.slice(-3).reverse()

  const handleStartGame = () => {
    if (players.length < 2) {
      setActiveTab('players')
      return
    }
    setShowGameSetup(true)
  }

  if (showGameSetup) {
    return (
      <GameSetup 
        players={players}
        gameTemplates={gameTemplates}
        onCancel={() => setShowGameSetup(false)}
        onStartGame={(game) => {
          setCurrentGame(game)
          setShowGameSetup(false)
          setActiveTab('game')
        }}
      />
    )
  }

  if (currentGame && !currentGame.completed) {
    return (
      <ActiveGame 
        game={currentGame}
        players={players}
        onGameComplete={() => {
          setCurrentGame(null)
          setActiveTab('dashboard')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Board Game Tracker</h1>
          <p className="text-muted-foreground">Track scores, celebrate wins, and build your gaming legacy</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Trophy size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users size={16} />
              Players
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <GameController size={16} />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock size={16} />
              History
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Stats
            </TabsTrigger>
            <TabsTrigger value="game" disabled={!currentGame}>
              Game
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{players.length}</div>
                  <p className="text-sm text-muted-foreground">Active players</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={20} />
                    Games Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{completedGames.length}</div>
                  <p className="text-sm text-muted-foreground">Total completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleStartGame} className="w-full" size="lg">
                    <Plus size={20} className="mr-2" />
                    New Game
                  </Button>
                  {players.length < 2 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Add at least 2 players to start
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {recentGames.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGames.map((game) => {
                      const winner = players.find(p => p.id === game.winner)
                      return (
                        <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {game.gameType}
                              {game.isCooperative && (
                                <Badge variant="outline" className="text-xs">
                                  <Users size={12} className="mr-1" />
                                  Coop
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(game.date).toLocaleDateString()}
                              {game.duration && ` • ${Math.floor(game.duration / 60)}h ${game.duration % 60}m`}
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
          </TabsContent>

          <TabsContent value="players">
            <PlayerManager />
          </TabsContent>

          <TabsContent value="templates">
            <GameTemplates />
          </TabsContent>

          <TabsContent value="history">
            <GameHistory />
          </TabsContent>

          <TabsContent value="stats">
            <PlayerStats />
          </TabsContent>

          <TabsContent value="game">
            {currentGame && !currentGame.completed && (
              <ActiveGame 
                game={currentGame}
                players={players}
                onGameComplete={() => {
                  setCurrentGame(null)
                  setActiveTab('dashboard')
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App