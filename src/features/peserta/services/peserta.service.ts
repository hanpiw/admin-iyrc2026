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

  async importFromExcel(rows: { nama: string; kelas: string; sekolah: string; kategori_lomba: string; level?: string }[]): Promise<{ inserted: number; updated: number; skipped: number; errors: string[] }> {
    const supabase = createClient()
    const result = { inserted: 0, updated: 0, skipped: 0, errors: [] as string[] }

    // 1. Get all lomba to map names to IDs
    const { data: allLomba } = await supabase.from('lomba').select('id, nama')
    if (!allLomba) { result.errors.push('Gagal memuat data lomba'); return result }
    const lombaMap = new Map(allLomba.map(l => [l.nama.toLowerCase(), l.id]))

    // 2. Pre-process rows: Capitalize and filter
    const processedRows = rows.map(row => ({
      nama: capitalizeEachWord(row.nama.trim()),
      kelas: row.kelas.toString().trim(),
      sekolah: row.sekolah.toString().trim(),
      kategori: row.kategori_lomba.trim(),
      level: row.level?.toString().trim() || null
    })).filter(row => row.nama && row.kategori)

    if (processedRows.length === 0) return result

    // 3. Batch fetch existing peserta by name
    const uniqueNames = [...new Set(processedRows.map(r => r.nama))]
    const { data: existingPesertaList } = await supabase
      .from('peserta')
      .select('id, nama, kelas, sekolah')
      .in('nama', uniqueNames)
    
    const existingPesertaMap = new Map(existingPesertaList?.map(p => [p.nama.toLowerCase(), p]) || [])

    // 4. Batch fetch existing links for these peserta
    const existingIds = existingPesertaList?.map(p => p.id) || []
    let existingLinks: any[] = []
    if (existingIds.length > 0) {
      const { data: links } = await supabase
        .from('peserta_lomba')
        .select('peserta_id, lomba_id')
        .in('peserta_id', existingIds)
      existingLinks = links || []
    }
    const linkSet = new Set(existingLinks.map(l => `${l.peserta_id}_${l.lomba_id}`))

    // 5. Prepare batch operations
    const pesertaToUpsert: any[] = []
    const linksToInsert: any[] = []

    for (const row of processedRows) {
      const lombaId = lombaMap.get(row.kategori.toLowerCase())
      if (!lombaId) {
        result.errors.push(`Kategori "${row.kategori}" tidak ditemukan untuk: ${row.nama}`)
        result.skipped++
        continue
      }

      const existing = existingPesertaMap.get(row.nama.toLowerCase())
      let pesertaId = existing?.id

      if (existing) {
        // Prepare update for existing peserta
        pesertaToUpsert.push({ id: pesertaId, nama: row.nama, kelas: row.kelas, sekolah: row.sekolah })
        
        // Check if link exists
        if (linkSet.has(`${pesertaId}_${lombaId}`)) {
          result.updated++
        } else {
          // Check max 3 lomba (approximate locally for speed, then verify if needed)
          const currentLinkCount = existingLinks.filter(l => l.peserta_id === pesertaId).length
          if (currentLinkCount >= 3) {
            result.errors.push(`${row.nama} sudah terdaftar di 3 lomba. Dilewati untuk ${row.kategori}.`)
            result.skipped++
            continue
          }
          linksToInsert.push({ peserta_id: pesertaId, lomba_id: lombaId, level: row.level, status_acc: false })
          result.inserted++
        }
      } else {
        // Prepare insert for new peserta
        const newId = crypto.randomUUID()
        pesertaToUpsert.push({ id: newId, nama: row.nama, kelas: row.kelas, sekolah: row.sekolah })
        linksToInsert.push({ peserta_id: newId, lomba_id: lombaId, level: row.level, status_acc: false })
        result.inserted++
      }
    }

    // 6. Execute batch operations
    if (pesertaToUpsert.length > 0) {
      const { error: pErr } = await supabase.from('peserta').upsert(pesertaToUpsert, { onConflict: 'id' })
      if (pErr) result.errors.push(`Error batch upsert peserta: ${pErr.message}`)
    }

    if (linksToInsert.length > 0) {
      // Chunk links insertion to avoid large payload errors
      const chunkSize = 50
      for (let i = 0; i < linksToInsert.length; i += chunkSize) {
        const chunk = linksToInsert.slice(i, i + chunkSize)
        const { error: lErr } = await supabase.from('peserta_lomba').insert(chunk)
        if (lErr) result.errors.push(`Error batch insert links: ${lErr.message}`)
      }
    }

    await logAction('IMPORT_EXCEL', { inserted: result.inserted, updated: result.updated, skipped: result.skipped })
    return result
  }
}
