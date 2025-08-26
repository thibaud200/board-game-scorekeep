import { useState, useEffect } from 'react'
import { useDatabase } from './database-context'
import { GameTemplate } from '@/types'
import { logger } from '@/lib/logger';

// Hook for players data
export function usePlayers() {
  const { db } = useDatabase()
  const [players, setPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshPlayers = async () => {
    if (!db) {
      // Si pas de db, fallback localStorage direct
      const local = window.localStorage.getItem('players')
      if (local) {
        setPlayers(JSON.parse(local))
        console.warn('Fallback localStorage activé pour les joueurs (pas de db).')
      } else {
        setPlayers([])
      }
      setIsLoading(false)
      return
    }
    try {
      // Toujours tenter la BDD/API d'abord
      const data = await db.getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error('Failed to load players from BDD/API:', error)
      // Fallback localStorage uniquement si la BDD/API échoue
      const local = window.localStorage.getItem('players')
      if (local) {
        setPlayers(JSON.parse(local))
        console.warn('Fallback localStorage activé pour les joueurs.')
      } else {
        setPlayers([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshPlayers()
  }, [db])

  const addPlayer = async (player: Omit<any, 'id'>) => {
  logger.debug('addPlayer called with: ' + JSON.stringify(player));
    if (!db) return
    try {
      const newPlayer = await db.addPlayer(player)
      setPlayers(prev => [...prev, newPlayer])
      logger.info('Player added: ' + (newPlayer?.name || JSON.stringify(newPlayer)));
      return newPlayer
    } catch (error) {
      logger.error('Failed to add player: ' + (error instanceof Error ? error.message : String(error)));
      throw error
    }
  }

  const updatePlayer = async (id: string, updates: Partial<any>) => {
  logger.debug('updatePlayer called with id: ' + id + ', updates: ' + JSON.stringify(updates));
    if (!db) return
    try {
      const updated = await db.updatePlayer(id, updates)
      setPlayers(prev => prev.map(p => p.id === id ? updated : p))
      logger.info('Player updated: ' + id);
      return updated
    } catch (error) {
      logger.error('Failed to update player: ' + (error instanceof Error ? error.message : String(error)));
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
  const [gameHistory, setGameHistory] = useState<any[]>([])
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

  const addGameSession = async (session: Omit<any, 'id'>) => {
  logger.debug('addGameSession called with: ' + JSON.stringify(session));
    if (!db) return
    try {
      const newSession = await db.addGameSession(session)
      setGameHistory(prev => [newSession, ...prev])
      logger.info('Game session added: ' + (newSession?.id || JSON.stringify(newSession)));
      return newSession
    } catch (error) {
      logger.error('Failed to add game session: ' + (error instanceof Error ? error.message : String(error)));
      throw error
    }
  }

  const updateGameSession = async (id: string, updates: Partial<any>) => {
  logger.debug('updateGameSession called with id: ' + id + ', updates: ' + JSON.stringify(updates));
    if (!db) return
    try {
      const updated = await db.updateGameSession(id, updates)
      setGameHistory(prev => prev.map(s => s.id === id ? updated : s))
      logger.info('Game session updated: ' + id);
      return updated
    } catch (error) {
      logger.error('Failed to update game session: ' + (error instanceof Error ? error.message : String(error)));
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
  logger.debug('addGameTemplate called with: ' + JSON.stringify(template));
    if (!db) return
    try {
      const newTemplate = await db.addGameTemplate(template)
      setGameTemplates(prev => [...prev, newTemplate])
      logger.info('Game template added: ' + (newTemplate?.name || JSON.stringify(newTemplate)));
      return newTemplate
    } catch (error) {
      logger.error('Failed to add game template: ' + (error instanceof Error ? error.message : String(error)));
      throw error
    }
  }

  const updateGameTemplate = async (id: string, updates: Partial<GameTemplate>) => {
  logger.debug('updateGameTemplate called with id: ' + id + ', updates: ' + JSON.stringify(updates));
    if (!db) return
    try {
      const updated = await db.updateGameTemplate(String(id), updates)
      setGameTemplates(prev => prev.map(t => String(t.id) === String(id) ? updated : t))
      logger.info('Game template updated: ' + id);
      return updated
    } catch (error) {
      logger.error('Failed to update game template: ' + (error instanceof Error ? error.message : String(error)));
      throw error
    }
  }

  const deleteGameTemplate = async (id: string) => {
    if (!db) return
    try {
      await db.deleteGameTemplate(Number(id))
      setGameTemplates(prev => prev.filter(t => t.id !== Number(id)))
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
  const [currentGame, setCurrentGame] = useState<any | null>(null)
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

  const updateCurrentGame = async (game: any | null) => {
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
