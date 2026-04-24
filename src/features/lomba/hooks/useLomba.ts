import { useState, useEffect, useCallback } from 'react'
import { Lomba } from '../types'
import { lombaService } from '../services/lomba.service'
import { createClient } from '@/lib/supabase/client'

export function useLomba() {
  const [lomba, setLomba] = useState<Lomba[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLomba = useCallback(async () => {
    setLoading(true)
    const data = await lombaService.getAllLomba()
    setLomba(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLomba()

    const supabase = createClient()
    const channel = supabase
      .channel(`lomba_changes_${Math.random()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lomba' },
        () => {
          fetchLomba()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLomba])

  return { lomba, loading, fetchLomba }
}
