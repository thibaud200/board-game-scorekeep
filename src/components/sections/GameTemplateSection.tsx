import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, GameController, Trash, PencilSimple, ChartBar, Users } from '@phosphor-icons/react'
import { GameTemplate, GameSession } from '@/App'
import { toast } from 'sonner'

interface GameTemplateSectionProps {
  gameTemplates: GameTemplate[]
  gameHistory: GameSession[]
  onBack: () => void
}

export function GameTemplateSection({ gameTemplates, gameHistory, onBack }: GameTemplateSectionProps) {
  const [, setGameTemplates] = useKV<GameTemplate[]>('gameTemplates', [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<GameTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    hasCharacters: false,
    characters: '',
    hasExtensions: false,
    extensions: '',
    isCooperativeByDefault: false
  })

  const resetForm = () => {
    setFormData({
      name: '',
      hasCharacters: false,
      characters: '',
      hasExtensions: false,
      extensions: '',
      isCooperativeByDefault: false
    })
  }

  const openEditDialog = (template: GameTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      hasCharacters: template.hasCharacters,
      characters: template.characters?.join(', ') || '',
      hasExtensions: template.hasExtensions,
      extensions: template.extensions?.join(', ') || '',
      isCooperativeByDefault: template.isCooperativeByDefault
    })
  }

  const saveTemplate = () => {
    if (!formData.name.trim()) {
      toast.error('Game name is required')
      return
    }

    const existingTemplate = gameTemplates.find(t => 
      t.name.toLowerCase() === formData.name.toLowerCase() && 
      (!editingTemplate || t.name !== editingTemplate.name)
    )
    
    if (existingTemplate) {
      toast.error('A game template with this name already exists')
      return
    }

    const template: GameTemplate = {
      name: formData.name.trim(),
      hasCharacters: formData.hasCharacters,
      characters: formData.hasCharacters && formData.characters.trim() 
        ? formData.characters.split(',').map(s => s.trim()).filter(s => s)
        : undefined,
      hasExtensions: formData.hasExtensions,
      extensions: formData.hasExtensions && formData.extensions.trim()
        ? formData.extensions.split(',').map(s => s.trim()).filter(s => s)
        : undefined,
      isCooperativeByDefault: formData.isCooperativeByDefault
    }

    if (editingTemplate) {
      setGameTemplates(current => 
        (current || []).map(t => t.name === editingTemplate.name ? template : t)
      )
      toast.success('Game template updated successfully')
      setEditingTemplate(null)
    } else {
      setGameTemplates(current => [...(current || []), template])
      toast.success('Game template added successfully')
      setShowAddDialog(false)
    }
    
    resetForm()
  }

  const deleteTemplate = (template: GameTemplate) => {
    const templateGames = gameHistory.filter(game => game.gameType === template.name)
    if (templateGames.length > 0) {
      toast.error(`Cannot delete ${template.name} - it has game history`)
      return
    }

    setGameTemplates(current => (current || []).filter(t => t.name !== template.name))
    toast.success(`${template.name} template removed successfully`)
  }

  const getTemplateStats = (template: GameTemplate) => {
    const templateGames = gameHistory.filter(game => 
      game.completed && game.gameType === template.name
    )
    
    const totalGames = templateGames.length
    const recentGames = templateGames.slice(-5).reverse()
    const cooperativeGames = templateGames.filter(game => game.isCooperative).length
    const averageDuration = totalGames > 0 
      ? Math.round(templateGames.reduce((sum, game) => sum + (game.duration || 0), 0) / totalGames)
      : 0

    return { totalGames, recentGames, cooperativeGames, averageDuration }
  }

  const DialogForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Game Name</label>
        <Input
          placeholder="Enter game name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Has Characters</label>
        <Switch
          checked={formData.hasCharacters}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCharacters: checked }))}
        />
      </div>

      {formData.hasCharacters && (
        <div>
          <label className="text-sm font-medium">Characters (comma separated)</label>
          <Input
            placeholder="Detective, Investigator, Scholar..."
            value={formData.characters}
            onChange={(e) => setFormData(prev => ({ ...prev, characters: e.target.value }))}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Has Extensions</label>
        <Switch
          checked={formData.hasExtensions}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasExtensions: checked }))}
        />
      </div>

      {formData.hasExtensions && (
        <div>
          <label className="text-sm font-medium">Extensions (comma separated)</label>
          <Input
            placeholder="Expansion 1, Expansion 2..."
            value={formData.extensions}
            onChange={(e) => setFormData(prev => ({ ...prev, extensions: e.target.value }))}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Cooperative by Default</label>
        <Switch
          checked={formData.isCooperativeByDefault}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCooperativeByDefault: checked }))}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={saveTemplate} disabled={!formData.name.trim()} className="flex-1">
          {editingTemplate ? 'Save Changes' : 'Add Template'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            if (editingTemplate) {
              setEditingTemplate(null)
            } else {
              setShowAddDialog(false)
            }
            resetForm()
          }}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Game Templates</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your game configurations</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Game Template</DialogTitle>
            </DialogHeader>
            <DialogForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {gameTemplates.length > 0 ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {gameTemplates.map((template) => {
            const stats = getTemplateStats(template)
            
            return (
              <Card key={template.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <GameController size={16} className="text-primary" />
                      </div>
                      {template.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                        className="h-8 w-8 p-0"
                      >
                        <PencilSimple size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate(template)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Game Features */}
                  <div className="flex flex-wrap gap-1">
                    {template.isCooperativeByDefault && (
                      <Badge variant="outline" className="text-xs">
                        <Users size={10} className="mr-1" />
                        Coop
                      </Badge>
                    )}
                    {template.hasCharacters && (
                      <Badge variant="outline" className="text-xs">
                        Characters
                      </Badge>
                    )}
                    {template.hasExtensions && (
                      <Badge variant="outline" className="text-xs">
                        Extensions
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalGames}</div>
                      <div className="text-xs text-muted-foreground">Games Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.averageDuration}</div>
                      <div className="text-xs text-muted-foreground">Avg Minutes</div>
                    </div>
                  </div>

                  {stats.totalGames > 0 && (
                    <>
                      {stats.cooperativeGames > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Cooperative Games</span>
                          <span className="font-semibold">{stats.cooperativeGames}</span>
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <ChartBar size={14} className="mr-2" />
                            View History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{template.name} - Game History</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {stats.recentGames.length > 0 ? (
                              <>
                                <div className="text-sm font-medium">Recent Games</div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {stats.recentGames.map((game) => (
                                    <div key={game.id} className="flex justify-between items-center p-2 border rounded">
                                      <div>
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(game.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                          <span className="text-sm">{game.players.length} players</span>
                                          {game.isCooperative && (
                                            <Badge variant="outline" className="text-xs">
                                              <Users size={8} className="mr-1" />
                                              Coop
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        {game.duration && (
                                          <div className="text-sm font-semibold">{game.duration}m</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                No games played yet
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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
            <GameController size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Game Templates Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first game template to get started</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Template Dialog */}
      <Dialog open={editingTemplate !== null} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game Template</DialogTitle>
          </DialogHeader>
          <DialogForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}