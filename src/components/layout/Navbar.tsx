"use client"

import { ThemeToggle } from "@/components/ThemeToggle"
import { Bell, UserCircle } from "lucide-react"

import { logout } from "@/app/login/actions"

export function Navbar() {
  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Realtime Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-muted-foreground">Live Sync</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <ThemeToggle />
        <div className="h-6 w-px bg-border mx-1"></div>
        <div className="flex items-center gap-2">
          <a href="/settings" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="Settings">
            <UserCircle className="h-6 w-6 text-primary" />
          </a>
          <form action={logout}>
            <button 
              type="submit"
              className="text-sm font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
