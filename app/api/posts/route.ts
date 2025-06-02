import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { getUserById } from "@/data/user";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, excerpt, content, status, coverImage, tags, scheduledAt } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (status === "SCHEDULED" && !scheduledAt) {
      return new NextResponse("Schedule date is required for scheduled posts", { status: 400 });
    }

    const post = await db.post.create({
      data: {
        title,
        excerpt,
        content,
        status,
        coverImage,
        scheduledAt: status === "SCHEDULED" ? new Date(scheduledAt) : null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
        tags: {
          create: tags.map((tag: string) => ({
            name: tag,
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_CREATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      authorId: session.user.id,
      ...(status && status !== "all" ? { status: status as PostStatus } : {}),
    };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          tags: true,
          feedback: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[POSTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}