"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PenSquare, Settings, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignInButton } from "@/components/auth/sign-in-button";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Posts", href: "/posts", icon: BookOpen },
  { name: "Write", href: "/write", icon: PenSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

// List of protected routes where navigation should not be shown
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/client",
  "/server",
  "/settings",
  "/profile",
];

export function PostNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

  // Don't render navigation in protected routes
  if (isProtectedRoute) {
    return null;
  }

  const NavContent = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}

      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User avatar"}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
          <SignInButton mode="modal">
            <Button size="sm">
              Sign up
            </Button>
          </SignInButton>
        </div>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">R00Bee.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavContent />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary py-2",
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <div className="border-t pt-4">
                    {session ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          {session.user?.image ? (
                            <img
                              src={session.user.image}
                              alt={session.user.name || "User avatar"}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{session.user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Settings
                        </Link>
                        <Link
                          href="/api/auth/signout"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Log out
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <SignInButton mode="modal">
                          <Button variant="ghost" className="w-full justify-start">
                            Sign in
                          </Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                          <Button className="w-full justify-start">
                            Sign up
                          </Button>
                        </SignInButton>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 