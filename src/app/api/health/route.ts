import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verify database is accessible
    await prisma.$queryRaw`SELECT 1`

    // Count users to verify schema is ready
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
