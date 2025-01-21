import NextAuth, { DefaultSession } from 'next-auth'
import { Session } from 'next-auth'
import { JWT as NextAuthJWT } from 'next-auth/jwt'

export interface SongsData {
    [song_name: string]: {image: string, url: string} 
}



export interface EmotionChangeData {
    emotion: string,
    songs: SongsData
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string
    error?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
  }
}