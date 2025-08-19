import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, GameController, Users, Trash, PencilSimple } from '@phosphor-icons/react'
import { GameTemplate } from '@/App'
import { toast } from 'sonner'

export function GameTemplates() {
  const [gameTemplatesData, setGameTemplates] = useKV<GameTemplate[]>('gameTemplates', [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<GameTemplate | null>(null)
  
  // Ensure gameTemplates is always an array
  const gameTemplates = gameTemplatesData || []
  const [formData, setFormData] = useState({
    name: '',
    hasCharacters: false,
    characters: [] as string[],
    hasExtensions: false,
    extensions: [] as string[],
    isCooperativeByDefault: false
  })
  const [newCharacterName, setNewCharacterName] = useState('')
  const [newCharacterType, setNewCharacterType] = useState('')
  const [newExtension, setNewExtension] = useState('')

  const resetForm = () => {
    setFormData({
      name: '',
      hasCharacters: false,
      characters: [],
      hasExtensions: false,
      extensions: [],
      isCooperativeByDefault: false
    })
    setNewCharacterName('')
    setNewCharacterType('')
    setNewExtension('')
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
      hasExtensions: template.hasExtensions,
      extensions: template.extensions || [],
      isCooperativeByDefault: template.isCooperativeByDefault
    })
    setShowAddDialog(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Game name is required')
      return
    }

    const template: GameTemplate = {
      name: formData.name.trim(),
      hasCharacters: formData.hasCharacters,
      characters: formData.hasCharacters ? formData.characters : undefined,
      hasExtensions: formData.hasExtensions,
      extensions: formData.hasExtensions ? formData.extensions : undefined,
      isCooperativeByDefault: formData.isCooperativeByDefault
    }

    if (editingTemplate) {
      setGameTemplates(current => 
        (current || []).map(t => t.name === editingTemplate.name ? template : t)
      )
      toast.success('Game template updated!')
    } else {
      // Check if name already exists
      if (gameTemplates.some(t => t.name.toLowerCase() === template.name.toLowerCase())) {
        toast.error('A game template with this name already exists')
        return
      }
      
      setGameTemplates(current => [...(current || []), template])
      toast.success('Game template added!')
    }

    setShowAddDialog(false)
    resetForm()
  }

  const handleDelete = (templateName: string) => {
    setGameTemplates(current => (current || []).filter(t => t.name !== templateName))
    toast.success('Game template deleted')
  }

  const confirmDelete = (templateName: string) => {
    handleDelete(templateName)
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

  const addExtension = () => {
    if (newExtension.trim() && !formData.extensions.includes(newExtension.trim())) {
      setFormData(prev => ({
        ...prev,
        extensions: [...prev.extensions, newExtension.trim()]
      }))
      setNewExtension('')
    }
  }

  const removeExtension = (extension: string) => {
    setFormData(prev => ({
      ...prev,
      extensions: prev.extensions.filter(e => e !== extension)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Game Templates</h2>
          <p className="text-muted-foreground">Manage your board game configurations</p>
        </div>
        <Button onClick={handleAdd}>
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
                    {template.isCooperativeByDefault && (
                      <Badge variant="outline" className="text-xs">
                        <Users size={12} className="mr-1" />
                        Coop
                      </Badge>
                    )}
                    {template.hasCharacters && (
                      <Badge variant="secondary" className="text-xs">
                        Characters
                      </Badge>
                    )}
                    {template.hasExtensions && (
                      <Badge variant="secondary" className="text-xs">
                        Extensions
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
                          onClick={() => confirmDelete(template.name)}
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
              
              {template.extensions && template.extensions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Extensions</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.extensions.slice(0, 2).map(ext => (
                      <Badge key={ext} variant="outline" className="text-xs">
                        {ext}
                      </Badge>
                    ))}
                    {template.extensions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.extensions.length - 2} more
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Game Template' : 'Add Game Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="gameName">Game Name</Label>
              <Input
                id="gameName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Cthulhu, Arkham Horror, Gloomhaven"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cooperative"
                checked={formData.isCooperativeByDefault}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isCooperativeByDefault: checked as boolean }))
                }
              />
              <Label htmlFor="cooperative">Cooperative game by default</Label>
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
                    <div className="flex gap-2">
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
                      <Button type="button" onClick={addCharacter}>Add</Button>
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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasExtensions"
                  checked={formData.hasExtensions}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasExtensions: checked as boolean }))
                  }
                />
                <Label htmlFor="hasExtensions">Game has extensions</Label>
              </div>

              {formData.hasExtensions && (
                <div className="space-y-2 pl-6">
                  <Label>Extensions</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newExtension}
                      onChange={(e) => setNewExtension(e.target.value)}
                      placeholder="Add extension name"
                      onKeyPress={(e) => e.key === 'Enter' && addExtension()}
                    />
                    <Button type="button" onClick={addExtension}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.extensions.map(extension => (
                      <Badge
                        key={extension}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeExtension(extension)}
                      >
                        {extension} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingTemplate ? 'Update Template' : 'Add Template'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}