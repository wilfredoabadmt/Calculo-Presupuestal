"use client"

import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
      <div className="relative h-11 w-11 rounded overflow-hidden flex items-center justify-center bg-slate-950/60 border border-slate-850 shrink-0">
        <img src="/logo.webp" alt="Logo" className="h-full w-full object-contain filter brightness-95 contrast-105 saturate-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 to-blue-600/30 mix-blend-color pointer-events-none" />
      </div>
    </Link>
  )
}
