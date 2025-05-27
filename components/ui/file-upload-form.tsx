"use client"

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Progress } from './progress'

interface FileUploadFormProps {
  projectId: string
  onUploadComplete?: () => void
}

export function FileUploadForm({ projectId, onUploadComplete }: FileUploadFormProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files)
    }
  }

  const uploadFiles = useCallback(async () => {
    if (!selectedFiles) return

    try {
      setUploading(true)
      
      // Create FormData to send files
      const formData = new FormData()
      formData.append('projectId', projectId)
      
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file)
      })

      // Upload files
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Refresh the page data
      router.refresh()
      if (onUploadComplete) {
        onUploadComplete()
      }
      
      setSelectedFiles(null)
      setUploadProgress(100)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [selectedFiles, projectId, router, onUploadComplete])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="flex-1"
          disabled={uploading}
        />
        <Button
          onClick={uploadFiles}
          disabled={!selectedFiles || uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>
      
      {uploading && (
        <Progress value={uploadProgress} className="w-full" />
      )}
      
      {selectedFiles && (
        <div className="text-sm text-muted-foreground">
          Selected {selectedFiles.length} file(s)
        </div>
      )}
    </div>
  )
}