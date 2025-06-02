'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UserRole } from '@prisma/client'
import { CheckCircle2, Clock, AlertCircle, Users, FileText, ThumbsUp, Eye } from 'lucide-react'

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table" 
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  publishedPosts: number
  totalViews: number
  totalLikes: number
  totalProjects: number
  completionRate: number
}

export default function Page() {
  const router = useRouter()
  const user = useCurrentUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch statistics from the API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast.error('Failed to load dashboard statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

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

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    showProgress = false,
    progressValue = 0
  }: { 
    title: string
    value: number
    icon: any
    description: string
    showProgress?: boolean
    progressValue?: number
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
        {showProgress && !isLoading && (
          <Progress value={progressValue} className="mt-2" />
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {description}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <RoleGate allowedRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                  <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    description="Registered users in the platform"
                  />
                  <StatCard
                    title="Published Posts"
                    value={stats?.publishedPosts || 0}
                    icon={FileText}
                    description={`${stats?.completionRate.toFixed(1) || 0}% of total posts`}
                    showProgress
                    progressValue={stats?.completionRate || 0}
                  />
                  <StatCard
                    title="Total Views"
                    value={stats?.totalViews || 0}
                    icon={Eye}
                    description="Combined views across all posts"
                  />
                  <StatCard
                    title="Total Likes"
                    value={stats?.totalLikes || 0}
                    icon={ThumbsUp}
                    description="Positive feedback received"
                  />
                </div>

                {/* Charts and Data */}
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={[]} />
              </div>
            </div>
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  )
}