import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { UserRole } from "@prisma/client"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        isTwoFactorEnabled: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true
          }
        }
      },
      orderBy: [
        {
          role: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return new NextResponse("User ID required", { status: 400 })
    }

    await db.user.delete({
      where: { id: userId }
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}