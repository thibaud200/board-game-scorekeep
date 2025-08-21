/**
 * Mock pour lucide-react
 * Évite les problèmes d'ESM dans Jest
 */

const React = require('react')

// Mock générique pour tous les icônes lucide-react
const LucideIcon = ({ className, ...props }) => {
  return React.createElement('svg', {
    className: `lucide ${className || ''}`,
    'data-testid': 'lucide-icon',
    ...props
  })
}

// Export par défaut et exports nommés les plus courants
module.exports = {
  Search: LucideIcon,
  Download: LucideIcon,
  ExternalLink: LucideIcon,
  CheckCircle: LucideIcon,
  Circle: LucideIcon,
  Check: LucideIcon,
  ChevronDown: LucideIcon,
  X: LucideIcon,
  Plus: LucideIcon,
  Minus: LucideIcon,
  Edit: LucideIcon,
  Trash: LucideIcon,
  Menu: LucideIcon,
  Settings: LucideIcon,
  User: LucideIcon,
  // Mock par défaut pour tous les autres icônes
  default: LucideIcon
}

// Pour les imports par défaut
module.exports.default = module.exports
