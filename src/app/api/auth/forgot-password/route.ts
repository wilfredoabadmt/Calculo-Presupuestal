import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: "No existe una cuenta con ese email" }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    
    // Send email using Resend
    const emailResult = await sendPasswordResetEmail(email, resetLink)
    
    if (!emailResult.success) {
      // Log reset link as a fallback if the email service fails (e.g. invalid API key)
      console.log(`🔐 [Email Service Failed/Dev Mode] Reset Link: ${resetLink}`)
    }

    return NextResponse.json({ message: "Si el email existe, recibirás un enlace de restablecimiento" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}