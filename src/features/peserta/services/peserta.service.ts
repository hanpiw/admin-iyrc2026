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

    // 2. Group rows by participant name
    const participantsData = new Map<string, { 
      nama: string; 
      kelas: string; 
      sekolah: string; 
      lombaEntries: Set<string>; // Stores "lombaId|subKategori"
      level: string | null 
    }>()

    for (const row of rows) {
      const rawNama = row.nama?.toString().trim()
      const rawKategori = row.kategori_lomba?.toString().trim()
      if (!rawNama || !rawKategori) continue

      const nama = capitalizeEachWord(rawNama)
      const nameKey = nama.toLowerCase()
      const entries = rawKategori.split(',').map(c => c.trim()).filter(c => c)
      
      if (!participantsData.has(nameKey)) {
        participantsData.set(nameKey, {
          nama,
          kelas: row.kelas?.toString().trim() || '',
          sekolah: row.sekolah?.toString().trim() || '',
          lombaEntries: new Set(),
          level: row.level?.toString().trim() || null
        })
      }

      const pData = participantsData.get(nameKey)!
      for (const entry of entries) {
        let lombaName = entry
        let subKategori = ''
        
        if (entry.includes(' - ')) {
          const parts = entry.split(' - ')
          lombaName = parts[0].trim()
          subKategori = parts[1].trim()
        }

        const lid = lombaMap.get(lombaName.toLowerCase())
        if (lid) {
          pData.lombaEntries.add(`${lid}|${subKategori}`)
        } else {
          result.errors.push(`Kategori "${lombaName}" tidak ditemukan untuk: ${nama}`)
        }
      }
    }

    if (participantsData.size === 0) return result

    // 3. Batch fetch existing peserta by name
    const uniqueNames = Array.from(participantsData.values()).map(p => p.nama)
    const { data: existingPesertaList } = await supabase
      .from('peserta')
      .select('id, nama')
      .in('nama', uniqueNames)
    
    const existingPesertaMap = new Map(existingPesertaList?.map(p => [p.nama.toLowerCase(), p.id]) || [])

    // 4. Batch fetch existing links for these peserta
    const existingIds = existingPesertaList?.map(p => p.id) || []
    const linkSet = new Set<string>() // Stores "pesertaId_lombaId_subKategori"
    const participantLinkCount = new Map<string, number>() // Stores "pesertaId" -> count

    if (existingIds.length > 0) {
      const { data: links } = await supabase
        .from('peserta_lomba')
        .select('peserta_id, lomba_id, sub_kategori')
        .in('peserta_id', existingIds)
      
      links?.forEach(l => {
        const sub = l.sub_kategori || ''
        linkSet.add(`${l.peserta_id}_${l.lomba_id}_${sub}`)
        participantLinkCount.set(l.peserta_id, (participantLinkCount.get(l.peserta_id) || 0) + 1)
      })
    }

    // 5. Prepare batch operations
    const pesertaToUpsert: any[] = []
    const linksToInsert: any[] = []

    for (const [nameKey, data] of participantsData) {
      let pesertaId = existingPesertaMap.get(nameKey)
      const isNewPeserta = !pesertaId

      if (isNewPeserta) {
        pesertaId = crypto.randomUUID()
      }
      
      // Upsert peserta info
      pesertaToUpsert.push({ id: pesertaId, nama: data.nama, kelas: data.kelas, sekolah: data.sekolah })

      // Process categories
      let currentLinks = participantLinkCount.get(pesertaId!) || 0
      
      for (const entryStr of data.lombaEntries) {
        const [lid, subKategori] = entryStr.split('|')
        const sub = subKategori || ''
        
        if (linkSet.has(`${pesertaId}_${lid}_${sub}`)) {
          result.updated++
        } else {
          if (currentLinks >= 3) {
            const lName = Array.from(lombaMap.entries()).find(([_, id]) => id === lid)?.[0] || 'Unknown'
            const catDisplay = sub ? `${lName} - ${sub}` : lName
            result.errors.push(`${data.nama} sudah mencapai limit 3 lomba. Dilewati untuk: ${catDisplay}`)
            result.skipped++
            continue
          }
          
          linksToInsert.push({ 
            peserta_id: pesertaId, 
            lomba_id: lid, 
            sub_kategori: sub || null,
            level: data.level, 
            status_acc: false 
          })
          linkSet.add(`${pesertaId}_${lid}_${sub}`)
          currentLinks++
          result.inserted++
        }
      }
    }

    // 6. Execute batch operations
    if (pesertaToUpsert.length > 0) {
      const { error: pErr } = await supabase.from('peserta').upsert(pesertaToUpsert, { onConflict: 'id' })
      if (pErr) result.errors.push(`Error batch upsert peserta: ${pErr.message}`)
    }

    if (linksToInsert.length > 0) {
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
