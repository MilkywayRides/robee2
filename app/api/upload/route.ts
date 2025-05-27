import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      )
    }

    // Get current user from database
    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }), 
        { status: 404 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string
    const path = formData.get("path") as string

    if (!file || !projectId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }), 
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Upload the file to your storage service (S3, etc.)
    // 2. Save the file metadata in your database
    // 3. Associate the file with the project

    const fileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      path: path || file.name,
      projectId: projectId,
      uploadedAt: "2025-04-16T08:16:01Z",
      uploadedBy: user.id
    }

    // For now, we'll just return success
    return NextResponse.json({
      message: "File uploaded successfully",
      file: fileMetadata
    })

  } catch (error) {
    console.error("[UPLOAD_POST]", error)
    
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal Server Error" 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formData
  },
}