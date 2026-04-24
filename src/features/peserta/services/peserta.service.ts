import { createClient } from '@/lib/supabase/client'
import { Peserta, Lomba, PesertaLomba, PesertaWithStatus } from '../types'

export const pesertaService = {
  // Get all peserta for a specific lomba (using lomba string name)
  async getPesertaByLombaSlug(lombaSlug: string): Promise<PesertaWithStatus[]> {
    const supabase = createClient()
    
    let query = supabase
      .from('peserta_lomba')
      .select(`
        id,
        status_acc,
        lomba:lomba_id (nama),
        peserta:peserta_id (
          id,
          nama,
          kelas,
          sekolah,
          created_at
        )
      `)

    if (lombaSlug !== 'master-data') {
      const lombaName = lombaSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      
      const { data: lombaData, error: lombaError } = await supabase
        .from('lomba')
        .select('id')
        .ilike('nama', lombaName)
        .single()
        
      if (!lombaError && lombaData) {
        query = query.eq('lomba_id', lombaData.id)
      } else {
        return [] // Lomba not found
      }
    }

    const { data, error } = await query
      
    if (error) {
      console.error('Error fetching peserta:', error)
      return []
    }
    
    // Transform data
    return (data as any[]).map(item => ({
      ...item.peserta,
      lomba_nama: item.lomba?.nama,
      status_acc: item.status_acc,
      peserta_lomba_id: item.id
    }))
  },

  // Toggle ACC status
  async toggleAccStatus(pesertaLombaId: string, currentStatus: boolean): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('peserta_lomba')
      .update({ status_acc: !currentStatus })
      .eq('id', pesertaLombaId)
      
    if (error) {
      console.error('Error updating status:', error)
      return false
    }
    return true
  },
  
  // Delete a peserta from a lomba
  async deletePeserta(pesertaLombaId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('peserta_lomba')
      .delete()
      .eq('id', pesertaLombaId)
      
    if (error) {
      console.error('Error deleting peserta:', error)
      return false
    }
    return true
  },

  // Add new peserta
  async addPeserta(data: { nama: string, kelas: string, sekolah: string, lomba_id: string }): Promise<boolean> {
    const supabase = createClient()
    const newPesertaId = crypto.randomUUID()
    
    // Insert into peserta
    const { error: pesertaError } = await supabase
      .from('peserta')
      .insert({
        id: newPesertaId,
        nama: data.nama,
        kelas: data.kelas,
        sekolah: data.sekolah
      })
      
    if (pesertaError) {
      console.error('Error adding peserta:', pesertaError)
      return false
    }
    
    // Link to lomba
    const { error: linkError } = await supabase
      .from('peserta_lomba')
      .insert({
        peserta_id: newPesertaId,
        lomba_id: data.lomba_id,
        status_acc: false
      })
      
    if (linkError) {
      console.error('Error linking peserta to lomba:', linkError)
      return false
    }
    
    return true
  }
}
