import { NextRequest } from 'next/server'
import { POST, GET } from './route'

// Mock NextAuth session
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  }
}

// Mock the auth module
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => mockSession)
}))

// Mock Prisma
const mockPrisma = {
        searchResult: {
    create: jest.fn(),
    findMany: jest.fn()
  }
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

describe('Search Results API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/user/search-results', () => {
    test('should create search result successfully', async () => {
      const mockSearchResult = {
        id: 'test-id',
        userId: 'test-user-id',
        query: 'Software Engineer',
        location: 'San Francisco',
        radius: 25,
        jobResults: '{"data": []}',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      mockPrisma.searchResult.create.mockResolvedValue(mockSearchResult)

      const request = new NextRequest('http://localhost:3000/api/user/search-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'Software Engineer',
          location: 'San Francisco',
          radius: 25,
          jobResults: '{"data": []}'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.searchResult.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          query: 'Software Engineer',
          location: 'San Francisco',
          radius: 25,
          jobResults: '{"data": []}',
          expiresAt: expect.any(Date)
        }
      })
    })

    test('should return 401 for unauthenticated user', async () => {
      // Mock unauthenticated session
      jest.mocked(require('next-auth').getServerSession).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/user/search-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test',
          location: 'test',
          radius: 25,
          jobResults: '{}'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/user/search-results', () => {
    test('should return user search results', async () => {
      const mockSearchResults = [
        {
          id: 'test-id-1',
          query: 'Software Engineer',
          location: 'San Francisco',
          radius: 25,
          jobResults: '{"data": []}',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      ]

      mockPrisma.searchResult.findMany.mockResolvedValue(mockSearchResults)

      const request = new NextRequest('http://localhost:3000/api/user/search-results')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.searchResults).toHaveLength(1)
      expect(mockPrisma.searchResult.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          expiresAt: {
            gt: expect.any(Date)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    })
  })
}) 