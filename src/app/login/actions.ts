"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const identifier = (formData.get('identifier') as string).trim()
  const password = formData.get('password') as string

  let email = identifier

  // If identifier doesn't look like an email, lookup username
  if (!identifier.includes('@')) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', identifier)
      .single()

    if (!profile) {
      return redirect('/login?error=Username tidak ditemukan')
    }

    // Get email from auth.users via admin API
    const { data: userData } = await adminClient.auth.admin.getUserById(profile.id)
    if (!userData?.user?.email) {
      return redirect('/login?error=Gagal menemukan email untuk username ini')
    }
    email = userData.user.email
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect('/login?error=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
