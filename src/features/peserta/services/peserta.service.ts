import { createClient } from '@/lib/supabase/client'
import { Peserta, Lomba, PesertaLomba, PesertaWithStatus } from '../types'

// Capitalize Each Word
function capitalizeEachWord(str: string): string {
  return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Helper to log actions
async function logAction(action: string, details: any) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user?.email) return
  await supabase.from('audit_logs').insert({ user_email: userData.user.email, action, details })
}

export const pesertaService = {
  async getPesertaByLombaSlug(lombaSlug: string): Promise<PesertaWithStatus[]> {
    const supabase = createClient()
    let query = supabase
      .from('peserta_lomba')
      .select(`
        id,
        status_acc,
        sub_kategori,
        level,
        lomba:lomba_id (nama),
        peserta:peserta_id (
          id, nama, kelas, sekolah, created_at
        )
      `)

    if (lombaSlug !== 'master-data') {
      const lombaName = lombaSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      const { data: lombaData, error: lombaError } = await supabase
        .from('lomba').select('id').ilike('nama', lombaName).single()
      if (!lombaError && lombaData) {
        query = query.eq('lomba_id', lombaData.id)
      } else {
        return []
      }
    }

    query = query.order('created_at', { ascending: false })
    const { data, error } = await query
    if (error) { console.error('Error fetching peserta:', error); return [] }

    return (data as any[]).map(item => ({
      ...item.peserta,
      lomba_nama: item.lomba?.nama,
      status_acc: item.status_acc,
      peserta_lomba_id: item.id,
      sub_kategori: item.sub_kategori,
      level: item.level
    }))
  },

  async toggleAccStatus(pesertaLombaId: string, currentStatus: boolean, pesertaName?: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from('peserta_lomba').update({ status_acc: !currentStatus }).eq('id', pesertaLombaId)
    if (error) { console.error('Error updating status:', error); return false }
    await logAction('UPDATE_STATUS', { peserta_lomba_id: pesertaLombaId, peserta_name: pesertaName || 'Unknown', new_status: !currentStatus ? 'Verified' : 'Pending' })
    return true
  },

  async deletePeserta(pesertaLombaId: string, pesertaName?: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from('peserta_lomba').delete().eq('id', pesertaLombaId)
    if (error) { console.error('Error deleting peserta:', error); return false }
    await logAction('DELETE_PESERTA', { peserta_lomba_id: pesertaLombaId, peserta_name: pesertaName || 'Unknown' })
    return true
  },

  async addPeserta(data: { nama: string; kelas: string; sekolah: string; lomba_id: string; sub_kategori?: string; level?: string }): Promise<boolean> {
    const supabase = createClient()
    const newPesertaId = crypto.randomUUID()
    const nama = capitalizeEachWord(data.nama)

    const { error: pesertaError } = await supabase.from('peserta').insert({ id: newPesertaId, nama, kelas: data.kelas, sekolah: data.sekolah })
    if (pesertaError) { console.error('Error adding peserta:', pesertaError); return false }

    const { error: linkError } = await supabase.from('peserta_lomba').insert({
      peserta_id: newPesertaId, lomba_id: data.lomba_id,
      sub_kategori: data.sub_kategori || null, level: data.level || null, status_acc: false
    })
    if (linkError) { console.error('Error linking peserta to lomba:', linkError); return false }

    await logAction('ADD_PESERTA', { peserta_id: newPesertaId, peserta_name: nama, lomba_id: data.lomba_id, sub_kategori: data.sub_kategori, level: data.level })
    return true
  },

  async updatePeserta(pesertaId: string, pesertaLombaId: string, data: { nama: string; kelas: string; sekolah: string; sub_kategori?: string; level?: string }): Promise<boolean> {
    const supabase = createClient()
    const nama = capitalizeEachWord(data.nama)

    const { error: pesertaError } = await supabase.from('peserta').update({ nama, kelas: data.kelas, sekolah: data.sekolah }).eq('id', pesertaId)
    if (pesertaError) { console.error('Error updating peserta:', pesertaError); return false }

    const { error: linkError } = await supabase.from('peserta_lomba').update({
      sub_kategori: data.sub_kategori || null, level: data.level || null
    }).eq('id', pesertaLombaId)
    if (linkError) { console.error('Error updating peserta_lomba:', linkError); return false }

    await logAction('EDIT_PESERTA', { peserta_id: pesertaId, peserta_name: nama, sub_kategori: data.sub_kategori, level: data.level })
    return true
  },

  async importFromExcel(rows: { nama: string; kelas: string; sekolah: string; kategori_lomba: string }[]): Promise<{ inserted: number; updated: number; skipped: number; errors: string[] }> {
    const supabase = createClient()
    const result = { inserted: 0, updated: 0, skipped: 0, errors: [] as string[] }

    // Get all lomba
    const { data: allLomba } = await supabase.from('lomba').select('id, nama')
    if (!allLomba) { result.errors.push('Gagal memuat data lomba'); return result }
    const lombaMap = new Map(allLomba.map(l => [l.nama.toLowerCase(), l.id]))

    for (const row of rows) {
      const nama = capitalizeEachWord(row.nama.trim())
      const kelas = row.kelas.trim()
      const sekolah = row.sekolah.trim()
      const kategori = row.kategori_lomba.trim()

      if (!nama || !kelas || !sekolah || !kategori) {
        result.errors.push(`Data tidak lengkap: ${nama || '(kosong)'}`)
        result.skipped++
        continue
      }

      // Find lomba_id
      const lombaId = lombaMap.get(kategori.toLowerCase())
      if (!lombaId) {
        result.errors.push(`Kategori "${kategori}" tidak ditemukan untuk: ${nama}`)
        result.skipped++
        continue
      }

      // Check if peserta already exists (by name)
      const { data: existingPeserta } = await supabase.from('peserta').select('id').ilike('nama', nama).limit(1)
      
      if (existingPeserta && existingPeserta.length > 0) {
        const pesertaId = existingPeserta[0].id

        // Update peserta data
        await supabase.from('peserta').update({ kelas, sekolah }).eq('id', pesertaId)

        // Check if already linked to this lomba
        const { data: existingLink } = await supabase.from('peserta_lomba').select('id').eq('peserta_id', pesertaId).eq('lomba_id', lombaId).limit(1)

        if (existingLink && existingLink.length > 0) {
          // Already linked — update
          result.updated++
        } else {
          // Check max 3 lomba
          const { count } = await supabase.from('peserta_lomba').select('*', { count: 'exact', head: true }).eq('peserta_id', pesertaId)
          if ((count || 0) >= 3) {
            result.errors.push(`${nama} sudah terdaftar di 3 lomba (maks). Tidak bisa ditambah ke ${kategori}.`)
            result.skipped++
            continue
          }
          // Insert new link
          const { error: linkErr } = await supabase.from('peserta_lomba').insert({ peserta_id: pesertaId, lomba_id: lombaId, status_acc: false })
          if (linkErr) { result.errors.push(`Gagal menambah ${nama} ke ${kategori}: ${linkErr.message}`); result.skipped++; continue }
          result.inserted++
        }
      } else {
        // New peserta
        const newId = crypto.randomUUID()
        const { error: pErr } = await supabase.from('peserta').insert({ id: newId, nama, kelas, sekolah })
        if (pErr) { result.errors.push(`Gagal insert ${nama}: ${pErr.message}`); result.skipped++; continue }

        const { error: lErr } = await supabase.from('peserta_lomba').insert({ peserta_id: newId, lomba_id: lombaId, status_acc: false })
        if (lErr) { result.errors.push(`Gagal link ${nama} ke ${kategori}: ${lErr.message}`); result.skipped++; continue }
        result.inserted++
      }
    }

    await logAction('IMPORT_EXCEL', { inserted: result.inserted, updated: result.updated, skipped: result.skipped })
    return result
  }
}
