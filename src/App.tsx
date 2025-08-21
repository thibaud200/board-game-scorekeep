import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { GameSetup } from '@/components/game/GameSetup'
import { ActiveGame } from '@/components/game/ActiveGame'
import { Dashboard } from '@/components/Dashboard'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar'
import { DatabaseProvider, useDatabase } from '@/lib/database-context'
import { usePlayers, useGameHistory, useGameTemplates, useCurrentGame } from '@/lib/database-hooks'

export interface Player {
  id: string
  name: string
  avatar?: string
}

export interface Character {
  name?: string
  type?: string
}

export interface CharacterEvent {
  playerId: string
  playerName: string
  characterName: string
  characterType?: string // e.g., "Psychic", "Medic", etc.
  eventType: 'initial' | 'death' | 'replacement'
  timestamp?: string
  previousCharacter?: {
    name: string
    type?: string
  }
}

export interface GameSession {
  id: string
  gameTemplate: string
  gameType?: string // Added for backward compatibility
  players: string[]
  scores: Record<string, number>
  startTime: string
  endTime?: string
  duration?: string | number // Allow both string and number
  date?: string // Added missing date property
  gameMode: 'cooperative' | 'competitive' | 'campaign'
  isCooperative: boolean // Deprecated: keep for backward compatibility
  cooperativeResult?: 'victory' | 'defeat'
  characters?: Record<string, Character | string>
  characterHistory?: CharacterEvent[]
  allowResurrection?: boolean
  completed?: boolean // Added missing completed property
  winner?: string // Added missing winner property
  winCondition?: 'highest' | 'lowest' | 'cooperative' // Added 'cooperative' option
  extensions?: string[] // Added missing extensions property
  deadCharacters?: Record<string, boolean> // Added missing deadCharacters property
  newCharacterNames?: Record<string, string> // Added missing newCharacterNames property
}

export interface GameTemplate {
  name: string
  hasCharacters: boolean
  characters?: string[]
  hasExtensions: boolean
  extensions?: string[]
  // Game modes that this template supports (can be combined)
  supportsCooperative: boolean
  supportsCompetitive: boolean
  supportsCampaign: boolean
  // Default mode when creating a new game with this template
  defaultMode: 'cooperative' | 'competitive' | 'campaign'
}

function AppContent() {
  const { players } = usePlayers()
  const { gameHistory } = useGameHistory()
  const { gameTemplates } = useGameTemplates()
  const { currentGame, setCurrentGame } = useCurrentGame()
  const { isLoading: dbLoading } = useDatabase()
  
  const [showGameSetup, setShowGameSetup] = useState(false)

  // Show loading while database initializes
  if (dbLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing database...</p>
        </div>
      </div>
    )
  }

  if (showGameSetup) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarHeader>
              <h2 className="text-lg font-semibold">Accessibility</h2>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    Keyboard Navigation
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    Screen Reader Mode
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    High Contrast
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    Text Size
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1">
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-800">
              <span>💡 Astuce : Utilisez </span>
              <SidebarTrigger className="inline-flex items-center gap-1 font-medium hover:underline">
                ce bouton
              </SidebarTrigger>
              <span> ou Ctrl+B pour ouvrir le menu d'accessibilité</span>
            </div>
            <GameSetup 
              players={players}
              gameTemplates={gameTemplates}
              onCancel={() => setShowGameSetup(false)}
              onStartGame={(game) => {
                setCurrentGame(game)
                setShowGameSetup(false)
              }}
            />
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    )
  }

  if (currentGame && !currentGame.endTime) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarHeader>
              <h2 className="text-lg font-semibold">Accessibility</h2>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    Keyboard Navigation
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    Screen Reader Mode
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    High Contrast
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    Text Size
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1">
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-800">
              <span>💡 Astuce : Utilisez </span>
              <SidebarTrigger className="inline-flex items-center gap-1 font-medium hover:underline">
                ce bouton
              </SidebarTrigger>
              <span> ou Ctrl+B pour ouvrir le menu d'accessibilité</span>
            </div>
            <ActiveGame 
              game={currentGame}
              players={players}
              onGameComplete={() => setCurrentGame(null)}
            />
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold">Accessibility</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  Keyboard Navigation
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  Screen Reader Mode
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  High Contrast
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  Text Size
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 bg-background">
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-800">
            <span>💡 Astuce : Utilisez </span>
            <SidebarTrigger className="inline-flex items-center gap-1 font-medium hover:underline">
              ce bouton
            </SidebarTrigger>
            <span> ou Ctrl+B pour ouvrir le menu d'accessibilité</span>
          </div>
          <Dashboard 
            players={players}
            gameTemplates={gameTemplates}
            onStartGame={() => setShowGameSetup(true)}
          />
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  )
}

export default App