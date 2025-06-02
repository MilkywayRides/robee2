// File: middleware.ts

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isOnAdmin && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});
