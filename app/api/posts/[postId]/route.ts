import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
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

    const post = await db.post.update({
      where: {
        id: params.postId,
        authorId: session.user.id,
      },
      data: {
        title,
        excerpt,
        content,
        status,
        coverImage,
        scheduledAt: status === "SCHEDULED" ? new Date(scheduledAt) : null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        tags: {
          deleteMany: {},
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
    console.error("[POST_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await db.post.findUnique({
      where: {
        id: params.postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
      },
    });

    if (!post) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await db.post.delete({
      where: {
        id: params.postId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}