import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, GameController, Trash, PencilSimple, ChartBar, Users, PersonSimple, Package, Asterisk } from '@phosphor-icons/react'
import type { GameTemplate } from '@/types'
import { useDatabase } from '@/lib/database-context'
import { useGameHistory } from '@/lib/database-hooks'
import { toast } from 'sonner'
import { BGGGameSearch } from '@/components/BGGGameSearch'
import { getExtensionsForGame } from '@/lib/extensions-utils';
import { useGameTemplates } from '@/lib/database-hooks';
import { logger } from '@/lib/logger';
import { generateId } from '@/lib/database';

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
    supportsCooperative: boolean
    supportsCompetitive: boolean
    supportsCampaign: boolean
    defaultMode: 'cooperative' | 'competitive' | 'campaign'
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string
    hasCharacters: boolean
    characters: string
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

/**
 * Composant de formulaire pour création/édition de templates de jeux
 * 
 * Fonctionnalités :
 * - Intégration BGG avec auto-import intelligent
 * - Validation des champs obligatoires
 * - Analyse automatique des modes de jeu
 * - Gestion des personnages et extensions
 * - Reset automatique du formulaire
 */
function DialogForm({ formData, setFormData, saveTemplate, onCancel, editingTemplate, formResetKey }: DialogFormProps) {
  return (
    <div className="space-y-4">
      {/* === SECTION GAME NAME AVEC BGG INTEGRATION === */}
      <div>
        <label className="text-sm font-medium flex items-center gap-1">
          Game Name
          <Asterisk size={8} className="text-destructive" />
        </label>
        <BGGGameSearch
          key={`bgg-search-${formResetKey}`} // Force re-render avec compteur pour reset
          onGameNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
          onGameImport={(gameData) => {
            logger.debug('Import BGG Game Data: ' + JSON.stringify(gameData));
            
            // === ANALYSE INTELLIGENTE DES DONNÉES BGG ===
            const hasCharacters = gameData.characters.length > 0
            
            // Analyse du type de jeu pour déterminer les modes supportés
            const categories = gameData.categories || []
            const mechanics = gameData.mechanics || []
            const description = gameData.description.toLowerCase()
            
            // === LOGIQUE DE DÉTERMINATION DES MODES SUPPORTÉS ===
            
            // Mode Coopératif : détection via catégories, mécaniques et description
            const supportsCooperative = 
              categories.some(cat => cat.toLowerCase().includes('cooperative')) ||
              mechanics.some(mech => mech.toLowerCase().includes('cooperative')) ||
              description.includes('cooperative') ||
              description.includes('co-op')
            
            // Mode Compétitif : par défaut si multi-joueurs et pas "cooperative only"
            const supportsCompetitive = 
              !categories.some(cat => cat.toLowerCase().includes('cooperative only')) &&
              gameData.maxPlayers > 1
            
            // Mode Campagne : détection via mots-clés spécifiques
            const supportsCampaign = 
              categories.some(cat => cat.toLowerCase().includes('campaign')) ||
              mechanics.some(mech => mech.toLowerCase().includes('campaign')) ||
              description.includes('campaign') ||
              description.includes('scenario')
            
            // === DÉTERMINATION DU MODE PAR DÉFAUT (LOGIQUE HIÉRARCHIQUE) ===
            let defaultMode: 'cooperative' | 'competitive' | 'campaign' = 'competitive'
            if (supportsCampaign) {
              // Priorité 1 : Campagne (jeux narratifs)
              defaultMode = 'campaign'
            } else if (supportsCooperative) {
              // Priorité 2 : Coopératif vs Compétitif selon dominance
              const isMainlyCooperative = 
                categories.some(cat => cat.toLowerCase().includes('cooperative')) ||
                mechanics.some(mech => mech.toLowerCase().includes('cooperative'))
              defaultMode = isMainlyCooperative ? 'cooperative' : 'competitive'
            }
            
            // === NETTOYAGE ET FILTRAGE DES DONNÉES ===
            
            // Personnages : filtrage intelligent pour éliminer le bruit
            const cleanedCharacters = gameData.characters
              .filter(char => char && char.length > 2) // Éliminer les entrées trop courtes
              .filter(char => !char.toLowerCase().includes('expansion')) // Éliminer les références aux extensions
              .slice(0, 20) // Limiter à 20 personnages max pour l'UI
            
            // === MISE À JOUR DU FORMULAIRE ===
            setFormData(prev => ({
              ...prev,
              name: gameData.name,
              hasCharacters,
              characters: cleanedCharacters.join(', '),
              supportsCooperative,
              supportsCompetitive,
              supportsCampaign,
              defaultMode,
              min_players: gameData.minPlayers,
              max_players: gameData.maxPlayers,
              image: gameData.image || '',
              extensions: gameData.expansions || []
            }))
            
            // Log pour debugging et monitoring de l'analyse intelligente
            logger.info('Auto-detected game modes: ' + JSON.stringify({
              supportsCooperative,
              supportsCompetitive,
              supportsCampaign,
              defaultMode,
              basedOn: { categories, mechanics, hasKeywords: description.includes('cooperative') }
            }));
          }}
          disabled={false}
        />
        {!formData.name.trim() && (
          <p className="text-xs text-destructive mt-1">Game name is required</p>
        )}
      </div>

      {/* === SECTION PERSONNAGES === */}
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

        {/* === SECTION MODES DE JEU (OBLIGATOIRE) === */}
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
  const { gameTemplates: templates, refreshGameTemplates } = useGameTemplates()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<GameTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [formResetKey, setFormResetKey] = useState(0) // Compteur pour forcer le re-render
  
  // Form state
  const [formData, setFormData] = useState({
  name: '',
  hasCharacters: false,
  characters: '',
  supportsCooperative: false,
  supportsCompetitive: false,
  supportsCampaign: false,
  defaultMode: 'competitive' as 'cooperative' | 'competitive' | 'campaign',
  min_players: undefined as number | undefined,
  max_players: undefined as number | undefined,
  image: '',
  extensions: [] as any[]
  })

  const resetForm = () => {
    setFormData({
      name: '',
      hasCharacters: false,
      characters: '',
      supportsCooperative: false,
      supportsCompetitive: false,
      supportsCampaign: false,
      defaultMode: 'competitive' as 'cooperative' | 'competitive' | 'campaign',
      min_players: undefined,
      max_players: undefined,
      image: '',
      extensions: []
    })
    setFormResetKey(prev => prev + 1) // Incrémenter pour forcer le re-render du BGGGameSearch
  }

  const openEditDialog = (template: GameTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      hasCharacters: template.hasCharacters,
      characters: template.characters?.join(', ') || '',
      supportsCooperative: template.supportsCooperative || false,
      supportsCompetitive: template.supportsCompetitive || false,
      supportsCampaign: template.supportsCampaign || false,
  defaultMode: (['cooperative', 'competitive', 'campaign'].includes(template.defaultMode as string) ? template.defaultMode : 'competitive') as 'cooperative' | 'competitive' | 'campaign',
      min_players: template.min_players,
      max_players: template.max_players,
      image: template.image || '',
      extensions: []
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

    // Générer un id unique si création
    const template: GameTemplate = {
      id: editingTemplate?.id ?? generateId(),
      name: formData.name.trim(),
      hasCharacters: formData.hasCharacters,
      characters: formData.hasCharacters && formData.characters.trim() 
        ? formData.characters.split(',').map(s => s.trim()).filter(s => s)
        : undefined,
      supportsCooperative: formData.supportsCooperative,
      supportsCompetitive: formData.supportsCompetitive,
      supportsCampaign: formData.supportsCampaign,
      defaultMode: formData.defaultMode,
      min_players: formData.min_players,
      max_players: formData.max_players,
      image: formData.image
    }

    try {
      if (editingTemplate) {
        await db!.updateGameTemplate(editingTemplate.name, template)
        toast.success('Game template updated successfully')
        setEditingTemplate(null)
        logger.info('Game template updated: ' + template.name);
      } else {
        await db!.addGameTemplate(template)
        // Ajout des extensions BGG si présentes
        if (db.addGameExtension && formData.extensions && formData.extensions.length > 0) {
          for (const ext of formData.extensions) {
            await db.addGameExtension({
              name: ext.name || ext,
              base_game_name: template.name,
              min_players: typeof ext.minPlayers === 'number' ? ext.minPlayers : undefined,
              max_players: typeof ext.maxPlayers === 'number' ? ext.maxPlayers : undefined,
              image: ext.image || undefined
            })
            logger.debug('Extension ajoutée: ' + (ext.name || ext));
          }
        }
        toast.success('Game template added successfully')
        setShowAddDialog(false)
        logger.info('Game template added: ' + template.name);
      }
      resetForm()
      await refreshGameTemplates()
    } catch (error) {
      logger.error('Failed to save game template: ' + (error instanceof Error ? error.message : String(error)));
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

    if (typeof template.id !== 'number' || !template.id) {
      toast.error('Template id is missing or invalid');
      return;
    }
    try {
      await db.deleteGameTemplate(template.id)
      toast.success(`${template.name} template removed successfully`)
      await refreshGameTemplates()
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

  // New component to display extensions from the new table
  function ExtensionsDisplay({ baseGameName }: { baseGameName: string }) {
    const [extensions, setExtensions] = useState<string[]>([]);
    const { db } = useDatabase();

    useEffect(() => {
      if (!db || !baseGameName) {
        setExtensions([]);
        return;
      }
      getExtensionsForGame(db, baseGameName).then(setExtensions).catch(() => setExtensions([]));
    }, [db, baseGameName]);

    if (!baseGameName) return null;
    return (
      <div className="mt-2">
        <label className="text-sm font-medium flex items-center gap-1">Extensions</label>
        {extensions.length === 0 ? (
          <span className="text-xs text-muted-foreground">No extensions found for this game.</span>
        ) : (
          <ul className="list-disc ml-4">
            {extensions.map(ext => (
              <li key={ext}>{ext}</li>
            ))}
          </ul>
        )}
      </div>
    );
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
          {templates.length > 0 ? (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
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
                                              {game.startTime ? new Date(game.startTime).toLocaleDateString() : ''}
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