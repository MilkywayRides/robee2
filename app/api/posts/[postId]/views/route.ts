import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.postId;

    // Check if user has already viewed this post
    const existingView = await db.view.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingView) {
      // Update the view timestamp
      await db.view.update({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
        data: {
          updatedAt: new Date(),
        },
      });
    } else {
      // Create a new view
      await db.view.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });

      // Increment post views count
      await db.post.update({
        where: { id: postId },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[VIEW_CREATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.postId;

    const views = await db.view.findMany({
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(views);
  } catch (error) {
    console.error("[VIEWS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 