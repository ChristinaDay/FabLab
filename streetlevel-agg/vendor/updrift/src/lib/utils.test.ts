import { formatTimestamp } from './utils'

describe('formatTimestamp', () => {
  const now = Date.now()
  
  test('should format recent timestamps correctly', () => {
    // Just now
    expect(formatTimestamp(now - 1000)).toBe('just now')
    
    // 1 minute ago
    expect(formatTimestamp(now - 60 * 1000)).toBe('1 minute ago')
    
    // 30 minutes ago
    expect(formatTimestamp(now - 30 * 60 * 1000)).toBe('30 minutes ago')
    
    // 1 hour ago
    expect(formatTimestamp(now - 60 * 60 * 1000)).toBe('1 hour ago')
    
    // 2 hours ago
    expect(formatTimestamp(now - 2 * 60 * 60 * 1000)).toBe('2 hours ago')
  })
  
  test('should format daily timestamps correctly', () => {
    const yesterday = new Date(now - 24 * 60 * 60 * 1000)
    expect(formatTimestamp(yesterday.getTime())).toBe('yesterday')
    
    // 2 days ago
    expect(formatTimestamp(now - 2 * 24 * 60 * 60 * 1000)).toBe('2 days ago')
    
    // 3 days ago
    expect(formatTimestamp(now - 3 * 24 * 60 * 60 * 1000)).toBe('3 days ago')
  })
  
  test('should format weekly timestamps correctly', () => {
    // 7 days ago
    expect(formatTimestamp(now - 7 * 24 * 60 * 60 * 1000)).toBe('last week')
    
    // 10 days ago
    expect(formatTimestamp(now - 10 * 24 * 60 * 60 * 1000)).toBe('last week')
  })
  
  test('should format older timestamps with date', () => {
    const oldDate = new Date('2024-07-15')
    expect(formatTimestamp(oldDate.getTime())).toMatch(/on Jul 15/)
  })
}) 