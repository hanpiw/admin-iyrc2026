import { useState, useEffect, useCallback } from 'react'
import { PesertaWithStatus } from '../types'
import { pesertaService } from '../services/peserta.service'
import { createClient } from '@/lib/supabase/client'

export function usePeserta(lombaSlug: string) {
  const [peserta, setPeserta] = useState<PesertaWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeserta = useCallback(async () => {
    try {
      setLoading(true)
      const data = await pesertaService.getPesertaByLombaSlug(lombaSlug)
      setPeserta(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [lombaSlug])

  useEffect(() => {
    fetchPeserta()
    
    // Set up Realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel(`peserta_changes_${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'peserta_lomba'
        },
        (payload) => {
          // Re-fetch data when changes occur to ensure we have the latest joined data
          // Alternatively, we could update local state for better performance
          fetchPeserta()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPeserta])

  const toggleAcc = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setPeserta(prev => prev.map(p => 
      p.peserta_lomba_id === id ? { ...p, status_acc: !currentStatus } : p
    ))
    
    const success = await pesertaService.toggleAccStatus(id, currentStatus)
    if (!success) {
      // Revert on failure
      setPeserta(prev => prev.map(p => 
        p.peserta_lomba_id === id ? { ...p, status_acc: currentStatus } : p
      ))
    }
  }

  const deletePeserta = async (id: string) => {
    // Optimistic update
    const previous = [...peserta]
    setPeserta(prev => prev.filter(p => p.peserta_lomba_id !== id))
    
    const success = await pesertaService.deletePeserta(id)
    if (!success) {
      // Revert on failure
      setPeserta(previous)
    }
  }

  return {
    peserta,
    loading,
    error,
    toggleAcc,
    deletePeserta,
    refresh: fetchPeserta
  }
}
