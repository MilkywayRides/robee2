import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // all, week, month, year

    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    const where = {
      authorId: session.user.id,
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    };

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalViews,
      totalLikes,
      totalComments,
      postsByStatus,
      postsByMonth,
    ] = await Promise.all([
      db.post.count({ where }),
      db.post.count({ where: { ...where, status: "PUBLISHED" } }),
      db.post.count({ where: { ...where, status: "DRAFT" } }),
      db.post.count({ where: { ...where, status: "SCHEDULED" } }),
      db.post.aggregate({
        where: { ...where, status: "PUBLISHED" },
        _sum: { views: true },
      }),
      db.post.aggregate({
        where: { ...where, status: "PUBLISHED" },
        _sum: { likes: true },
      }),
      db.feedback.count({
        where: {
          post: {
            authorId: session.user.id,
            ...(startDate ? { createdAt: { gte: startDate } } : {}),
          },
        },
      }),
      db.post.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      db.post.groupBy({
        by: ["status"],
        where,
        _count: true,
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalViews: totalViews._sum.views || 0,
      totalLikes: totalLikes._sum.likes || 0,
      totalComments,
      postsByStatus,
      postsByMonth,
    });
  } catch (error) {
    console.error("[STATS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 