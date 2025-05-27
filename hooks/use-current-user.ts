// File: hooks/use-current-user.ts
"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  if (status === "loading") return undefined;
  return session?.user ?? null;
}