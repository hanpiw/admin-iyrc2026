import { useState, useEffect, useCallback } from 'react'
import { AuditLog, auditService } from '../services/audit.service'
import { createClient } from '@/lib/supabase/client'

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const data = await auditService.getAuditLogs()
    setLogs(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()

    const supabase = createClient()
    const channel = supabase
      .channel(`audit_changes_${Math.random()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audit_logs' },
        () => {
          fetchLogs()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLogs])

  return { logs, loading }
}
