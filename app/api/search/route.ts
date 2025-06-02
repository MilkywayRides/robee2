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
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let results = [];
    let total = 0;

    switch (type) {
      case "posts":
        [results, total] = await Promise.all([
          db.post.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { excerpt: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
              authorId: session.user.id,
            },
            include: {
              tags: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          db.post.count({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { excerpt: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
              authorId: session.user.id,
            },
          }),
        ]);
        break;

      case "tags":
        [results, total] = await Promise.all([
          db.tag.findMany({
            where: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            orderBy: {
              name: "asc",
            },
            skip,
            take: limit,
          }),
          db.tag.count({
            where: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          }),
        ]);
        break;

      default:
        // Search in both posts and tags
        const [posts, tags, postsCount, tagsCount] = await Promise.all([
          db.post.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { excerpt: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
              authorId: session.user.id,
            },
            include: {
              tags: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          db.tag.findMany({
            where: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            orderBy: {
              name: "asc",
            },
            skip,
            take: limit,
          }),
          db.post.count({
            where: {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { excerpt: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
              authorId: session.user.id,
            },
          }),
          db.tag.count({
            where: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          }),
        ]);

        results = [...posts, ...tags];
        total = postsCount + tagsCount;
        break;
    }

    return NextResponse.json({
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[SEARCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 