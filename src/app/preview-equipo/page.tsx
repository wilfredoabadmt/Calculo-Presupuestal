// TEMP PREVIEW ROUTE — solo para verificación responsiva. Eliminar tras la revisión.
"use client"

import { useEffect, useState } from "react"
import { TeamUpsell } from "../(dashboard)/configuracion/equipo/page"

function Phone({ width, id }: { width: number; id: string }) {
  return (
    <div className="shrink-0">
      <div className="mb-1 text-xs font-bold text-white">{width}px</div>
      <div
        id={id}
        style={{ width }}
        className="overflow-hidden rounded-[24px] border-4 border-black bg-background"
      >
        <div className="p-3">
          <TeamUpsell />
        </div>
      </div>
    </div>
  )
}

export default function PreviewEquipoPage() {
  const [report, setReport] = useState<string[]>([])

  useEffect(() => {
    const lines: string[] = []
    ;["p360", "p390"].forEach((id) => {
      const phone = document.getElementById(id)
      if (!phone) return
      const box = phone.getBoundingClientRect()
      const limit = box.right
      phone.querySelectorAll("*").forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.right > limit + 1) {
          ;(el as HTMLElement).style.outline = "2px solid red"
          const cls = (typeof el.className === "string" ? el.className : "").slice(0, 32)
          lines.push(`[${id}] ${el.tagName.toLowerCase()} +${Math.round(r.right - limit)}px .${cls}`)
        }
      })
    })
    setReport(lines.length ? lines.slice(0, 14) : ["OK — ningun elemento excede 360/390px"])
  }, [])

  return (
    <div className="min-h-screen bg-slate-700 p-4">
      {report.length > 0 && (
        <pre className="fixed bottom-0 left-0 right-0 z-50 max-h-40 overflow-auto bg-black/90 p-2 text-[10px] leading-tight text-lime-300">
          {report.join("\n")}
        </pre>
      )}
      <div className="flex gap-6">
        <Phone width={360} id="p360" />
        <Phone width={390} id="p390" />
      </div>
    </div>
  )
}
