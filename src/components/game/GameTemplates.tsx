import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, GameController, Users, Trash, PencilSimple, Trophy, Bookmark } from '@phosphor-icons/react'
import { GameTemplate } from '@/types'
import { useDatabase } from '@/lib/database-context'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface GameTemplatesProps {
  gameTemplates: GameTemplate[]
}

export function GameTemplates({ gameTemplates }: GameTemplatesProps) {
  const { db } = useDatabase()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<GameTemplate | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    hasCharacters: false,
    characters: [] as string[],
    supportsCooperative: false,
    supportsCompetitive: true, // Default to competitive
    supportsCampaign: false,
    defaultMode: 'competitive' as 'cooperative' | 'competitive' | 'campaign'
  })
  const [newCharacterName, setNewCharacterName] = useState('')
  const [newCharacterType, setNewCharacterType] = useState('')

  const resetForm = () => {
    setFormData({
      name: '',
      hasCharacters: false,
      characters: [],
      supportsCooperative: false,
      supportsCompetitive: true,
      supportsCampaign: false,
      defaultMode: 'competitive'
    })
    setNewCharacterName('')
    setNewCharacterType('')
  }

  const handleAdd = () => {
    setEditingTemplate(null)
    resetForm()
    setShowAddDialog(true)
  }

  const handleEdit = (template: GameTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      hasCharacters: template.hasCharacters,
      characters: template.characters || [],
      supportsCooperative: template.supportsCooperative,
      supportsCompetitive: template.supportsCompetitive,
      supportsCampaign: template.supportsCampaign,
      defaultMode: (['cooperative', 'competitive', 'campaign'].includes(template.defaultMode as string) ? template.defaultMode : 'competitive') as 'cooperative' | 'competitive' | 'campaign'
    })
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    logger.debug('UI: handleSave called for game template: ' + JSON.stringify(formData))
    if (!formData.name.trim()) {
      toast.error('Game name is required')
      return
    }

    if (!db) {
      toast.error('Database not available')
      return
    }

    const template: GameTemplate = {
      name: formData.name.trim(),
      hasCharacters: formData.hasCharacters,
      characters: formData.hasCharacters ? formData.characters : undefined,
      supportsCooperative: formData.supportsCooperative,
      supportsCompetitive: formData.supportsCompetitive,
      supportsCampaign: formData.supportsCampaign,
      defaultMode: formData.defaultMode
    }

    try {
      if (editingTemplate) {
        logger.debug('UI: updateGameTemplate called for: ' + editingTemplate.name)
        await db!.updateGameTemplate(editingTemplate.name, template)
        toast.success('Game template updated!')
      } else {
        // Check if name already exists
        if (gameTemplates.some(t => t.name.toLowerCase() === template.name.toLowerCase())) {
          toast.error('A game template with this name already exists')
          return
        }
        
        logger.debug('UI: addGameTemplate called for: ' + template.name)
        await db!.addGameTemplate(template)
        toast.success('Game template added!')
      }

      setShowAddDialog(false)
      resetForm()
      // Parent component will refresh templates list
    } catch (error) {
      logger.debug('Error saving game template: ' + (error instanceof Error ? error.message : String(error)))
      toast.error('Failed to save game template')
    }
  }

  const handleDelete = async (templateId: number) => {
    logger.debug('UI: handleDelete called for game template id: ' + templateId);
    if (!db) return
    try {
      await db.deleteGameTemplate(templateId)
      toast.success('Game template deleted')
    } catch (error) {
      logger.debug('Error deleting game template: ' + (error instanceof Error ? error.message : String(error)));
      toast.error('Failed to delete game template')
    }
  }

  const confirmDelete = (templateId: number) => {
    handleDelete(templateId)
  }

  const addCharacter = () => {
    if (newCharacterName.trim() && newCharacterType.trim()) {
      const characterEntry = `${newCharacterName.trim()}(${newCharacterType.trim()})`
      if (!formData.characters.includes(characterEntry)) {
        setFormData(prev => ({
          ...prev,
          characters: [...prev.characters, characterEntry]
        }))
        setNewCharacterName('')
        setNewCharacterType('')
      }
    } else if (newCharacterName.trim() && !newCharacterType.trim()) {
      // Allow adding just a name without type for backwards compatibility
      if (!formData.characters.includes(newCharacterName.trim())) {
        setFormData(prev => ({
          ...prev,
          characters: [...prev.characters, newCharacterName.trim()]
        }))
        setNewCharacterName('')
      }
    }
  }

  const removeCharacter = (character: string) => {
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c !== character)
    }))
  }

  return (
    <div className="space-y-6 p-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Game Templates</h2>
          <p className="text-muted-foreground">Manage your board game configurations</p>
        </div>
        <Button onClick={handleAdd} className="shrink-0">
          <Plus size={16} className="mr-2" />
          Add Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gameTemplates.map((template) => (
          <Card key={template.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GameController size={20} />
                    {template.name}
                  </CardTitle>
                  <div className="flex gap-1 mt-2">
                    {template.supportsCooperative && (
                      <Badge variant="outline" className="text-xs">
                        <Users size={12} className="mr-1" />
                        Coop
                      </Badge>
                    )}
                    {template.supportsCompetitive && (
                      <Badge variant="secondary" className="text-xs">
                        <Trophy size={12} className="mr-1" />
                        Comp
                      </Badge>
                    )}
                    {template.supportsCampaign && (
                      <Badge variant="default" className="text-xs">
                        <Bookmark size={12} className="mr-1" />
                        Campaign
                      </Badge>
                    )}
                    {template.hasCharacters && (
                      <Badge variant="secondary" className="text-xs">
                        Characters
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    title="Edit template"
                    aria-label="Edit template"
                  >
                    <PencilSimple size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(template.id as number)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete template"
                        aria-label="Delete template"
                      >
                        <Trash size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Game Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{template.name}" template? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => confirmDelete(template.id as number)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.characters && template.characters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Characters</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.characters.slice(0, 3).map(char => (
                      <Badge key={char} variant="outline" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                    {template.characters.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.characters.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {gameTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <GameController size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No game templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create templates for your favorite games to quickly set up sessions
            </p>
            <Button onClick={handleAdd}>
              <Plus size={16} className="mr-2" />
              Add Your First Template
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {editingTemplate ? 'Edit Game Template' : 'Add Game Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="gameName">Game Name</Label>
              <Input
                id="gameName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Cthulhu, Arkham Horror, Gloomhaven"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Supported Game Modes</Label>
                <p className="text-xs text-muted-foreground mb-3">Select all modes this game template supports (multiple modes can be selected)</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supportsCooperative"
                      checked={formData.supportsCooperative}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, supportsCooperative: checked as boolean }))
                      }
                    />
                    <Label htmlFor="supportsCooperative" className="flex items-center gap-2">
                      <Users size={14} />
                      Cooperative Mode
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supportsCompetitive"
                      checked={formData.supportsCompetitive}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, supportsCompetitive: checked as boolean }))
                      }
                    />
                    <Label htmlFor="supportsCompetitive" className="flex items-center gap-2">
                      <Trophy size={14} />
                      Competitive Mode
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supportsCampaign"
                      checked={formData.supportsCampaign}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, supportsCampaign: checked as boolean }))
                      }
                    />
                    <Label htmlFor="supportsCampaign" className="flex items-center gap-2">
                      <Bookmark size={14} />
                      Campaign Mode
                    </Label>
                  </div>
                </div>
              </div>

              {(formData.supportsCooperative || formData.supportsCompetitive || formData.supportsCampaign) && (
                <div>
                  <Label className="text-sm font-medium">Default Mode</Label>
                  <p className="text-xs text-muted-foreground mb-2">Default mode when creating a new game with this template</p>
                  <select
                    value={formData.defaultMode}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      defaultMode: e.target.value as 'cooperative' | 'competitive' | 'campaign' 
                    }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {formData.supportsCooperative && (
                      <option value="cooperative">Cooperative</option>
                    )}
                    {formData.supportsCompetitive && (
                      <option value="competitive">Competitive</option>
                    )}
                    {formData.supportsCampaign && (
                      <option value="campaign">Campaign</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCharacters"
                  checked={formData.hasCharacters}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasCharacters: checked as boolean }))
                  }
                />
                <Label htmlFor="hasCharacters">Game has characters</Label>
              </div>

              {formData.hasCharacters && (
                <div className="space-y-2 pl-6">
                  <Label>Characters</Label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newCharacterName}
                        onChange={(e) => setNewCharacterName(e.target.value)}
                        placeholder="Character name (e.g., Mike)"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                      />
                      <Input
                        value={newCharacterType}
                        onChange={(e) => setNewCharacterType(e.target.value)}
                        placeholder="Type (e.g., Psychic)"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                      />
                      <Button type="button" onClick={addCharacter} className="shrink-0">Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add character name and type (Explorer, Scholar, Occultist, Psychic, Dilettante, Athlete)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.characters.map(character => (
                      <Badge
                        key={character}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeCharacter(character)}
                      >
                        {character} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t shrink-0">
            <Button onClick={handleSave} className="flex-1">
              {editingTemplate ? 'Update Template' : 'Add Template'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}