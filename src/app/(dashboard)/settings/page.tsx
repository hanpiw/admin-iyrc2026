"use client"

import { useState, useEffect } from "react"
import { updatePassword } from "./actions"
import { createClient } from "@/lib/supabase/client"
import { UserCircle } from "lucide-react"

export default function SettingsPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? null)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) {
          setUserRole(profile.role)
        }
      }
    }
    loadUser()
  }, [])

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updatePassword(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.success)
        // Optionally reset form here
        ;(document.getElementById("password-form") as HTMLFormElement).reset()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <UserCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{userEmail || 'Loading...'}</h2>
          <p className="text-muted-foreground uppercase tracking-wider text-sm mt-1">
            Role: {userRole || 'Loading...'}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Update Password</h2>
        <form id="password-form" action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm bg-green-500/10 p-3 rounded-md border border-green-500/20">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
