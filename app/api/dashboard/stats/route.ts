import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PostStatus } from "@prisma/client"

export async function GET() {
  try {
    const [
      totalUsers,
      totalPosts,
      publishedPosts,
      totalViews,
      totalLikes,
      totalProjects
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.post.count({ where: { status: PostStatus.PUBLISHED } }),
      db.post.aggregate({ _sum: { views: true } }),
      db.postFeedback.count({ where: { type: 'LIKE' } }),
      db.project.count()
    ])

    const completionRate = totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0

    return NextResponse.json({
      totalUsers,
      totalPosts,
      publishedPosts,
      totalViews: totalViews._sum.views || 0,
      totalLikes,
      totalProjects,
      completionRate
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 