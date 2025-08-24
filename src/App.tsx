export interface GameTemplate {
  name: string
  hasCharacters: boolean
  characters?: string[]
  isCooperativeByDefault?: boolean
  supportsCooperative?: boolean
  supportsCompetitive?: boolean
  supportsCampaign?: boolean
  defaultMode?: 'cooperative' | 'competitive' | 'campaign'
  min_players?: number
  max_players?: number
  description?: string
  image?: string
}
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
  name?: string;
  type?: string;
}

export interface GameSession {
  id: string;
  gameTemplate: string;
  gameMode: 'cooperative' | 'competitive' | 'campaign';
  isCooperative: boolean;
  allowResurrection?: boolean;
  players: string[];
  scores: Record<string, number>;
  characters?: Record<string, { name?: string; type?: string }>;
  extensions?: string[]; // Array of extension names
  startTime?: string;
  winner?: string;
  winCondition?: 'highest' | 'lowest' | 'cooperative';
  date?: string;
  endTime?: string;
  duration?: number;
  completed?: boolean;
  cooperativeResult?: string;
  deadCharacters?: string[];
  newCharacterNames?: string[];
  characterHistory?: any[];
  image?: string;
}

  function AppContent() {
    const { players } = usePlayers()
    const { gameHistory } = useGameHistory()
    const { gameTemplates } = useGameTemplates()
    const { currentGame, setCurrentGame } = useCurrentGame()
    const { isLoading: dbLoading } = useDatabase()
    const [showGameSetup, setShowGameSetup] = useState(false)

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