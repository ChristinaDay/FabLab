import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        console.log('🔍 User lookup result:', user ? 'User found' : 'User not found')

        if (!user || !user.password) {
          console.log('❌ User not found or no password')
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log('🔐 Password validation:', isPasswordValid ? 'Valid' : 'Invalid')

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          throw new Error('Invalid credentials')
        }

        console.log('✅ Authentication successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],

  session: {
    strategy: 'jwt'
  },

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async jwt({ token, user }) {
      console.log('🔄 JWT callback:', { userId: user?.id, tokenId: token?.id })
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      console.log('🔄 Session callback:', { 
        sessionUserId: session?.user?.id, 
        tokenId: token?.id,
        sessionUser: session?.user?.email,
        tokenEmail: token?.email
      })
      if (token) {
        session.user.id = token.id as string
        console.log('✅ Session callback: Set user.id to', token.id)
      } else {
        console.log('❌ Session callback: No token provided')
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl })
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },

  events: {
    async createUser({ user }) {
      console.log('🎉 New user created:', user.email)
    },
  },
}

// Helper function to get server-side session
export async function getServerSession() {
  const { getServerSession: getNextAuthServerSession } = await import('next-auth')
  return getNextAuthServerSession(authOptions)
} 