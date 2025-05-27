import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFileToSupabase(
  file: File,
  path: string,
): Promise<string | null> {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name} exceeds 50MB limit`)
      return null
    }

    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(`${path}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Error uploading file:', error.message)
      toast.error(`Failed to upload ${file.name}`)
      return null
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(`${path}/${file.name}`)

    toast.success(`Successfully uploaded ${file.name}`)
    return publicUrl
  } catch (error) {
    console.error('Error in uploadFileToSupabase:', error)
    toast.error(`Failed to upload ${file.name}`)
    return null
  }
}

/**
 * Upload a folder structure to Supabase Storage
 */
export async function uploadFolderToSupabase(
  files: File[],
  basePath: string,
): Promise<string[]> {
  const uploadedUrls: string[] = []

  try {
    for (const file of files) {
      const relativePath = file.webkitRelativePath
      const fullPath = `${basePath}/${relativePath}`
      const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'))

      const url = await uploadFileToSupabase(file, dirPath)
      if (url) {
        uploadedUrls.push(url)
      }
    }

    return uploadedUrls
  } catch (error) {
    console.error('Error in uploadFolderToSupabase:', error)
    toast.error('Failed to upload folder')
    return uploadedUrls
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFileFromSupabase(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('project-files')
      .remove([path])

    if (error) {
      console.error('Error deleting file:', error.message)
      toast.error(`Failed to delete ${path}`)
      return false
    }

    toast.success(`Successfully deleted ${path}`)
    return true
  } catch (error) {
    console.error('Error in deleteFileFromSupabase:', error)
    toast.error(`Failed to delete ${path}`)
    return false
  }
}

/**
 * List files in a Supabase Storage path
 */
export async function listFilesInSupabase(path: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('project-files')
      .list(path)

    if (error) {
      console.error('Error listing files:', error.message)
      toast.error(`Failed to list files in ${path}`)
      return []
    }

    return data.map(item => item.name)
  } catch (error) {
    console.error('Error in listFilesInSupabase:', error)
    toast.error(`Failed to list files in ${path}`)
    return []
  }
}

/**
 * Get a public URL for a file in Supabase Storage
 */
export function getPublicUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Move/Copy a file within Supabase Storage
 */
export async function moveFile(
  fromPath: string,
  toPath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('project-files')
      .move(fromPath, toPath)

    if (error) {
      console.error('Error moving file:', error.message)
      toast.error(`Failed to move ${fromPath}`)
      return false
    }

    toast.success(`Successfully moved ${fromPath} to ${toPath}`)
    return true
  } catch (error) {
    console.error('Error in moveFile:', error)
    toast.error(`Failed to move ${fromPath}`)
    return false
  }
}