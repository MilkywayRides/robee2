import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { getUserById } from "@/data/user";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure user exists in DB
    const user = await getUserById(session.user.id);
    if (!user) {
      return new NextResponse("User not found in database", { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      status,
      coverImage,
      tags = [], // Array of tag names
      scheduledDate,
    } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Create or connect tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName: string) => {
        return await db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
      })
    );

    // Create post with connected tags
    const post = await db.post.create({
      data: {
        title,
        excerpt: excerpt || "",
        content: content,
        status: status as PostStatus,
        coverImage: coverImage || "",
        authorId: session.user.id,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
        scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
        tags: {
          connect: tagObjects.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        feedback: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    console.log("Starting GET /api/posts request");
    const session = await auth();
    console.log("Auth session:", session?.user?.id ? "Authenticated" : "Not authenticated");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    console.log("Request params:", { status });

    // If user is authenticated, show their posts
    if (session?.user?.id) {
      console.log("Fetching posts for user:", session.user.id);
      try {
        const posts = await db.post.findMany({
          where: {
            authorId: session.user.id,
            ...(status && status !== "all" ? { status: status as PostStatus } : {}),
          },
          include: {
            tags: true,
            feedback: true,
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        console.log(`Found ${posts.length} posts for user`);
        return NextResponse.json(posts);
      } catch (dbError) {
        console.error("Database error in authenticated query:", dbError);
        return NextResponse.json(
          { error: "Database error occurred", details: dbError instanceof Error ? dbError.message : "Unknown database error" },
          { status: 500 }
        );
      }
    }

    // For unauthenticated users, only show published posts
    console.log("Fetching published posts for unauthenticated user");
    try {
      const posts = await db.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
        },
        include: {
          tags: true,
          feedback: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      console.log(`Found ${posts.length} published posts`);
      return NextResponse.json(posts);
    } catch (dbError) {
      console.error("Database error in unauthenticated query:", dbError);
      return NextResponse.json(
        { error: "Database error occurred", details: dbError instanceof Error ? dbError.message : "Unknown database error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[POSTS_GET] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}