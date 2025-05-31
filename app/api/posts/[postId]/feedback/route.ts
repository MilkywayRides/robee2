import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { FeedbackType } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type || !["LIKE", "DISLIKE", null].includes(type)) {
      return new NextResponse("Invalid feedback type", { status: 400 });
    }

    // Get existing feedback
    const existingFeedback = await db.postFeedback.findFirst({
      where: {
        postId: params.postId,
        userId: session.user.id,
      },
    });

    if (existingFeedback) {
      if (type === null) {
        // Remove feedback
        await db.postFeedback.delete({
          where: {
            id: existingFeedback.id,
          },
        });
      } else {
        // Update feedback
        await db.postFeedback.update({
          where: {
            id: existingFeedback.id,
          },
          data: {
            type: type as FeedbackType,
          },
        });
      }
    } else if (type !== null) {
      // Create new feedback
      await db.postFeedback.create({
        data: {
          type: type as FeedbackType,
          postId: params.postId,
          userId: session.user.id,
        },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[POST_FEEDBACK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 