import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
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
          throw new Error("Credenciales inválidas")
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new Error("Credenciales inválidas")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
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
      }
      return token
    },
    session: ({ session, token }: any) => {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },
})

export const { GET, POST } = handlers