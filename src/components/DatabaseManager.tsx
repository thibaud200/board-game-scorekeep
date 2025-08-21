import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Database, AlertCircle } from 'lucide-react'
import { useDatabase } from '@/lib/database-context'
import { Alert, AlertDescription } from './ui/alert'

export function DatabaseManager() {
  const { error } = useDatabase()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Management
        </CardTitle>
        <CardDescription>
          Current storage: <strong>Server database (file-based)</strong>
          {' - Game data is automatically saved to the project directory.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Database Error: {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>• Game data is automatically saved to <code>database/board-game-tracker.db</code> in your project directory</p>
          <p>• Data persists between browser sessions and is independent of browser storage</p>
          <p>• No manual file operations needed - everything is handled automatically</p>
        </div>
      </CardContent>
    </Card>
  )
}
