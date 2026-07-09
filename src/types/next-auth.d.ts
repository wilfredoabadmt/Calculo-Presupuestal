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
      planExpiresAt?: string | null
      workspaceEnabled?: boolean
      workspaceExpiresAt?: string | null
    } & DefaultSession["user"]
  }

  interface User extends AdapterUser {
    role: string
    plan: string
    planExpiresAt?: Date | string | null
    workspaceEnabled?: boolean
    workspaceExpiresAt?: Date | string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    plan: string
    planExpiresAt?: string | null
    workspaceEnabled?: boolean
    workspaceExpiresAt?: string | null
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string
    plan?: string
    planExpiresAt?: Date | string | null
    workspaceEnabled?: boolean
    workspaceExpiresAt?: Date | string | null
  }
}
