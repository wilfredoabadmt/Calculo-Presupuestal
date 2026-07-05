import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const appName = process.env.NEXT_PUBLIC_APP_NAME || "Cálculo Presupuestal"

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [email],
      subject: `Restablecer contraseña - ${appName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center; margin-bottom: 20px;">Restablecer tu Contraseña</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Hola,
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>${appName}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña seguirá siendo la misma.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
            Este enlace expirará en 1 hora.<br />
            Si el botón no funciona, copia y pega la siguiente URL en tu navegador:<br />
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [email],
      subject: `¡Bienvenido a ${appName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center; margin-bottom: 20px;">¡Hola, ${name}!</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Te damos la bienvenida a <strong>${appName}</strong>. Nos alegra mucho tenerte con nosotros.
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">
            Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a gestionar tus proyectos y presupuestos de manera profesional.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Iniciar Sesión en tu Cuenta
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
            Si tienes alguna duda o necesitas ayuda, no dudes en responder a este correo.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error }
  }
}
