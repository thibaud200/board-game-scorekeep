import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { GameSetup } from '@/components/GameSetup'
import { ActiveGame } from '@/components/ActiveGame'
import { Dashboard } from '@/components/Dashboard'

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

  if (showGameSetup) {
    return (
      <GameSetup 
        players={players}
        gameTemplates={gameTemplates}
        onCancel={() => setShowGameSetup(false)}
        onStartGame={(game) => {
          setCurrentGame(game)
          setShowGameSetup(false)
        }}
      />
    )
  }

  if (currentGame && !currentGame.completed) {
    return (
      <ActiveGame 
        game={currentGame}
        players={players}
        onGameComplete={() => setCurrentGame(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard 
        players={players}
        gameHistory={gameHistory}
        gameTemplates={gameTemplates}
        onStartGame={() => setShowGameSetup(true)}
      />
      <Toaster />
    </div>
  )
}

export default App