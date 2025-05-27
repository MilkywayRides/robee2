'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { UserRole } from '@prisma/client'

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table" 
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Footer } from "@/components/footer"

import data from "./data.json"

export default function Page() {
  const router = useRouter()
  const user = useCurrentUser()

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      toast.error("You don't have access to this page")
      router.push('/')
    }
  }, [user, router])

  // Show nothing while checking the role
  if (!user || user.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <RoleGate allowedRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  )
}