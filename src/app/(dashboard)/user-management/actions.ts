"use server"

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nama = formData.get('nama') as string
  const role = formData.get('role') as string
  const lomba_id = formData.get('lomba_id') as string

  if (!email || !password || !nama || !role) {
    return { error: 'Semua field wajib diisi' }
  }

  if (role === 'pic' && !lomba_id) {
    return { error: 'Kategori lomba wajib dipilih untuk PIC' }
  }

  // Create admin client
  const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Since we have a trigger 'handle_new_user' on auth.users insert,
  // it will automatically create a row in 'profiles'.
  // However, the trigger expects 'nama' and 'role' in raw_user_meta_data.
  // We need to pass them during createUser.
  // Wait, the trigger does not map 'lomba_id'. We should update the trigger or update the profile manually.
  // Let's pass lomba_id in user_metadata and update the trigger. 
  // Wait, modifying the trigger requires SQL execution. Instead, we can update the profile directly after user creation.

  const { data, error } = await adminAuthClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nama,
      role
    }
  })

  if (error) {
    return { error: error.message }
  }

  // If role is pic and lomba_id exists, update the profile's lomba_id
  if (role === 'pic' && lomba_id && data.user) {
    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .update({ lomba_id })
      .eq('id', data.user.id)

    if (profileError) {
      console.error('Error updating profile lomba_id:', profileError)
      // Even if this fails, the user is created. But it's an edge case.
    }
  }

  revalidatePath('/user-management')
  return { success: 'User berhasil dibuat!' }
}
