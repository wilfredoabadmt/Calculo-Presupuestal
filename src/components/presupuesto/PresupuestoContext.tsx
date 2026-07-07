"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

// Types
export interface Partida {
  id: string
  capituloId: string
  codigo: string
  descripcion: string
  unidad: string
  precioBase: number
  activo: boolean
}

export interface Capitulo {
  id: string
  proyectoId: string
  codigo: number
  nombre: string
  descripcion: string | null
  orden: number
  activo: boolean
  partidas: Partida[]
}

export interface Medicion {
  id: string
  partidaId: string
  presupuestoId: string
  veces: number
  largo: number
  ancho: number
  alto: number
  parcial: number
  precioUnitario: number
  costoTotal: number
  calculadoraUsada: string | null
  calculadoraDatos: string | null
  partida?: Partida & { capitulo?: { codigo: number; nombre: string } }
}

export interface PresupuestoDetallado {
  id: string
  proyectoId: string
  empresaNombre: string | null
  empresaDireccion: string | null
  empresaCif: string | null
  empresaTelefono: string | null
  empresaLogo: string | null
  clienteNombre: string | null
  clienteDireccion: string | null
  clientePoblacion: string | null
  clienteCif: string | null
  proyectoNombre: string | null
  fechaEmision: string
  codigoPresupuesto: string | null
  porcentajeBI: number
  porcentajeIVA: number
  subtotalMaterial: number
  beneficioIndustrial: number
  baseImponible: number
  montoIVA: number
  totalPresupuesto: number
}

interface PresupuestoState {
  proyectoId: string
  presupuesto: PresupuestoDetallado | null
  capitulos: Capitulo[]
  mediciones: Medicion[]
  loading: boolean
  saving: boolean
}

interface PresupuestoContextType extends PresupuestoState {
  cargarDatos: () => Promise<void>
  // Capítulos
  crearCapitulo: (codigo: number, nombre: string, descripcion?: string) => Promise<Capitulo | null>
  actualizarCapitulo: (capituloId: string, data: { nombre?: string; descripcion?: string }) => Promise<void>
  eliminarCapitulo: (capituloId: string) => Promise<void>
  reordenarCapitulos: (capitulos: { id: string; orden: number }[]) => Promise<void>
  // Partidas
  crearPartida: (capituloId: string, data: { codigo: string; descripcion: string; unidad: string; precioBase: number }) => Promise<Partida | null>
  actualizarPartida: (partidaId: string, data: { descripcion?: string; unidad?: string; precioBase?: number }) => Promise<void>
  eliminarPartida: (partidaId: string) => Promise<void>
  // Mediciones
  crearMedicion: (data: {
    partidaId: string
    veces?: number
    largo?: number
    ancho?: number
    alto?: number
    precioUnitario?: number
    calculadoraUsada?: string
    calculadoraDatos?: string
  }) => Promise<Medicion | null>
  actualizarMedicion: (medicionId: string, data: {
    veces?: number
    largo?: number
    ancho?: number
    alto?: number
    precioUnitario?: number
    calculadoraUsada?: string
    calculadoraDatos?: string
  }) => Promise<void>
  eliminarMedicion: (medicionId: string) => Promise<void>
  // Presupuesto
  actualizarParametros: (data: { porcentajeBI?: number; porcentajeIVA?: number }) => Promise<void>
  actualizarDatosEmpresa: (data: Partial<PresupuestoDetallado>) => Promise<void>
  // Utilidades
  obtenerMedicionesPorCapitulo: (capituloId: string) => Medicion[]
  obtenerSubtotalCapitulo: (capituloId: string) => number
}

const PresupuestoContext = createContext<PresupuestoContextType | null>(null)

export function usePresupuesto() {
  const ctx = useContext(PresupuestoContext)
  if (!ctx) throw new Error("usePresupuesto debe usarse dentro de PresupuestoProvider")
  return ctx
}

export function PresupuestoProvider({ proyectoId, children }: { proyectoId: string; children: ReactNode }) {
  const [presupuesto, setPresupuesto] = useState<PresupuestoDetallado | null>(null)
  const [capitulos, setCapitulos] = useState<Capitulo[]>([])
  const [mediciones, setMediciones] = useState<Medicion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [pdRes, capRes, medRes] = await Promise.all([
        fetch(`/api/proyectos/${proyectoId}/presupuesto-detallado`),
        fetch(`/api/proyectos/${proyectoId}/capitulos`),
        fetch(`/api/proyectos/${proyectoId}/mediciones`),
      ])

      if (pdRes.ok) setPresupuesto(await pdRes.json())
      if (capRes.ok) setCapitulos(await capRes.json())
      if (medRes.ok) setMediciones(await medRes.json())
    } catch (e) {
      console.error("Error cargando datos del presupuesto:", e)
    } finally {
      setLoading(false)
    }
  }, [proyectoId])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // ====== CAPÍTULOS ======
  const crearCapitulo = async (codigo: number, nombre: string, descripcion?: string) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, nombre, descripcion }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Error al crear capítulo")
      return null
    }
    const nuevo = await res.json()
    setCapitulos(prev => [...prev, { ...nuevo, partidas: [] }].sort((a, b) => a.orden - b.orden))
    return nuevo
  }

  const actualizarCapitulo = async (capituloId: string, data: { nombre?: string; descripcion?: string }) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capituloId, ...data }),
    })
    if (res.ok) {
      const actualizado = await res.json()
      setCapitulos(prev => prev.map(c => c.id === capituloId ? { ...c, ...actualizado } : c))
    }
  }

  const eliminarCapitulo = async (capituloId: string) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos?capituloId=${capituloId}`, { method: "DELETE" })
    if (res.ok) {
      setCapitulos(prev => prev.filter(c => c.id !== capituloId))
      setMediciones(prev => prev.filter(m => {
        const cap = capitulos.find(c => c.id === capituloId)
        if (!cap) return true
        return !cap.partidas.some(p => p.id === m.partidaId)
      }))
    }
  }

  const reordenarCapitulos = async (items: { id: string; orden: number }[]) => {
    // Optimistic update
    setCapitulos(prev => prev.map(c => {
      const item = items.find(i => i.id === c.id)
      return item ? { ...c, orden: item.orden } : c
    }).sort((a, b) => a.orden - b.orden))

    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capitulos: items }),
    })
    if (!res.ok) await cargarDatos()
  }

  // ====== PARTIDAS ======
  const crearPartida = async (capituloId: string, data: { codigo: string; descripcion: string; unidad: string; precioBase: number }) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos/${capituloId}/partidas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Error al crear partida")
      return null
    }
    const nueva = await res.json()
    setCapitulos(prev => prev.map(c =>
      c.id === capituloId ? { ...c, partidas: [...c.partidas, nueva].sort((a, b) => a.codigo.localeCompare(b.codigo)) } : c
    ))
    return nueva
  }

  const actualizarPartida = async (partidaId: string, data: { descripcion?: string; unidad?: string; precioBase?: number }) => {
    // Find the capitulo that owns this partida
    const cap = capitulos.find(c => c.partidas.some(p => p.id === partidaId))
    if (!cap) return

    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos/${cap.id}/partidas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partidaId, ...data }),
    })
    if (res.ok) {
      const actualizada = await res.json()
      setCapitulos(prev => prev.map(c =>
        c.id === cap.id ? { ...c, partidas: c.partidas.map(p => p.id === partidaId ? { ...p, ...actualizada } : p) } : c
      ))
    }
  }

  const eliminarPartida = async (partidaId: string) => {
    const cap = capitulos.find(c => c.partidas.some(p => p.id === partidaId))
    if (!cap) return

    const res = await fetch(`/api/proyectos/${proyectoId}/capitulos/${cap.id}/partidas?partidaId=${partidaId}`, { method: "DELETE" })
    if (res.ok) {
      setCapitulos(prev => prev.map(c =>
        c.id === cap.id ? { ...c, partidas: c.partidas.filter(p => p.id !== partidaId) } : c
      ))
      setMediciones(prev => prev.filter(m => m.partidaId !== partidaId))
    }
  }

  // ====== MEDICIONES ======
  const crearMedicion = async (data: {
    partidaId: string
    veces?: number
    largo?: number
    ancho?: number
    alto?: number
    precioUnitario?: number
    calculadoraUsada?: string
    calculadoraDatos?: string
  }) => {
    if (!presupuesto) return null

    const res = await fetch(`/api/proyectos/${proyectoId}/mediciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, presupuestoId: presupuesto.id }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Error al crear medición")
      return null
    }
    const nueva = await res.json()
    setMediciones(prev => [...prev, nueva])
    // Refresh presupuesto for updated totals
    const pdRes = await fetch(`/api/proyectos/${proyectoId}/presupuesto-detallado`)
    if (pdRes.ok) setPresupuesto(await pdRes.json())
    return nueva
  }

  const actualizarMedicion = async (medicionId: string, data: {
    veces?: number
    largo?: number
    ancho?: number
    alto?: number
    precioUnitario?: number
    calculadoraUsada?: string
    calculadoraDatos?: string
  }) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/mediciones`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicionId, ...data }),
    })
    if (res.ok) {
      const actualizada = await res.json()
      setMediciones(prev => prev.map(m => m.id === medicionId ? actualizada : m))
      // Refresh presupuesto
      const pdRes = await fetch(`/api/proyectos/${proyectoId}/presupuesto-detallado`)
      if (pdRes.ok) setPresupuesto(await pdRes.json())
    }
  }

  const eliminarMedicion = async (medicionId: string) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/mediciones?medicionId=${medicionId}`, { method: "DELETE" })
    if (res.ok) {
      setMediciones(prev => prev.filter(m => m.id !== medicionId))
      const pdRes = await fetch(`/api/proyectos/${proyectoId}/presupuesto-detallado`)
      if (pdRes.ok) setPresupuesto(await pdRes.json())
    }
  }

  // ====== PRESUPUESTO ======
  const actualizarParametros = async (data: { porcentajeBI?: number; porcentajeIVA?: number }) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/presupuesto-detallado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) setPresupuesto(await res.json())
  }

  const actualizarDatosEmpresa = async (data: Partial<PresupuestoDetallado>) => {
    const res = await fetch(`/api/proyectos/${proyectoId}/presupuesto-detallado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) setPresupuesto(await res.json())
  }

  // ====== UTILIDADES ======
  const obtenerMedicionesPorCapitulo = (capituloId: string) => {
    const cap = capitulos.find(c => c.id === capituloId)
    if (!cap) return []
    const partidaIds = new Set(cap.partidas.map(p => p.id))
    return mediciones.filter(m => partidaIds.has(m.partidaId))
  }

  const obtenerSubtotalCapitulo = (capituloId: string) => {
    return obtenerMedicionesPorCapitulo(capituloId).reduce((sum, m) => sum + m.costoTotal, 0)
  }

  return (
    <PresupuestoContext.Provider
      value={{
        proyectoId,
        presupuesto,
        capitulos,
        mediciones,
        loading,
        saving,
        cargarDatos,
        crearCapitulo,
        actualizarCapitulo,
        eliminarCapitulo,
        reordenarCapitulos,
        crearPartida,
        actualizarPartida,
        eliminarPartida,
        crearMedicion,
        actualizarMedicion,
        eliminarMedicion,
        actualizarParametros,
        actualizarDatosEmpresa,
        obtenerMedicionesPorCapitulo,
        obtenerSubtotalCapitulo,
      }}
    >
      {children}
    </PresupuestoContext.Provider>
  )
}
