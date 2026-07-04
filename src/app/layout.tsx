import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Cálculo Presupuestal - Sistema de Presupuestos de Construcción",
  description: "Sistema profesional para cálculo de materiales, presupuestos y análisis de precios unitarios para obras de construcción",
  keywords: ["construcción", "presupuesto", "materiales", "cálculo", "APU", "cronograma"],
  authors: [{ name: "Cálculo Presupuestal" }],
  creator: "Cálculo Presupuestal",
  publisher: "Cálculo Presupuestal",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: "https://calculo-presupuestal.clientify.click",
    siteName: "Cálculo Presupuestal",
    title: "Cálculo Presupuestal - Sistema de Presupuestos de Construcción",
    description: "Sistema profesional para cálculo de materiales, presupuestos y análisis de precios unitarios",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cálculo Presupuestal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cálculo Presupuestal",
    description: "Sistema profesional para cálculo de materiales y presupuestos de construcción",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}