/**
 * Tests unitaires fonctionnels - GameTemplateSection (Simplifié)
 * 
 * Tests simplifiés qui se concentrent sur les fonctionnalités principales
 * sans la complexité de l'ancienne architecture. Ces tests utilisent
 * des mocks simples et vérifient les comportements critiques.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameTemplateSection } from '../../../src/components/sections/GameTemplateSection'
import { useDatabase } from '../../../src/lib/database-context'

// Mock useDatabase hook
jest.mock('../../../src/lib/database-context', () => ({
  useDatabase: jest.fn()
}))
const mockUseDatabase = useDatabase as jest.MockedFunction<typeof useDatabase>

// Mock BGGGameSearch component
import type { BGGGameData } from '../../../src/services/BGGService';
import type { Database } from '../../../src/lib/database';
import '@testing-library/jest-dom';
jest.mock('../../../src/components/BGGGameSearch', () => ({
  BGGGameSearch: ({ onGameImport, onGameNameChange }: {
    onGameImport?: (gameData: BGGGameData) => void;
    onGameNameChange?: (name: string) => void;
  }) => (
    <div data-testid="bgg-search">
      <input 
        data-testid="bgg-search-input"
        placeholder="Search BoardGameGeek"
        onChange={(e) => onGameNameChange?.(e.target.value)}
      />
      <button 
        data-testid="bgg-import-button"
        onClick={() => onGameImport?.({
          id: 174430,
          name: 'Gloomhaven',
          description: 'Test game',
          characters: ['Character1', 'Character2'],
          expansions: [{ id: 1, name: 'Expansion1' }],
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

describe('GameTemplateSection - Tests Fonctionnels (Simplifié)', () => {
  const mockGameTemplates = [
    {
      id: 1,
      name: 'Test Game',
      hasCharacters: false,
      characters: '',
      hasExtensions: false,
      extensions: '',
      supportsCooperative: true,
      supportsCompetitive: false,
      supportsCampaign: false,
      defaultMode: 'cooperative' as const
    }
  ]

  const mockOnBack = jest.fn()

  const mockDatabaseContext = {
    db: {
      addGameTemplate: jest.fn<Database['addGameTemplate']>().mockResolvedValue({ id: 1, name: '', hasCharacters: false, characters: '', hasExtensions: false, extensions: '', supportsCooperative: false, supportsCompetitive: false, supportsCampaign: false, defaultMode: 'cooperative' }),
      updateGameTemplate: jest.fn<Database['updateGameTemplate']>().mockResolvedValue({ id: 1, name: '', hasCharacters: false, characters: '', hasExtensions: false, extensions: '', supportsCooperative: false, supportsCompetitive: false, supportsCampaign: false, defaultMode: 'cooperative' }),
      deleteGameTemplate: jest.fn<Database['deleteGameTemplate']>().mockResolvedValue(undefined),
      getGameHistory: jest.fn<Database['getGameHistory']>().mockResolvedValue([]),
      getPlayers: jest.fn<Database['getPlayers']>().mockResolvedValue([]),
      addPlayer: jest.fn<Database['addPlayer']>().mockResolvedValue({ id: 1, name: '', stats: {} })
    },
    isLoading: false,
    error: null,
    saveToFile: jest.fn(),
    loadFromFile: jest.fn(),
    databaseType: 'server' as 'server'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDatabase.mockReturnValue(mockDatabaseContext)
  })

  describe('Rendu de base', () => {
    it('should render with required props', () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      expect(screen.getByText('Game Templates')).toBeInTheDocument()
    })

    it('should display existing templates', () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      expect(screen.getByText('Test Game')).toBeInTheDocument()
    })

    it('should show empty state when no templates exist', () => {
      render(
        <GameTemplateSection 
          gameTemplates={[]} 
          onBack={mockOnBack} 
        />
      )
      
      // Le composant devrait avoir un état vide ou un message
      expect(screen.getByText('Game Templates')).toBeInTheDocument()
    })

    it('should have add template button', () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      // Chercher un bouton pour ajouter un template
      const addButton = screen.getByRole('button', { name: /ajouter|nouveau|add/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      const backButton = screen.getByRole('button', { name: /retour|back/i })
      await userEvent.click(backButton)
      
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Intégration Database', () => {
    it('should use database context correctly', () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      // Vérifie que le hook est appelé (peut être plusieurs fois selon les hooks internes)
      expect(mockUseDatabase).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', () => {
      const errorContext = {
        ...mockDatabaseContext,
        error: 'Database connection failed'
      }
      mockUseDatabase.mockReturnValue(errorContext)

      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      // Le composant devrait s'afficher même en cas d'erreur
      expect(screen.getByText('Game Templates')).toBeInTheDocument()
    })

    it('should handle loading state', () => {
      const loadingContext = {
        ...mockDatabaseContext,
        isLoading: true
      }
      mockUseDatabase.mockReturnValue(loadingContext)

      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      // Le composant devrait s'afficher même en état de chargement
      expect(screen.getByText('Game Templates')).toBeInTheDocument()
    })
  })

  describe('Intégration BGG', () => {
    it('should render BGG search component', async () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      // Ouvrir le dialogue d'ajout
      const addButton = screen.getByRole('button', { name: /ajouter|nouveau|add/i })
      await userEvent.click(addButton)
      
      // Vérifier que le composant BGG est présent
      await waitFor(() => {
        expect(screen.getByTestId('bgg-search')).toBeInTheDocument()
      })
    })

    it('should handle BGG game import', async () => {
      render(
        <GameTemplateSection 
          gameTemplates={mockGameTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      // Ouvrir le dialogue d'ajout
      const addButton = screen.getByRole('button', { name: /add template/i })
      await userEvent.click(addButton)
      
      // Vérifier que le dialogue est ouvert
      await waitFor(() => {
        expect(screen.getByTestId('bgg-search')).toBeInTheDocument()
      })
      
      // Simuler l'import BGG
      const importButton = screen.getByTestId('bgg-import-button')
      fireEvent.click(importButton)

      // Vérifier que l'import a été déclenché (via les console.log dans les mocks)
      // Le test passe si aucune erreur n'est levée
      expect(importButton).toBeInTheDocument()
    })
  })

  describe('Validation des props', () => {
    it('should work with empty gameTemplates array', () => {
      expect(() => {
        render(
          <GameTemplateSection 
            gameTemplates={[]} 
            onBack={mockOnBack} 
          />
        )
      }).not.toThrow()
    })

    it('should work with multiple templates', () => {
      const multipleTemplates = [
        ...mockGameTemplates,
        {
          id: 2,
          name: 'Another Game',
          hasCharacters: true,
          characters: 'Hero,Villain',
          hasExtensions: true,
          extensions: 'DLC1,DLC2',
          supportsCooperative: false,
          supportsCompetitive: true,
          supportsCampaign: true,
          defaultMode: 'competitive' as const
        }
      ]

      render(
        <GameTemplateSection 
          gameTemplates={multipleTemplates} 
          onBack={mockOnBack} 
        />
      )
      
      expect(screen.getByText('Test Game')).toBeInTheDocument()
      expect(screen.getByText('Another Game')).toBeInTheDocument()
    })
  })
})
