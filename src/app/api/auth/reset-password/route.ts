import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    if (user.resetToken !== token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    if (new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Token expirado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Error al restablecer contraseña" }, { status: 500 })
  }
}