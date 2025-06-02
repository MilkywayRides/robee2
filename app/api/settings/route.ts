import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await db.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { theme, language, notifications, autoSave } = body;

    const settings = await db.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        theme,
        language,
        notifications,
        autoSave,
      },
      create: {
        userId: session.user.id,
        theme,
        language,
        notifications,
        autoSave,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 