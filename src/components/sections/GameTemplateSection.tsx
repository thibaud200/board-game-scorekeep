import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, GameController, Trash, PencilSimple, ChartBar, Users, PersonSimple, Package, Asterisk } from '@phosphor-icons/react'
import { GameTemplate, GameSession } from '@/App'
import { useDatabase } from '@/lib/database-context'
import { useGameHistory } from '@/lib/database-hooks'
import { toast } from 'sonner'
import { BGGGameSearch } from '@/components/BGGGameSearch'

interface GameTemplateSectionProps {
  gameTemplates: GameTemplate[]
  onBack: () => void
}

// DialogForm component moved outside to prevent re-rendering
interface DialogFormProps {
  formData: {
    name: string
    hasCharacters: boolean
    characters: string
    hasExtensions: boolean
    extensions: string
    supportsCooperative: boolean
    supportsCompetitive: boolean
    supportsCampaign: boolean
    defaultMode: 'cooperative' | 'competitive' | 'campaign'
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string
    hasCharacters: boolean
    characters: string
    hasExtensions: boolean
    extensions: string
    supportsCooperative: boolean
    supportsCompetitive: boolean
    supportsCampaign: boolean
    defaultMode: 'cooperative' | 'competitive' | 'campaign'
  }>>
  saveTemplate: () => void
  onCancel: () => void
  editingTemplate: GameTemplate | null
  formResetKey: number // Ajouter le compteur de reset
}

function DialogForm({ formData, setFormData, saveTemplate, onCancel, editingTemplate, formResetKey }: DialogFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium flex items-center gap-1">
          Game Name
          <Asterisk size={8} className="text-destructive" />
        </label>
        <BGGGameSearch
          key={`bgg-search-${formResetKey}`} // Force re-render avec compteur
          onGameNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
          onGameImport={(gameData) => {
            console.log('Import BGG Game Data:', gameData) // Debug log
            
            // Analyse intelligente des données BGG
            const hasCharacters = gameData.characters.length > 0
            const hasExtensions = gameData.expansions.length > 0
            
            // Analyse du type de jeu pour déterminer les modes supportés
            const categories = gameData.categories || []
            const mechanics = gameData.mechanics || []
            const description = gameData.description.toLowerCase()
            
            // Logique de détermination des modes supportés
            const supportsCooperative = 
              categories.some(cat => cat.toLowerCase().includes('cooperative')) ||
              mechanics.some(mech => mech.toLowerCase().includes('cooperative')) ||
              description.includes('cooperative') ||
              description.includes('co-op')
            
            const supportsCompetitive = 
              !categories.some(cat => cat.toLowerCase().includes('cooperative only')) &&
              gameData.maxPlayers > 1
            
            const supportsCampaign = 
              categories.some(cat => cat.toLowerCase().includes('campaign')) ||
              mechanics.some(mech => mech.toLowerCase().includes('campaign')) ||
              description.includes('campaign') ||
              description.includes('scenario')
            
            // Détermination du mode par défaut (logique améliorée)
            let defaultMode: 'cooperative' | 'competitive' | 'campaign' = 'competitive'
            if (supportsCampaign) {
              defaultMode = 'campaign'
            } else if (supportsCooperative) {
              // Si le jeu supporte le coopératif, privilégier ce mode
              // sauf si c'est un jeu principalement compétitif
              const isMainlyCooperative = 
                categories.some(cat => cat.toLowerCase().includes('cooperative')) ||
                mechanics.some(mech => mech.toLowerCase().includes('cooperative'))
              defaultMode = isMainlyCooperative ? 'cooperative' : 'competitive'
            }
            
            // Nettoyage et filtrage des personnages
            const cleanedCharacters = gameData.characters
              .filter(char => char && char.length > 2) // Éliminer les entrées trop courtes
              .filter(char => !char.toLowerCase().includes('expansion')) // Éliminer les références aux extensions
              .slice(0, 20) // Limiter à 20 personnages max
            
            // Nettoyage des extensions (exclure les réimpressions et variantes)
            const cleanedExtensions = gameData.expansions
              .filter(exp => exp.name && !exp.name.toLowerCase().includes('reprint'))
              .filter(exp => !exp.name.toLowerCase().includes('edition'))
              .slice(0, 10) // Limiter à 10 extensions max
            
            setFormData(prev => ({
              ...prev,
              name: gameData.name,
              hasCharacters,
              characters: cleanedCharacters.join(', '),
              hasExtensions,
              extensions: cleanedExtensions.map(exp => exp.name).join(', '),
              supportsCooperative,
              supportsCompetitive,
              supportsCampaign,
              defaultMode
            }))
            
            console.log('Auto-detected game modes:', {
              supportsCooperative,
              supportsCompetitive,
              supportsCampaign,
              defaultMode
            })
          }}
          disabled={false}
        />
        {!formData.name.trim() && (
          <p className="text-xs text-destructive mt-1">Game name is required</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Has Characters/Roles</label>
          <Switch
            checked={formData.hasCharacters}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCharacters: checked }))}
          />
        </div>

        {formData.hasCharacters && (
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              Characters (comma-separated)
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              placeholder="e.g., Wizard, Warrior, Thief"
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
            <label className="text-sm font-medium flex items-center gap-1">
              Extensions (comma-separated)
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              placeholder="e.g., Base Game, Expansion 1, Expansion 2"
              value={formData.extensions}
              onChange={(e) => setFormData(prev => ({ ...prev, extensions: e.target.value }))}
            />
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-1">
            Game Modes (select all that apply)
            <Asterisk size={8} className="text-destructive" />
          </label>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cooperative"
                checked={formData.supportsCooperative}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, supportsCooperative: checked as boolean }))
                }
              />
              <label htmlFor="cooperative" className="text-sm">Cooperative</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="competitive"
                checked={formData.supportsCompetitive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, supportsCompetitive: checked as boolean }))
                }
              />
              <label htmlFor="competitive" className="text-sm">Competitive</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="campaign"
                checked={formData.supportsCampaign}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, supportsCampaign: checked as boolean }))
                }
              />
              <label htmlFor="campaign" className="text-sm">Campaign</label>
            </div>
          </div>

          {!(formData.supportsCooperative || formData.supportsCompetitive || formData.supportsCampaign) && (
            <p className="text-xs text-destructive">At least one game mode must be selected</p>
          )}

          {(formData.supportsCooperative || formData.supportsCompetitive || formData.supportsCampaign) && (
            <div className="mt-4">
              <label className="text-sm font-medium flex items-center gap-1">
                Default Mode
                <Asterisk size={8} className="text-destructive" />
              </label>
              <Select 
                value={formData.defaultMode} 
                onValueChange={(value: 'cooperative' | 'competitive' | 'campaign') => 
                  setFormData(prev => ({ ...prev, defaultMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.supportsCooperative && (
                    <SelectItem value="cooperative">Cooperative</SelectItem>
                  )}
                  {formData.supportsCompetitive && (
                    <SelectItem value="competitive">Competitive</SelectItem>
                  )}
                  {formData.supportsCampaign && (
                    <SelectItem value="campaign">Campaign</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={saveTemplate} 
          disabled={
            !formData.name.trim() || 
            !(formData.supportsCooperative || formData.supportsCompetitive || formData.supportsCampaign)
          } 
          className="flex-1"
        >
          {editingTemplate ? 'Save Changes' : 'Add Template'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function GameTemplateSection({ gameTemplates, onBack }: GameTemplateSectionProps) {
  const { db } = useDatabase()
  const { gameHistory } = useGameHistory()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<GameTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [formResetKey, setFormResetKey] = useState(0) // Compteur pour forcer le re-render
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    hasCharacters: false,
    characters: '',
    hasExtensions: false,
    extensions: '',
    supportsCooperative: false,
    supportsCompetitive: false,
    supportsCampaign: false,
    defaultMode: 'competitive' as 'cooperative' | 'competitive' | 'campaign'
  })

  const resetForm = () => {
    setFormData({
      name: '',
      hasCharacters: false,
      characters: '',
      hasExtensions: false,
      extensions: '',
      supportsCooperative: false,
      supportsCompetitive: false,
      supportsCampaign: false,
      defaultMode: 'competitive' as 'cooperative' | 'competitive' | 'campaign'
    })
    setFormResetKey(prev => prev + 1) // Incrémenter pour forcer le re-render du BGGGameSearch
  }

  const openEditDialog = (template: GameTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      hasCharacters: template.hasCharacters,
      characters: template.characters?.join(', ') || '',
      hasExtensions: template.hasExtensions,
      extensions: template.extensions?.join(', ') || '',
      supportsCooperative: template.supportsCooperative || false,
      supportsCompetitive: template.supportsCompetitive || false,
      supportsCampaign: template.supportsCampaign || false,
      defaultMode: template.defaultMode || 'competitive'
    })
  }

  const saveTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Game name is required')
      return
    }

    if (!db) {
      toast.error('Database not available')
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
      supportsCooperative: formData.supportsCooperative,
      supportsCompetitive: formData.supportsCompetitive,
      supportsCampaign: formData.supportsCampaign,
      defaultMode: formData.defaultMode
    }

    try {
      if (editingTemplate) {
        await db!.updateGameTemplate(editingTemplate.name, template)
        toast.success('Game template updated successfully')
        setEditingTemplate(null)
      } else {
        await db!.addGameTemplate(template)
        toast.success('Game template added successfully')
        setShowAddDialog(false)
      }
      resetForm()
      // The parent component will refresh the templates list
    } catch (error) {
      toast.error('Failed to save game template')
    }
  }

  const deleteTemplate = async (template: GameTemplate) => {
    if (!db) return
    
    const templateGames = gameHistory.filter(game => game.gameTemplate === template.name)
    if (templateGames.length > 0) {
      toast.error(`Cannot delete ${template.name} - it has game history`)
      return
    }

    try {
      await db.deleteGameTemplate(template.name)
      toast.success(`${template.name} template removed successfully`)
      // The parent component will refresh the templates list
    } catch (error) {
      toast.error('Failed to delete game template')
    }
  }

  const getTemplateStats = (template: GameTemplate) => {
    const templateGames = gameHistory.filter(game => 
      game.endTime && game.gameTemplate === template.name
    )
    
    const totalGames = templateGames.length
    const recentGames = templateGames.slice(-5).reverse()
    const cooperativeGames = templateGames.filter(game => game.isCooperative).length
    const averageDuration = totalGames > 0 
      ? Math.round(templateGames.reduce((sum, game) => {
          const duration = typeof game.duration === 'string' ? parseInt(game.duration) : (game.duration || 0)
          return sum + (duration || 0)
        }, 0) / totalGames)
      : 0

    return { totalGames, recentGames, cooperativeGames, averageDuration }
  }

  const handleCancel = () => {
    if (editingTemplate) {
      setEditingTemplate(null)
    } else {
      setShowAddDialog(false)
    }
    resetForm()
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Game Templates</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage your game configurations</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open)
            if (open && !editingTemplate) {
              // Réinitialiser le formulaire à chaque ouverture pour création
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="self-start sm:self-auto">
                <Plus size={16} className="mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto overflow-x-visible">
              <DialogHeader>
                <DialogTitle>Add Game Template</DialogTitle>
                <DialogDescription>
                  Create a new game template with custom settings for characters, extensions, and gameplay type.
                </DialogDescription>
              </DialogHeader>
              <DialogForm 
                formData={formData}
                setFormData={setFormData}
                saveTemplate={saveTemplate}
                onCancel={handleCancel}
                editingTemplate={editingTemplate}
                formResetKey={formResetKey}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        <div className="overflow-y-auto">
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
                        {template.supportsCooperative && (
                          <Badge variant="outline" className="text-xs">
                            <Users size={10} className="mr-1" />
                            Coop
                          </Badge>
                        )}
                        {template.supportsCompetitive && (
                          <Badge variant="outline" className="text-xs">
                            <GameController size={10} className="mr-1" />
                            Compet
                          </Badge>
                        )}
                        {template.supportsCampaign && (
                          <Badge variant="outline" className="text-xs">
                            <ChartBar size={10} className="mr-1" />
                            Campaign
                          </Badge>
                        )}
                        {template.hasCharacters && (
                          <Badge variant="outline" className="text-xs">
                            <PersonSimple size={10} className="mr-1" />
                            Characters
                          </Badge>
                        )}
                        {template.hasExtensions && (
                          <Badge variant="outline" className="text-xs">
                            <Package size={10} className="mr-1" />
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
                            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{template.name} - Game History</DialogTitle>
                                <DialogDescription>
                                  View recent games and statistics for this game template.
                                </DialogDescription>
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
                                              {new Date(game.startTime).toLocaleDateString()}
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
        </div>



        {/* Edit Template Dialog */}
        <Dialog open={editingTemplate !== null} onOpenChange={(open) => !open && setEditingTemplate(null)}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Game Template</DialogTitle>
              <DialogDescription>
                Modify the settings for this game template. Note that changes won't affect existing game history.
              </DialogDescription>
            </DialogHeader>
            <DialogForm 
              formData={formData}
              setFormData={setFormData}
              saveTemplate={saveTemplate}
              onCancel={handleCancel}
              editingTemplate={editingTemplate}
              formResetKey={formResetKey}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}