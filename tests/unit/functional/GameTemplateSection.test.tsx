/**
 * Tests unitaires fonctionnels - GameTemplateSection
 * 
 * FIXME: Ce test utilise une ancienne architecture qui ne correspond plus au composant actuel.
 * Le composant GameTemplateSection a été refactorisé pour recevoir gameTemplates en props
 * et utiliser useDatabase() pour les opérations, au lieu d'un contexte custom.
 * 
 * TODO:
 * - Réécrire le test pour correspondre à la nouvelle architecture avec props
 * - Adapter les mocks pour utiliser useDatabase() au lieu de useDatabaseContext
 * - Corriger les imports et types pour correspondre à l'implémentation actuelle
 * - Vérifier les props requises: gameTemplates et onBack
 * 
 * Tests des fonctionnalités utilisateur :
 * - Création de templates
 * - Intégration BGG
 * - Validation des formulaires
 * - Gestion des modes de jeu
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameTemplateSection } from '../../../src/components/sections/GameTemplateSection'
import { useDatabase } from '../../../src/lib/database-context'

// Mock du context database
const mockDatabaseContext = {
  db: {
    getGameTemplates: jest.fn(),
    addGameTemplate: jest.fn(),
    updateGameTemplate: jest.fn(),
    deleteGameTemplate: jest.fn(),
  },
  isLoading: false,
  error: null,
  saveToFile: jest.fn(),
  loadFromFile: jest.fn(),
  databaseType: 'server' as const
}

jest.mock('../../../src/lib/database-context')
const mockUseDatabase = useDatabase as jest.MockedFunction<typeof useDatabase>

// Mock du composant BGGGameSearch
jest.mock('../../../src/components/BGGGameSearch', () => ({
  BGGGameSearch: ({ onGameImport, onGameNameChange }: any) => (
    <div data-testid="bgg-search">
      <input 
        data-testid="bgg-search-input"
        placeholder="Search BoardGameGeek"
        onChange={(e) => onGameNameChange(e.target.value)}
      />
      <button 
        data-testid="bgg-import-button"
        onClick={() => onGameImport({
          id: 174430,
          name: 'Gloomhaven',
          description: 'A tactical combat game.',
          characters: ['Brute', 'Cragheart'],
          expansions: [{ id: 1, name: 'Forgotten Circles' }],
          categories: ['Adventure'],
          mechanics: ['Cooperative Game'],
          minPlayers: 1,
          maxPlayers: 4,
          playingTime: 120
        })}
      >
        Import Game
      </button>
    </div>
  )
}))

describe('GameTemplateSection - Tests Fonctionnels', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDatabase.mockReturnValue(mockDatabaseContext)
  })

  describe('Interface Utilisateur', () => {
    it('should render add template button', () => {
      // Arrange & Act
      render(<GameTemplateSection />)

      // Assert
      expect(screen.getByText(/add template/i)).toBeInTheDocument()
    })

    it('should display existing templates', () => {
      // Arrange
      const templatesWithData = {
        ...mockDatabaseContext,
        templates: [
          {
            name: 'Test Game',
            hasCharacters: true,
            characters: 'Hero, Villain',
            hasExtensions: false,
            extensions: '',
            supportsCooperative: true,
            supportsCompetitive: false,
            supportsCampaign: false,
            defaultMode: 'cooperative' as const
          }
        ]
      }
      mockUseDatabase.mockReturnValue(templatesWithData)

      render(<GameTemplateSection />)

      // Assert
      expect(screen.getByText('Test Game')).toBeInTheDocument()
    })

    it('should show empty state when no templates exist', () => {
      // Arrange & Act
      render(<GameTemplateSection />)

      // Assert
      expect(screen.getByText(/no game templates/i)).toBeInTheDocument()
    })
  })

  describe('Création de Template', () => {
    it('should open dialog when add template button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      // Assert
      expect(screen.getByText(/game name/i)).toBeInTheDocument()
      expect(screen.getByTestId('bgg-search')).toBeInTheDocument()
    })

    it('should require game name to save template', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const saveButton = screen.getByText(/save/i)
      await user.click(saveButton)

      // Assert
      expect(screen.getByText(/game name is required/i)).toBeInTheDocument()
      expect(mockDatabaseContext.addTemplate).not.toHaveBeenCalled()
    })

    it('should require at least one game mode', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      // Remplir le nom mais ne sélectionner aucun mode
      const nameInput = screen.getByDisplayValue('')
      await user.type(nameInput, 'Test Game')

      const saveButton = screen.getByText(/save/i)
      await user.click(saveButton)

      // Assert
      expect(screen.getByText(/at least one game mode/i)).toBeInTheDocument()
      expect(mockDatabaseContext.addTemplate).not.toHaveBeenCalled()
    })

    it('should create template with valid data', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      // Remplir les données
      const searchInput = screen.getByTestId('bgg-search-input')
      await user.type(searchInput, 'Test Game')

      const cooperativeCheckbox = screen.getByLabelText(/cooperative/i)
      await user.click(cooperativeCheckbox)

      const saveButton = screen.getByText(/save/i)
      await user.click(saveButton)

      // Assert
      expect(mockDatabaseContext.addTemplate).toHaveBeenCalledWith({
        name: 'Test Game',
        hasCharacters: false,
        characters: '',
        hasExtensions: false,
        extensions: '',
        supportsCooperative: true,
        supportsCompetitive: false,
        supportsCampaign: false,
        defaultMode: 'cooperative'
      })
    })
  })

  describe('Intégration BGG', () => {
    it('should import game data from BGG', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const importButton = screen.getByTestId('bgg-import-button')
      await user.click(importButton)

      // Assert - Vérifier que les données sont pré-remplies
      expect(screen.getByDisplayValue('Gloomhaven')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Brute, Cragheart')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Forgotten Circles')).toBeInTheDocument()
    })

    it('should auto-detect cooperative mode from BGG data', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const importButton = screen.getByTestId('bgg-import-button')
      await user.click(importButton)

      // Assert - Vérifier que le mode coopératif est détecté
      const cooperativeCheckbox = screen.getByLabelText(/cooperative/i) as HTMLInputElement
      expect(cooperativeCheckbox.checked).toBe(true)
    })

    it('should enable characters section when BGG data has characters', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const importButton = screen.getByTestId('bgg-import-button')
      await user.click(importButton)

      // Assert
      const charactersSwitch = screen.getByRole('switch', { name: /has characters/i }) as HTMLInputElement
      expect(charactersSwitch.checked).toBe(true)
      expect(screen.getByDisplayValue('Brute, Cragheart')).toBeInTheDocument()
    })

    it('should enable extensions section when BGG data has expansions', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const importButton = screen.getByTestId('bgg-import-button')
      await user.click(importButton)

      // Assert
      const extensionsSwitch = screen.getByRole('switch', { name: /has extensions/i }) as HTMLInputElement
      expect(extensionsSwitch.checked).toBe(true)
      expect(screen.getByDisplayValue('Forgotten Circles')).toBeInTheDocument()
    })
  })

  describe('Validation des Modes de Jeu', () => {
    it('should allow selecting multiple game modes', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const searchInput = screen.getByTestId('bgg-search-input')
      await user.type(searchInput, 'Hybrid Game')

      const cooperativeCheckbox = screen.getByLabelText(/cooperative/i)
      const competitiveCheckbox = screen.getByLabelText(/competitive/i)
      
      await user.click(cooperativeCheckbox)
      await user.click(competitiveCheckbox)

      const saveButton = screen.getByText(/save/i)
      await user.click(saveButton)

      // Assert
      expect(mockDatabaseContext.addTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          supportsCooperative: true,
          supportsCompetitive: true,
          supportsCampaign: false
        })
      )
    })

    it('should set default mode based on selected modes', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const searchInput = screen.getByTestId('bgg-search-input')
      await user.type(searchInput, 'Campaign Game')

      const campaignCheckbox = screen.getByLabelText(/campaign/i)
      await user.click(campaignCheckbox)

      const saveButton = screen.getByText(/save/i)
      await user.click(saveButton)

      // Assert
      expect(mockDatabaseContext.addTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          supportsCampaign: true,
          defaultMode: 'campaign'
        })
      )
    })
  })

  describe('Gestion des Personnages et Extensions', () => {
    it('should show character input when has characters is enabled', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const charactersSwitch = screen.getByRole('switch', { name: /has characters/i })
      await user.click(charactersSwitch)

      // Assert
      expect(screen.getByPlaceholderText(/wizard, warrior, thief/i)).toBeInTheDocument()
    })

    it('should hide character input when has characters is disabled', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      // Les personnages sont désactivés par défaut
      // Assert
      expect(screen.queryByPlaceholderText(/wizard, warrior, thief/i)).not.toBeInTheDocument()
    })

    it('should show extension input when has extensions is enabled', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const extensionsSwitch = screen.getByRole('switch', { name: /has extensions/i })
      await user.click(extensionsSwitch)

      // Assert
      expect(screen.getByPlaceholderText(/base game, expansion 1/i)).toBeInTheDocument()
    })
  })

  describe('Édition de Template', () => {
    it('should populate form when editing existing template', async () => {
      // Arrange
      const templatesWithData = {
        ...mockDatabaseContext,
        templates: [
          {
            name: 'Existing Game',
            hasCharacters: true,
            characters: 'Hero, Villain',
            hasExtensions: false,
            extensions: '',
            supportsCooperative: true,
            supportsCompetitive: false,
            supportsCampaign: false,
            defaultMode: 'cooperative' as const
          }
        ]
      }
      mockUseDatabase.mockReturnValue(templatesWithData)

      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act
      const editButton = screen.getByText(/edit/i)
      await user.click(editButton)

      // Assert
      expect(screen.getByDisplayValue('Existing Game')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Hero, Villain')).toBeInTheDocument()
      
      const cooperativeCheckbox = screen.getByLabelText(/cooperative/i) as HTMLInputElement
      expect(cooperativeCheckbox.checked).toBe(true)
    })
  })

  describe('Reset du Formulaire', () => {
    it('should reset form when dialog is closed and reopened', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<GameTemplateSection />)

      // Act - Ouvrir, remplir, fermer
      let addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      const searchInput = screen.getByTestId('bgg-search-input')
      await user.type(searchInput, 'Test Game')

      const cancelButton = screen.getByText(/cancel/i)
      await user.click(cancelButton)

      // Rouvrir le dialog
      addButton = screen.getByText(/add template/i)
      await user.click(addButton)

      // Assert - Le formulaire devrait être vide
      expect(screen.getByTestId('bgg-search-input')).toHaveValue('')
    })
  })
})
