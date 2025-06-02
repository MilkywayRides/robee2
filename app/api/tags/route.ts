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
    const limit = parseInt(searchParams.get("limit") || "10");

    const tags = await db.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("[TAGS_GET]", error);
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
    const { name } = body;

    if (!name) {
      return new NextResponse("Tag name is required", { status: 400 });
    }

    const existingTag = await db.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    const tag = await db.tag.create({
      data: { name },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("[TAG_CREATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 