import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Trophy, Users, Trash, PencilSimple, ChartBar } from '@phosphor-icons/react'
import { Player, GameSession } from '@/types'
import { useDatabase } from '@/lib/database-context'
import { usePlayers, useGameHistory } from '@/lib/database-hooks'
import { PlayerStatsDetail } from '@/components/player/PlayerStatsDetail'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface PlayerSectionProps {
  players: Player[]
  onBack: () => void
}

export function PlayerSection({ players, onBack }: PlayerSectionProps) {
  const { addPlayer: addPlayerToDB, updatePlayer: updatePlayerInDB, deletePlayer: deletePlayerFromDB } = usePlayers()
  const { gameHistory } = useGameHistory()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editName, setEditName] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  if (selectedPlayer) {
    return (
      <PlayerStatsDetail 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    )
  }

  const handleAddPlayer = async () => {
    logger.debug('UI: handleAddPlayer called with name: ' + newPlayerName);
    if (!newPlayerName.trim()) return
    
    if (players.some(p => p.name.toLowerCase() === newPlayerName.toLowerCase())) {
      toast.error('A player with this name already exists')
      return
    }

    try {
      await addPlayerToDB({
        name: newPlayerName.trim()
      })
      setNewPlayerName('')
      toast.success(`Player added successfully`)
    } catch (error) {
      logger.debug('Error adding player: ' + (error instanceof Error ? error.message : String(error)));
      toast.error('Failed to add player')
    }
  }

  const handleEditPlayer = async (player: Player) => {
    logger.debug('UI: handleEditPlayer called for id: ' + player.id + ', new name: ' + editName);
    if (!editName.trim()) return
    
    if (players.some(p => p.id !== player.id && p.name.toLowerCase() === editName.toLowerCase())) {
      toast.error('A player with this name already exists')
      return
    }

    try {
      await updatePlayerInDB(player.id, { name: editName.trim() })
      setEditingPlayer(null)
      setEditName('')
      toast.success('Player updated successfully')
    } catch (error) {
      logger.debug('Error updating player: ' + (error instanceof Error ? error.message : String(error)));
      toast.error('Failed to update player')
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    logger.debug('UI: handleDeletePlayer called for id: ' + playerId);
    try {
      await deletePlayerFromDB(playerId)
      toast.success('Player deleted successfully')
    } catch (error) {
      logger.debug('Error deleting player: ' + (error instanceof Error ? error.message : String(error)));
      toast.error('Failed to delete player')
    }
  }

  const getPlayerStats = (player: Player) => {
    const playerGames = gameHistory.filter(game => 
      game.completed && game.players.includes(player.id)
    )
    
    const coopGames = playerGames.filter(game => game.isCooperative)
    const competitiveGames = playerGames.filter(game => !game.isCooperative)
    const competitiveWins = competitiveGames.filter(game => game.winner === player.id).length
    const coopWins = coopGames.filter(game => 
      game.cooperativeResult === 'victory'
    ).length
    const totalWins = competitiveWins + coopWins
    
    const totalGames = playerGames.length
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0
    
    const competitiveScore = competitiveGames.reduce((sum, game) => 
      sum + (game.scores[player.id] || 0), 0
    )
    const averageScore = competitiveGames.length > 0 
      ? (competitiveScore / competitiveGames.length).toFixed(1) 
      : '0.0'
    
    const recentGames = playerGames.slice(-5).reverse()
    
    return { wins: totalWins, totalGames, winRate, averageScore, recentGames }
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Players</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your gaming group</p>
        </div>
      </div>

      {/* Add Player */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add New Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              className="flex-1"
            />
            <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
              <Plus size={16} className="mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      {players.length > 0 ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const stats = getPlayerStats(player)
            
            return (
              <Card key={player.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-primary" />
                      </div>
                      {player.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPlayer(player)
                          setEditName(player.name)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <PencilSimple size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlayer(player.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.wins}</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalGames}</div>
                      <div className="text-xs text-muted-foreground">Games</div>
                    </div>
                  </div>

                  {stats.totalGames > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <Badge variant={stats.winRate >= 50 ? "default" : "secondary"}>
                          {stats.winRate}%
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Score</span>
                        <span className="font-semibold">{stats.averageScore}</span>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <ChartBar size={14} className="mr-2" />
                        View Details
                      </Button>
                    </>
                  )}

                  {stats.totalGames === 0 && (
                    <div className="text-center py-2 text-muted-foreground">
                      <div className="text-sm">No games played yet</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Players Yet</h3>
            <p className="text-muted-foreground">Add your first player to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Player Dialog */}
      <Dialog open={editingPlayer !== null} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Player name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && editingPlayer && handleEditPlayer(editingPlayer)}
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => editingPlayer && handleEditPlayer(editingPlayer)}
                disabled={!editName.trim()}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingPlayer(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}