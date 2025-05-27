import { Metadata } from "next"
import { DataTable } from "./data-table"
import { getCurrentRole } from "@/lib/authentication"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "R00Bee. | User Management",
  description: "Manage user accounts and permissions",
}

export default async function UsersPage() {
  const role = await getCurrentRole()

  if (role !== UserRole.ADMIN) {
    redirect("/")
  }

  return (
    <RoleGate allowedRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            </div>
            <DataTable />
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  )
}