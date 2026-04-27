"use server"

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nama = formData.get('nama') as string
  const username = formData.get('username') as string
  const role = formData.get('role') as string
  const lomba_id = formData.get('lomba_id') as string

  if (!email || !password || !nama || !role) return { error: 'Semua field wajib diisi' }
  if (role === 'pic' && !lomba_id) return { error: 'Kategori lomba wajib dipilih untuk PIC' }

  const admin = getAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { nama, role }
  })

  if (error) return { error: error.message }

  // Update profile with lomba_id and username
  if (data.user) {
    const updates: any = {}
    if (role === 'pic' && lomba_id) updates.lomba_id = lomba_id
    if (username) updates.username = username
    if (Object.keys(updates).length > 0) {
      await admin.from('profiles').update(updates).eq('id', data.user.id)
    }
  }

  revalidatePath('/user-management')
  return { success: 'User berhasil dibuat!' }
}

export async function updateUser(formData: FormData) {
  const userId = formData.get('userId') as string
  const nama = formData.get('nama') as string
  const username = formData.get('username') as string
  const role = formData.get('role') as string
  const lomba_id = formData.get('lomba_id') as string

  if (!userId || !nama || !role) return { error: 'Data tidak lengkap' }

  const admin = getAdminClient()

  const { error } = await admin.from('profiles').update({
    nama,
    username: username || null,
    role,
    lomba_id: role === 'pic' && lomba_id ? lomba_id : null
  }).eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/user-management')
  return { success: 'User berhasil diperbarui!' }
}

export async function deleteUser(userId: string) {
  if (!userId) return { error: 'User ID diperlukan' }

  const admin = getAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  revalidatePath('/user-management')
  return { success: 'User berhasil dihapus!' }
}
