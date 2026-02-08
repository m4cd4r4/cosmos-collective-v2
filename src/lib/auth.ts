/**
 * NextAuth.js Configuration
 * Supports Google, GitHub, and Zooniverse authentication
 */

import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import ZooniverseProvider from '@/lib/zooniverse-provider'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    ZooniverseProvider({
      clientId: process.env.ZOONIVERSE_CLIENT_ID ?? '',
      clientSecret: process.env.ZOONIVERSE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token and user id to the token
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.id = user.id
        token.provider = account.provider

        // Store Zooniverse-specific data
        if (account.provider === 'zooniverse' && profile) {
          token.zooniverseId = (profile as any).id
          token.zooniverseUsername = (profile as any).login
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string
        session.user.zooniverseId = token.zooniverseId as string | undefined
        session.user.zooniverseUsername = token.zooniverseUsername as string | undefined
      }

      // Include access token for Zooniverse API calls
      session.accessToken = token.accessToken as string | undefined
      session.provider = token.provider as string | undefined

      return session
    },
    async signIn({ user, account, profile }) {
      // Store Zooniverse token in database when user signs in
      if (account?.provider === 'zooniverse' && account.access_token) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              zooniverseId: (profile as any)?.id,
              zooniverseUsername: (profile as any)?.login,
              zooniverseToken: account.access_token,
              zooniverseExpires: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
          })
        } catch (error) {
          console.error('Failed to store Zooniverse token:', error)
        }
      }
      return true
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign-in events for analytics
      console.log(`User signed in: ${user.email}, New user: ${isNewUser}`)
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      zooniverseId?: string
      zooniverseUsername?: string
    }
    accessToken?: string
    provider?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    provider?: string
    zooniverseId?: string
    zooniverseUsername?: string
  }
}
