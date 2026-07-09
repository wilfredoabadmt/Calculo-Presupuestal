import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = signInSchema.parse(credentials)

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          planExpiresAt: user.planExpiresAt,
          workspaceEnabled: user.workspaceEnabled,
          workspaceExpiresAt: user.workspaceExpiresAt,
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }: any) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.plan = user.plan
        token.planExpiresAt = user.planExpiresAt
        token.workspaceEnabled = user.workspaceEnabled
        token.workspaceExpiresAt = user.workspaceExpiresAt
      }
      return token
    },
    session: ({ session, token }: any) => {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.planExpiresAt = token.planExpiresAt as string | null
        session.user.workspaceEnabled = token.workspaceEnabled as boolean
        session.user.workspaceExpiresAt = token.workspaceExpiresAt as string | null
      }
      return session
    },
  },
})

export const { GET, POST } = handlers