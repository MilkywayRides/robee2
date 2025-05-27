import { NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/authentication"
import { UpdateProfileSchema } from "@/schemas"

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = UpdateProfileSchema.parse(body)
    
    const { role, name, email, isTwoFactorEnabled } = validatedData

    // Check if user has permission to update roles
    if (currentUser.role !== 'ADMIN') {
      return new NextResponse('Permission denied', { status: 403 })
    }

    const updatedUser = await db.user.update({
      where: { id: params.userId },
      data: {
        role,
        name,
        email,
        isTwoFactorEnabled
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[USER_UPDATE]', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Error', 
      { status: 500 }
    )
  }
}