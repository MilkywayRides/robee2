import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getCurrentRole } from "@/lib/authentication"
import { UserRole } from "@prisma/client"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const role = await getCurrentRole()
    const currentTime = "2025-04-16 08:48:48"
    const currentUser = "MilkywayRides"

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const projectId = params.id

    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400 })
    }

    // Get the project with its files
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        author: {
          email: session.user.email
        }
      },
      include: {
        files: true  // Include the files associated with this project
      }
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    // Map the project files to the expected format
    const files = project.files?.map(file => ({
      name: file.name,
      type: file.type || "file",
      size: file.size,
      created_at: file.createdAt.toISOString(),
      path: file.path,
      url: file.url
    })) || []

    return NextResponse.json({ files })
  } catch (error) {
    console.error("[PROJECT_FILES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const role = await getCurrentRole()
    const currentTime = "2025-04-16 08:48:48"
    const currentUser = "MilkywayRides"

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const projectId = params.id

    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400 })
    }

    // Get the project to verify ownership
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        author: {
          email: session.user.email
        }
      }
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Create a new file record in the database
    const newFile = await db.file.create({
      data: {
        name: file.name,
        size: file.size,
        type: file.type,
        path: `${projectId}/${file.name}`,
        url: `/api/projects/${projectId}/files/${file.name}`,
        project: {
          connect: {
            id: projectId
          }
        }
      }
    })

    return NextResponse.json({ 
      message: "File uploaded successfully",
      file: newFile
    })

  } catch (error) {
    console.error("[PROJECT_FILES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}