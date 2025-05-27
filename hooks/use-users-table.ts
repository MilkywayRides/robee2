import { useState, useEffect } from "react"
import { User } from "@prisma/client"
import { fetchWithError } from "@/lib/utils"
import { API_ENDPOINTS } from "@/lib/constants"
import { toast } from "sonner"

export function useUsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await fetchWithError(API_ENDPOINTS.USERS)
      setUsers(data)
    } catch (e) {
      console.error("Failed to fetch users:", e)
      setError("Failed to load users")
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await fetchWithError(API_ENDPOINTS.USERS, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      
      toast.success("User deleted successfully")
      await fetchUsers()
    } catch (e) {
      console.error("Failed to delete user:", e)
      toast.error("Failed to delete user")
      throw e
    }
  }

  return {
    users,
    loading,
    error,
    deleteUser,
    refreshUsers: fetchUsers,
  }
}