import { createClient } from '@/lib/supabase/client'

export type AuditLog = {
  id: string
  user_email: string
  action: string
  details: any
  created_at: string
}

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      
    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
    
    return data || []
  }
}
