import { supabase } from './supabase'

export async function uploadFileToSupabase(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${path}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Error uploading file:', error.message)
      return null
    }

    // Return the public URL of the uploaded file
    const { data: publicURL } = supabase.storage
      .from(bucket)
      .getPublicUrl(`${path}/${file.name}`)

    return publicURL.publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

export async function uploadFolderToSupabase(
  files: File[],
  bucket: string,
  basePath: string
): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const relativePath = file.webkitRelativePath
    const fullPath = `${basePath}/${relativePath}`

    const url = await uploadFileToSupabase(file, bucket, fullPath.substring(0, fullPath.lastIndexOf('/')))
    if (url) {
      uploadedUrls.push(url)
    }
  }

  return uploadedUrls
}