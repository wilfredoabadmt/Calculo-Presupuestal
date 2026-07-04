// src/types/next-auth.d.ts
import "next-auth"
import { DefaultSession } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      plan: string
    } & DefaultSession["user"]
  }
  
  interface User extends AdapterUser {
    role: string
    plan: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    plan: string
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string
    plan?: string
  }
}