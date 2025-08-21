/**
 * Test de configuration - Vérification que Jest fonctionne
 */

describe('Configuration Tests', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to jest globals', () => {
    expect(jest).toBeDefined()
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
  })

  it('should support async tests', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })
})
