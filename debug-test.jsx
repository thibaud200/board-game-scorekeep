import { render, screen } from '@testing-library/react'
import App from './src/App'

describe('Debug Navigation', () => {
  it('should render Dashboard with Game Templates card', async () => {
    render(<App />)
    
    // Debug: log what's actually rendered
    screen.debug()
    
    // Check if Dashboard elements are present
    console.log('Looking for Game Templates...')
    const gameTemplatesElements = screen.queryAllByText(/Game Templates/i)
    console.log('Found Game Templates elements:', gameTemplatesElements.length)
    
    const dashboardElements = screen.queryAllByText(/Players/i)
    console.log('Found Players elements:', dashboardElements.length)
    
    // Wait a bit to see if it's a timing issue
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('After waiting:')
    const gameTemplatesElements2 = screen.queryAllByText(/Game Templates/i)
    console.log('Found Game Templates elements after wait:', gameTemplatesElements2.length)
  })
})
