import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "followers"; // followers or following
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const where = type === "followers"
      ? { followingId: userId }
      : { followerId: userId };

    const [users, total] = await Promise.all([
      db.follow.findMany({
        where,
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              _count: {
                select: {
                  posts: true,
                  followers: true,
                  following: true,
                },
              },
            },
          },
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              _count: {
                select: {
                  posts: true,
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.follow.count({ where }),
    ]);

    const results = users.map(user => type === "followers" ? user.follower : user.following);

    return NextResponse.json({
      users: results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[FOLLOWERS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { followingId } = body;

    if (!followingId) {
      return new NextResponse("Following ID is required", { status: 400 });
    }

    if (followingId === session.user.id) {
      return new NextResponse("Cannot follow yourself", { status: 400 });
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return new NextResponse("Already following this user", { status: 400 });
    }

    const follow = await db.follow.create({
      data: {
        followerId: session.user.id,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            _count: {
              select: {
                posts: true,
                followers: true,
                following: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(follow);
  } catch (error) {
    console.error("[FOLLOW_CREATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return new NextResponse("Following ID is required", { status: 400 });
    }

    await db.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 