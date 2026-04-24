import { createClient } from '@/lib/supabase/client'
import { Lomba } from '../types'

export const lombaService = {
  async getAllLomba(): Promise<Lomba[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lomba')
      .select('*')
      .order('created_at', { ascending: true })
      
    if (error) {
      console.error('Error fetching lomba:', error)
      return []
    }
    return data || []
  },

  async addLomba(nama: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('lomba')
      .insert({ nama })
      
    if (error) {
      console.error('Error adding lomba:', error)
      return false
    }
    return true
  },

  async updateLomba(id: string, nama: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('lomba')
      .update({ nama })
      .eq('id', id)
      
    if (error) {
      console.error('Error updating lomba:', error)
      return false
    }
    return true
  },

  async deleteLomba(id: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('lomba')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error('Error deleting lomba:', error)
      return false
    }
    return true
  }
}
