/**
 * Configuration Jest pour Board Game Score Tracker
 * 
 * Tests unitaires techniques : Services, hooks, utilitaires
 * Tests unitaires fonctionnels : Composants React, logique métier
 * Tests d'intégration : API, base de données, workflow complets
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Configuration des paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    // Mock pour lucide-react pour éviter les problèmes ESM
    '^lucide-react$': '<rootDir>/tests/mocks/lucide-react.js',
    '^lucide-react/dist/esm/icons/circle$': '<rootDir>/tests/mocks/lucide-icon.js',
    '^lucide-react/dist/esm/icons/(.*)$': '<rootDir>/tests/mocks/lucide-icon.js'
  },
  
  // Patterns de fichiers de tests
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}'
  ],
  
  // Couverture de code
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Répertoires à ignorer
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  
  // Configuration pour ignorer la transformation de certains modules SAUF lucide-react
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|@radix-ui)/)'
  ],
  
  // Configuration pour les modules ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        esModuleInterop: true
      }
    }]
  },
  
  // Mocks globaux
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Configuration spécifique React Testing Library
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
}
