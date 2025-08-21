import React, { createContext, useContext, useEffect, useState } from 'react'
import { Database } from './database'
import { ServerDatabase } from './server-database'

interface DatabaseContextType {
  db: Database | null
  isLoading: boolean
  error: string | null
  saveToFile: () => Promise<void>
  loadFromFile: () => Promise<void>
  databaseType: 'server' | null
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isLoading: true,
  error: null,
  saveToFile: async () => {},
  loadFromFile: async () => {},
  databaseType: null
})

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

interface DatabaseProviderProps {
  children: React.ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<Database | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [databaseType, setDatabaseType] = useState<'server' | null>(null)

  useEffect(() => {
    async function initDatabase() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Initialize Server database (file-based, independent of browser)
        console.log('Attempting to initialize Server database...')
        const database = new ServerDatabase()
        await database.init()
        
        setDb(database)
        setDatabaseType('server')
        console.log('Server database initialized successfully')
      } catch (err) {
        console.error('Server database initialization failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize server database')
      } finally {
        setIsLoading(false)
      }
    }

    initDatabase()
  }, [])

  const saveToFile = async () => {
    // Server database already stores in project directory
    console.log('Server database automatically saves to project directory')
  }

  const loadFromFile = async () => {
    // Server database already loads from project directory
    console.log('Server database automatically loads from project directory')
  }

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error, saveToFile, loadFromFile, databaseType }}>
      {children}
    </DatabaseContext.Provider>
  )
}
