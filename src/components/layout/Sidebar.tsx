"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLomba } from "@/features/lomba/hooks/useLomba"
import { 
  Database, 
  Baby,
  Zap,
  Trophy,
  Code2, 
  Sparkles,
  Palette,
  Gamepad2,
  Plane,
  Recycle,
  Drama,
  Folder,
  Settings2,
  Users
} from "lucide-react"

// Icon mapping for each lomba category
const iconMap: Record<string, any> = {
  "Kinder Mission": Baby,
  "Brickspeed": Zap,
  "2 On 2 Soccer": Trophy,
  "Coding Mission": Code2,
  "AI Animation": Sparkles,
  "Creative": Palette,
  "Game Maker Kit": Gamepad2,
  "Drone Soccer": Plane,
  "Item Recycle": Recycle,
  "Theater Robot": Drama,
}

export function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const pathname = usePathname()
  const { lomba } = useLomba()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (data?.role === 'super_admin') {
          setIsAdmin(true)
        }
      }
    }
    checkRole()
  }, [])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] h-full shadow-lg shadow-black/10 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="block hover:opacity-80 transition-opacity" onClick={() => setIsOpen?.(false)}>
            <h1 className="text-xl font-bold tracking-tight">IYRC YARSI 2026</h1>
            <p className="text-sm opacity-80 mt-1">Admin Dashboard</p>
          </Link>
        </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          Menu Utama
        </div>
        <ul className="space-y-1 px-3 mb-6">
          <li>
            <Link
              href="/master-data"
              onClick={() => setIsOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                pathname === "/master-data" 
                  ? "bg-white/20 font-medium" 
                  : "hover:bg-white/10 opacity-90 hover:opacity-100"
              }`}
            >
              <Database className="h-5 w-5" />
              <span>Master Data</span>
            </Link>
          </li>
        </ul>

        <div className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          Kategori Lomba
        </div>
        <ul className="space-y-1 px-3 mb-6">
          {lomba.map((item) => {
            const href = `/lomba/${item.nama.toLowerCase().replace(/\s+/g, '-')}`
            const isActive = pathname === href
            const Icon = iconMap[item.nama] || Folder
            return (
              <li key={item.id}>
                <Link
                  href={href}
                  onClick={() => setIsOpen?.(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                    isActive 
                      ? "bg-white/20 font-medium" 
                      : "hover:bg-white/10 opacity-90 hover:opacity-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.nama}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {isAdmin && (
          <>
            <div className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 mt-4">
              Pengaturan Admin
            </div>
            <ul className="space-y-1 px-3 mb-6">
              <li>
                <Link
                  href="/lomba-management"
                  onClick={() => setIsOpen?.(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                    pathname === "/lomba-management" 
                      ? "bg-white/20 font-medium" 
                      : "hover:bg-white/10 opacity-90 hover:opacity-100"
                  }`}
                >
                  <Settings2 className="h-5 w-5" />
                  <span>Manajemen Lomba</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/user-management"
                  onClick={() => setIsOpen?.(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                    pathname === "/user-management" 
                      ? "bg-white/20 font-medium" 
                      : "hover:bg-white/10 opacity-90 hover:opacity-100"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Manajemen Pengguna</span>
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>
      
      <div className="p-4 border-t border-white/10 text-xs opacity-60 text-center">
        &copy; 2026 IYRC Event
      </div>
      </aside>
    </>
  )
}

