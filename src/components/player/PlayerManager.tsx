import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Trash, PencilSimple, Users } from '@phosphor-icons/react'
import { Player } from '@/App'
import { useDatabase } from '@/lib/database-context'
import { toast } from 'sonner'

interface PlayerManagerProps {
  players: Player[]
}

export function PlayerManager({ players }: PlayerManagerProps) {
  const { db } = useDatabase()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [playerName, setPlayerName] = useState('')

  const handleAddPlayer = async () => {
    if (!playerName.trim() || !db) return

    try {
      await db.addPlayer({ name: playerName.trim() })
      setPlayerName('')
      setShowAddDialog(false)
      toast.success('Player added successfully')
      // Parent component will refresh players list
    } catch (error) {
      toast.error('Failed to add player')
    }
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setPlayerName(player.name)
  }

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !playerName.trim() || !db) return

    try {
      await db.updatePlayer(editingPlayer.id, { name: playerName.trim() })
      setPlayerName('')
      setEditingPlayer(null)
      toast.success('Player updated successfully')
      // Parent component will refresh players list
    } catch (error) {
      toast.error('Failed to update player')
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!db) return
    
    try {
      await db.deletePlayer(playerId)
      toast.success('Player deleted successfully')
      // Parent component will refresh players list
    } catch (error) {
      toast.error('Failed to delete player')
    }
  }

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Players</h2>
          <p className="text-muted-foreground">Manage your gaming group</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playerName">Player Name</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPlayer} disabled={!playerName.trim()}>
                  Add Player
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editPlayerName">Player Name</Label>
              <Input
                id="editPlayerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdatePlayer()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdatePlayer} disabled={!playerName.trim()}>
                Update Player
              </Button>
              <Button variant="outline" onClick={() => setEditingPlayer(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No players yet</h3>
            <p className="text-muted-foreground mb-4">Add your first player to get started</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus size={16} className="mr-2" />
              Add First Player
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {getPlayerInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{player.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlayer(player)}
                    >
                      <PencilSimple size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}