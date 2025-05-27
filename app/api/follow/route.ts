import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { followingId, action = 'follow' } = body;

    if (!followingId) {
      return new NextResponse("Following ID is required", { status: 400 });
    }

    if (action === 'follow') {
      // Check if already following
      const existingFollow = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Follow"
        WHERE "followerId" = ${session.user.id}
        AND "followingId" = ${followingId}
      `;

      if (existingFollow.length > 0) {
        return new NextResponse("Already following", { status: 400 });
      }

      // Create follow relationship
      const follow = await prisma.$queryRaw<{ id: string }[]>`
        INSERT INTO "Follow" ("id", "followerId", "followingId", "createdAt")
        VALUES (gen_random_uuid(), ${session.user.id}, ${followingId}, NOW())
        RETURNING id
      `;

      return NextResponse.json({ id: follow[0].id, action: 'follow' });
    } else if (action === 'unfollow') {
      // Delete follow relationship
      await prisma.$queryRaw`
        DELETE FROM "Follow"
        WHERE "followerId" = ${session.user.id}
        AND "followingId" = ${followingId}
      `;

      return NextResponse.json({ action: 'unfollow' });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("[FOLLOW_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 