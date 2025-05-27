import { auth } from "@/auth"
import { UserRole } from "@prisma/client"

export async function getCurrentUser() {
  try {
    const session = await auth()
    return session?.user || null
  } catch (error) {
    return null
  }
}

export async function getCurrentRole() {
  try {
    const session = await auth()
    return session?.user?.role || null
  } catch (error) {
    return null
  }
}