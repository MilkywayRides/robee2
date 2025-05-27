"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Code, 
  MoreHorizontal, 
  Clock, 
  Archive,
  ExternalLink,
  Trash2,
  X,
  FileIcon
} from "lucide-react"

// Type for our project data from the database
interface Project {
  id: string
  title: string
  content: string | null
  status: "DRAFT" | "PUBLISHED"
  createdAt: string
  updatedAt: string
  authorId: string
  files: Array<{
    name: string
    path: string
    size: number
    type: string
    uploadedAt: string
  }>
}

interface ProjectsDashboardProps {
  projects: Project[]
  filter?: "all" | "active" | "archived"
}

export default function ProjectsDashboard({ projects, filter = "all" }: ProjectsDashboardProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  
  // Filter projects based on the selected tab
  const filteredProjects = projects.filter(project => {
    if (filter === "all") return true
    if (filter === "active") return project.status === "DRAFT"
    if (filter === "archived") return project.status === "PUBLISHED"
    return true
  })
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date)
  }
  
  const toggleProjectSelection = (id: string) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter(projectId => projectId !== id))
    } else {
      setSelectedProjects([...selectedProjects, id])
    }
  }

  const selectAllProjects = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(filteredProjects.map(project => project.id))
    }
  }
  
  return (
    <div className="space-y-6">
      {selectedProjects.length > 0 && (
        <Card className="border-none shadow-sm bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 py-1">
                  {selectedProjects.length} selected
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-8"
                  onClick={selectAllProjects}
                >
                  {selectedProjects.length === filteredProjects.length ? "Deselect all" : "Select all"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="gap-1 h-8"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 h-8"
                  onClick={() => setIsArchiveDialogOpen(true)}
                >
                  <Archive size={14} />
                  <span className="hidden sm:inline">Archive</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 h-8"
                  onClick={() => setSelectedProjects([])}
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {filteredProjects.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 p-4 bg-muted rounded-full">
              {filter === "archived" ? (
                <Archive size={32} className="text-muted-foreground" />
              ) : (
                <Code size={32} className="text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-1">No projects found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {filter === "archived" 
                ? "You don't have any archived projects yet." 
                : "Get started by creating your first project."}
            </p>
            {filter === "all" && (
              <Link href="/dashboard/projects/create">
                <Button className="mt-4">
                  Create new project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {filteredProjects.map(project => (
            <Card 
              key={project.id} 
              className="overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="flex items-start p-4">
                  <div className="pr-3 pt-1">
                    <Checkbox 
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => toggleProjectSelection(project.id)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <Link href={`/dashboard/projects/${project.id}`} className="group">
                            <h3 className="font-semibold text-base group-hover:underline">
                              {project.title}
                            </h3>
                          </Link>
                          <Badge variant="outline" className="text-xs font-normal">
                            {project.status.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1 mb-3 line-clamp-2">
                          {JSON.parse(project.content || '{}').description}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/projects/${project.id}`} className="flex items-center w-full">
                              <ExternalLink size={14} className="mr-2" />
                              View project
                            </Link>
                          </DropdownMenuItem>
                          <Separator className="my-1" />
                          <DropdownMenuItem className="text-destructive">
                            <span className="flex items-center">
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center flex-wrap text-xs gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <FileIcon size={14} className="mr-1 text-muted-foreground" />
                        {project.files?.length || 0} files
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-muted-foreground" />
                        Updated on {formatDate(project.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected projects
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived projects will be read-only and hidden from regular views. You can unarchive them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}