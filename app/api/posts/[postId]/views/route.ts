import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Increment view count
    await db.post.update({
      where: {
        id: params.postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[POST_VIEWS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 