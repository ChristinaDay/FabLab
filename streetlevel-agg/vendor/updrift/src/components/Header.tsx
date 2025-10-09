"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuthSession } from "@/hooks/useAuthSession";
import ThemeToggle from "@/components/ThemeToggle";
import { UserIcon, MagnifyingGlassIcon, BookmarkIcon, ChevronDownIcon, ChartBarIcon, DocumentTextIcon, CogIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Header() {
  const { data: session, status } = useAuthSession();
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary" aria-label="Go to home page">
              UpDrift
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/search"
                className={`flex items-center space-x-1 px-1.5 border-b-2 transition-colors duration-200 ${
                  pathname.startsWith("/search")
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-primary"
                }`}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Search Jobs</span>
              </Link>
              {session && (
                <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1 px-1.5 border-b-2 transition-colors duration-200 ${
                    pathname === "/dashboard"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-primary"
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/saved-jobs"
                  className={`flex items-center space-x-1 px-1.5 border-b-2 transition-colors duration-200 ${
                    pathname.startsWith("/saved-jobs")
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-primary"
                  }`}
                >
                  <BookmarkIcon className="h-4 w-4" />
                  <span>My Jobs</span>
                </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Bars3Icon className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent variant="side-drawer">
                  <DialogTitle asChild>
                    <VisuallyHidden>Mobile Navigation Menu</VisuallyHidden>
                  </DialogTitle>
                  <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                    <Link href="/" className="text-2xl font-bold text-primary" aria-label="Go to home page">
                      UpDrift
                    </Link>
                  </div>
                  <nav className="flex flex-col gap-2 px-4 py-6">
                    <Link
                      href="/search"
                      className={`flex items-center space-x-2 px-2 py-2 rounded-md ${pathname.startsWith("/search") ? "text-primary bg-accent" : "text-foreground hover:bg-accent/50"}`}
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      <span>Search Jobs</span>
                    </Link>
                    {session && (
                      <>
                        <Link
                          href="/dashboard"
                          className={`flex items-center space-x-2 px-2 py-2 rounded-md ${pathname === "/dashboard" ? "text-primary bg-accent" : "text-foreground hover:bg-accent/50"}`}
                        >
                          <ChartBarIcon className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/saved-jobs"
                          className={`flex items-center space-x-2 px-2 py-2 rounded-md ${pathname.startsWith("/saved-jobs") ? "text-primary bg-accent" : "text-foreground hover:bg-accent/50"}`}
                        >
                          <BookmarkIcon className="h-5 w-5" />
                          <span>My Jobs</span>
                        </Link>
                      </>
                    )}
                  </nav>
                  <div className="flex flex-col gap-2 px-4 pb-6 mt-auto">
                    {status === "loading" ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    ) : session ? (
                      <>
                        <Link href="/profile" className="flex items-center gap-2 px-2 py-2 rounded-md text-foreground hover:bg-accent/50">
                          <UserIcon className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                        <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/signin">
                          <Button variant="outline" className="w-full mb-2">Sign In</Button>
                        </Link>
                        <Link href="/auth/signup">
                          <Button className="w-full">Get Started</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Desktop session actions */}
            {status === "loading" ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      {session.user.image ? (
                        <AvatarImage src={session.user.image} alt={session.user.name || session.user.email || "User"} />
                      ) : (
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {session.user.name || session.user.email}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/apihub">API Hub</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/signin" className="hidden md:inline-block">
                  <button className="px-4 py-2 rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium mr-2">Sign In</button>
                </Link>
                <Link href="/auth/signup" className="hidden md:inline-block">
                  <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold">Get Started</button>
                </Link>
              </>
            )}
            {/* Theme toggle - positioned at the far right */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
} 