import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { followingId } = await req.json();
    if (!followingId) {
      return new NextResponse("Following ID is required", { status: 400 });
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return NextResponse.json({ followed: false });
    }

    // Follow
    await db.follow.create({
      data: {
        followerId: session.user.id,
        followingId,
      },
    });

    return NextResponse.json({ followed: true });
  } catch (error) {
    console.error("[FOLLOW_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 