import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    // Verify database is ready
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      return NextResponse.json(
        { error: "Base de datos no disponible. Intenta en unos segundos." },
        { status: 503 }
      )
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        plan: "FREE",
      },
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Error al crear la cuenta. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
