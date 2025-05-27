import { db } from "@/lib/db"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - No user email" }), 
        { status: 401 }
      )
    }

    // Get the current user using their email from the session
    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found in database" }), 
        { status: 404 }
      )
    }

    const body = await req.json()
    const { name, description } = body

    // Create project with only the fields that exist in the Prisma schema
    const project = await db.post.create({
      data: {
        title: name,
        excerpt: description.substring(0, 160) || null,
        content: JSON.stringify({ description }),
        coverImage: null,
        views: 0,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        status: "DRAFT",
        publishedAt: null,
        scheduledAt: null,
        authorId: user.id // Use the actual user ID from the database
      },
    })

    return NextResponse.json(project)

  } catch (error) {
    console.error("[PROJECTS_POST]", error)
    
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.message,
          details: error.toString()
        }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}