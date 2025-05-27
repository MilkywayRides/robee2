import { Metadata } from "next"
import { getCurrentRole } from "@/lib/authentication"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { Footer } from "@/components/footer"
import ProjectsDashboard from "./projects-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "R00Bee. | Projects Hub",
  description: "Manage your projects and code inventory in one place",
}

export default async function ProjectsPage() {
  const role = await getCurrentRole()
  const session = await auth()

  if (role !== UserRole.ADMIN) {
    redirect("/")
  }

  if (!session?.user?.email) {
    return null
  }

  // Fetch projects for the current user
  const projects = await db.post.findMany({
    where: {
      author: {
        email: session.user.email
      }
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Format projects
  const formattedProjects = projects.map(project => ({
    id: project.id,
    title: project.title,
    content: project.content,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    authorId: project.authorId,
    author: {
      name: project.author.name,
      email: project.author.email,
      image: project.author.image
    }
  }))

  return (
    <RoleGate allowedRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="container py-8 max-w-7xl">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0 pt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects Hub</h1>
                    <p className="text-muted-foreground mt-1">
                      Manage your projects and code inventory
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="transition-colors">
                      {new Date("2025-04-16 08:25:39").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Badge>
                    <Button className="transition-colors" asChild>
                      <Link href="/dashboard/projects/create">
                        <Plus size={16} className="mr-2" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </div>
                <Separator className="my-4" />
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search projects by name, tags, or description..." 
                      className="pl-9 bg-muted/50 border-muted"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter size={14} />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <SlidersHorizontal size={14} />
                      Sort
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-foreground rounded-none h-10 px-4 font-medium"
                    >
                      All Projects
                    </TabsTrigger>
                    <TabsTrigger 
                      value="active" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-foreground rounded-none h-10 px-4 font-medium"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger 
                      value="archived" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-foreground rounded-none h-10 px-4 font-medium"
                    >
                      Archived
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <ProjectsDashboard projects={formattedProjects} filter="all" />
                  </TabsContent>
                  <TabsContent value="active" className="mt-6">
                    <ProjectsDashboard projects={formattedProjects} filter="active" />
                  </TabsContent>
                  <TabsContent value="archived" className="mt-6">
                    <ProjectsDashboard projects={formattedProjects} filter="archived" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  )
}