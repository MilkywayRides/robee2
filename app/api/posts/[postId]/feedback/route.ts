import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FeedbackType } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type || !["LIKE", "DISLIKE"].includes(type)) {
      return new NextResponse("Invalid feedback type", { status: 400 });
    }

    // Get current feedback
    const currentFeedback = await db.postFeedback.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: session.user.id,
        },
      },
    });

    // If user is trying to submit the same feedback type, remove it
    if (currentFeedback?.type === type) {
      await db.postFeedback.delete({
        where: {
          id: currentFeedback.id,
        },
      });
    } else {
      // If user is changing their feedback or submitting new feedback
      await db.postFeedback.upsert({
        where: {
          postId_userId: {
            postId: params.postId,
            userId: session.user.id,
          },
        },
        update: {
          type: type as FeedbackType,
        },
        create: {
          postId: params.postId,
          userId: session.user.id,
          type: type as FeedbackType,
        },
      });
    }

    // Get updated counts
    const [likes, dislikes] = await Promise.all([
      db.postFeedback.count({
        where: {
          postId: params.postId,
          type: "LIKE",
        },
      }),
      db.postFeedback.count({
        where: {
          postId: params.postId,
          type: "DISLIKE",
        },
      }),
    ]);

    // Get user's current feedback
    const userFeedback = await db.postFeedback.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      likes,
      dislikes,
      userFeedback: userFeedback?.type || null,
    });
  } catch (error) {
    console.error("[POST_FEEDBACK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 