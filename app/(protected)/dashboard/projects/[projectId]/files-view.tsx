"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileCode,
  FileText,
  Folder,
  Download,
  Eye,
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileItem {
  name: string
  type: string
  size: number
  created_at: string
  path: string
  url?: string
}

export default function FilesView({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentTime = "2025-04-16 08:50:02"
  const currentUser = "MilkywayRides"

  useEffect(() => {
    async function fetchFiles() {
      if (!projectId) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/projects/${projectId}/files`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found')
          } else if (response.status === 401) {
            throw new Error('Unauthorized access')
          } else {
            throw new Error(`Failed to fetch files: ${response.statusText}`)
          }
        }

        let data
        try {
          const text = await response.text()
          data = JSON.parse(text)
        } catch (e) {
          console.error('Failed to parse response:', e)
          throw new Error('Invalid response format from server')
        }

        if (!data || !Array.isArray(data.files)) {
          throw new Error('Invalid data format received')
        }

        setFiles(data.files)
      } catch (error) {
        console.error('Error:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [projectId])

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch(extension) {
      case 'md':
        return <FileText size={16} className="mr-2 text-gray-500" />
      case 'json':
      case 'js':
      case 'ts':
      case 'tsx':
        return <FileCode size={16} className="mr-2 text-purple-500" />
      case 'css':
      case 'scss':
        return <FileCode size={16} className="mr-2 text-blue-500" />
      case 'html':
        return <FileCode size={16} className="mr-2 text-orange-500" />
      default:
        return <FileText size={16} className="mr-2 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (e) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="border rounded-md p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-background bg-muted/50">
            <TableHead className="w-5/12">Name</TableHead>
            <TableHead className="w-2/12">Size</TableHead>
            <TableHead className="w-3/12">Uploaded</TableHead>
            <TableHead className="w-2/12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.path} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center">
                  {file.type === "folder" ? (
                    <Folder size={16} className="mr-2 text-blue-500" />
                  ) : (
                    getFileIcon(file.name)
                  )}
                  <span className="font-medium">{file.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(file.size)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(file.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {file.url && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          if (!file.url) return
                          const a = document.createElement('a')
                          a.href = file.url
                          a.download = file.name
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                        }}
                      >
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {files.length === 0 && (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
          <h3 className="text-lg font-medium">No files uploaded yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Files uploaded during project creation will appear here
          </p>
        </div>
      )}
    </div>
  )
}