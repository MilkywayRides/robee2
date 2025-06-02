import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      status,
      coverImage,
      tags = [],
      scheduledAt,
      isAutoSave = false,
    } = body;

    const post = await db.post.findUnique({
      where: {
        id: params.postId,
        authorId: session.user.id,
      },
      include: {
        tags: true,
      },
    });

    if (!post) {
      return new NextResponse("Not found", { status: 404 });
    }

    // If it's an auto-save, don't update the status or scheduledAt
    const updateData = {
      title,
      excerpt,
      content,
      coverImage,
      ...(isAutoSave ? {} : {
        status: status as PostStatus,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
      }),
      tags: {
        disconnect: post.tags.map(tag => ({ id: tag.id })),
        connectOrCreate: tags.map((tagName: string) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    };

    const updatedPost = await db.post.update({
      where: {
        id: params.postId,
      },
      data: updateData,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json({
      post: updatedPost,
      message: isAutoSave ? "Auto-saved successfully" : "Saved successfully"
    });
  } catch (error) {
    console.error("[POST_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await db.post.findUnique({
      where: {
        id: params.postId,
        authorId: session.user.id,
      },
    });

    if (!post) {
      return new NextResponse("Not found", { status: 404 });
    }

    await db.post.delete({
      where: {
        id: params.postId,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}