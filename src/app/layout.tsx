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
  metadataBase: new URL("https://calculo-presupuestal.clientify.click"),
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
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cálculo Presupuestal",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Sistema profesional para cálculo de materiales, presupuestos y análisis de precios unitarios para obras de construcción en Bolivia",
    url: "https://calculo-presupuestal.clientify.click",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "49",
      priceCurrency: "USD",
      offerCount: 2,
    },
    featureList: [
      "10 Calculadoras de construcción",
      "Presupuestos con AIU",
      "Cronograma Gantt con Curva S",
      "Banco de precios GMLP 2007",
      "Exportación PDF y Excel",
    ],
    screenshot: "https://calculo-presupuestal.clientify.click/og-image.png",
    softwareVersion: "1.0",
    author: {
      "@type": "Organization",
      name: "Cálculo Presupuestal",
    },
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}