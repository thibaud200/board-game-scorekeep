import { useState, useEffect } from 'react'
import { useDatabase } from './database-context'
import { Player, GameSession, GameTemplate } from '@/App'

// Hook for players data
export function usePlayers() {
  const { db } = useDatabase()
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshPlayers = async () => {
    if (!db) return
    try {
      const data = await db.getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error('Failed to load players:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshPlayers()
  }, [db])

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    if (!db) return
    try {
      const newPlayer = await db.addPlayer(player)
      setPlayers(prev => [...prev, newPlayer])
      return newPlayer
    } catch (error) {
      console.error('Failed to add player:', error)
      throw error
    }
  }

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    if (!db) return
    try {
      const updated = await db.updatePlayer(id, updates)
      setPlayers(prev => prev.map(p => p.id === id ? updated : p))
      return updated
    } catch (error) {
      console.error('Failed to update player:', error)
      throw error
    }
  }

  const deletePlayer = async (id: string) => {
    if (!db) return
    try {
      await db.deletePlayer(id)
      setPlayers(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete player:', error)
      throw error
    }
  }

  return {
    players,
    isLoading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    refreshPlayers
  }
}

// Hook for game history
export function useGameHistory() {
  const { db } = useDatabase()
  const [gameHistory, setGameHistory] = useState<GameSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshGameHistory = async () => {
    if (!db) return
    try {
      const data = await db.getGameHistory()
      setGameHistory(data)
    } catch (error) {
      console.error('Failed to load game history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshGameHistory()
  }, [db])

  const addGameSession = async (session: Omit<GameSession, 'id'>) => {
    if (!db) return
    try {
      const newSession = await db.addGameSession(session)
      setGameHistory(prev => [newSession, ...prev])
      return newSession
    } catch (error) {
      console.error('Failed to add game session:', error)
      throw error
    }
  }

  const updateGameSession = async (id: string, updates: Partial<GameSession>) => {
    if (!db) return
    try {
      const updated = await db.updateGameSession(id, updates)
      setGameHistory(prev => prev.map(s => s.id === id ? updated : s))
      return updated
    } catch (error) {
      console.error('Failed to update game session:', error)
      throw error
    }
  }

  const deleteGameSession = async (id: string) => {
    if (!db) return
    try {
      await db.deleteGameSession(id)
      setGameHistory(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to delete game session:', error)
      throw error
    }
  }

  return {
    gameHistory,
    isLoading,
    addGameSession,
    updateGameSession,
    deleteGameSession,
    refreshGameHistory
  }
}

// Hook for game templates
export function useGameTemplates() {
  const { db } = useDatabase()
  const [gameTemplates, setGameTemplates] = useState<GameTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshGameTemplates = async () => {
    if (!db) return
    try {
      const data = await db.getGameTemplates()
      setGameTemplates(data)
    } catch (error) {
      console.error('Failed to load game templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshGameTemplates()
  }, [db])

  const addGameTemplate = async (template: GameTemplate) => {
    if (!db) return
    try {
      const newTemplate = await db.addGameTemplate(template)
      setGameTemplates(prev => [...prev, newTemplate])
      return newTemplate
    } catch (error) {
      console.error('Failed to add game template:', error)
      throw error
    }
  }

  const updateGameTemplate = async (name: string, updates: Partial<GameTemplate>) => {
    if (!db) return
    try {
      const updated = await db.updateGameTemplate(name, updates)
      setGameTemplates(prev => prev.map(t => t.name === name ? updated : t))
      return updated
    } catch (error) {
      console.error('Failed to update game template:', error)
      throw error
    }
  }

  const deleteGameTemplate = async (name: string) => {
    if (!db) return
    try {
      await db.deleteGameTemplate(name)
      setGameTemplates(prev => prev.filter(t => t.name !== name))
    } catch (error) {
      console.error('Failed to delete game template:', error)
      throw error
    }
  }

  return {
    gameTemplates,
    isLoading,
    addGameTemplate,
    updateGameTemplate,
    deleteGameTemplate,
    refreshGameTemplates
  }
}

// Hook for current game
export function useCurrentGame() {
  const { db } = useDatabase()
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCurrentGame = async () => {
    if (!db) return
    try {
      const data = await db.getCurrentGame()
      setCurrentGame(data)
    } catch (error) {
      console.error('Failed to load current game:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCurrentGame()
  }, [db])

  const updateCurrentGame = async (game: GameSession | null) => {
    if (!db) return
    try {
      await db.setCurrentGame(game)
      setCurrentGame(game)
    } catch (error) {
      console.error('Failed to update current game:', error)
      throw error
    }
  }

  return {
    currentGame,
    isLoading,
    setCurrentGame: updateCurrentGame,
    refreshCurrentGame
  }
}
