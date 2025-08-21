/**
 * Mock pour les icônes individuelles de lucide-react
 */

const React = require('react')

// Mock générique pour un icône individuel
const LucideIcon = (props) => {
  return React.createElement('svg', {
    className: 'lucide',
    'data-testid': 'lucide-icon',
    ...props
  })
}

module.exports = LucideIcon
module.exports.default = LucideIcon
