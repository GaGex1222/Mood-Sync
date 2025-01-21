import { JWT } from "next-auth/jwt";
import NextAuth, { DefaultSession } from 'next-auth'
import { Session } from "next-auth";
import Spotify from "next-auth/providers/spotify";
 
const getRefreshToken = async (token: JWT) => {
  try {
    console.log("Getting now refresh token")
    const url = "https://accounts.spotify.com/api/token" 

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.AUTH_SPOTIFY_ID || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "", 
      })
    })

    const refreshedTokens = await response.json()

    console.log(refreshedTokens, "LOGSSSS")

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
 }



export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Spotify({
    authorization: "https://accounts.spotify.com/authorize?scope=playlist-modify-public"
  })],

  callbacks: {
    async session({session, token}){
      session.accessToken = token.accessToken
      return session;
    }, 

    async jwt({token, account, user}){
      if(account && user){
        return {
          accessToken: account.accessToken,
          accessTokenExpires: Date.now() + (account.expires_at ? account.expires_at * 1000 : 0),
          refreshToken: account.refresh_token,
        }
      }

      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires || !token.accessToken) {
        const refreshedToken = await getRefreshToken(token);
        return refreshedToken;
      }
      
      return token;
    }
  },
})