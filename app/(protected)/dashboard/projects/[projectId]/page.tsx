import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { getCurrentRole } from "@/lib/authentication"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitBranch, GitFork, History, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import FilesView from "./files-view"
import { Suspense } from "react"

interface PageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await Promise.resolve(params)
  const role = await getCurrentRole()
  const session = await auth()
  const currentTime = "2025-04-16 09:18:31"
  const currentUser = "MilkywayRides"

  if (role !== UserRole.ADMIN) {
    redirect("/")
  }

  if (!session?.user?.email) {
    return null
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId
    },
    include: {
      createdBy: true // Changed from author to createdBy
    }
  })

  if (!project) {
    return notFound()
  }

  return (
    <RoleGate allowedRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="container mx-auto py-8 max-w-7xl">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      {project.status.toLowerCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created on {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="files" className="w-full">
                <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto">
                  <TabsTrigger 
                    value="files" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-foreground rounded-none h-10 px-4 font-medium"
                  >
                    <GitBranch size={16} className="mr-2" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-foreground rounded-none h-10 px-4 font-medium"
                  >
                    <History size={16} className="mr-2" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-foreground rounded-none h-10 px-4 font-medium"
                  >
                    <Shield size={16} className="mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm">
                        <GitFork size={14} className="mr-1" />
                        Fork
                      </Button>
                      <Button variant="outline" size="sm">
                        <Star size={14} className="mr-1" />
                        Star
                      </Button>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/projects/${projectId}/upload`}>
                        Upload Files
                      </Link>
                    </Button>
                  </div>
                  <Suspense 
                    fallback={
                      <div className="border rounded-md p-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      </div>
                    }
                  >
                    <FilesView projectId={projectId} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Recent Activity</h2>
                        <Badge variant="outline">
                          Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="text-center py-8 text-muted-foreground">
                        No recent activity
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Project Settings</h2>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={project.status === "DRAFT" ? "outline" : "secondary"}>
                            {project.status.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">Created By</span>
                          <span className="font-medium">{project.createdBy.name || project.createdBy.email}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">Created</span>
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  )
}