"use client"

import { useAuditLogs } from '@/features/history/hooks/useAuditLogs'
import { History, Plus, Trash2, Edit } from 'lucide-react'

export default function HistoryPage() {
  const { logs, loading } = useAuditLogs()

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ADD_PESERTA':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'DELETE_PESERTA':
        return <Trash2 className="h-4 w-4 text-red-500" />
      case 'UPDATE_STATUS':
        return <Edit className="h-4 w-4 text-blue-500" />
      default:
        return <History className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionText = (log: any) => {
    const name = log.details?.peserta_name || 'Peserta'
    switch (log.action) {
      case 'ADD_PESERTA':
        return `menambahkan peserta ${name}`
      case 'DELETE_PESERTA':
        return `menghapus peserta ${name}`
      case 'UPDATE_STATUS':
        return `mengubah status peserta ${name} menjadi ${log.details?.new_status}`
      default:
        return `melakukan aksi ${log.action}`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Aktivitas</h1>
        <p className="text-muted-foreground mt-1">
          Pantau semua perubahan data yang dilakukan oleh Admin dan PIC.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
            <History className="h-12 w-12 opacity-20 mb-4" />
            <p>Belum ada riwayat aktivitas.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 sm:px-6 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                <div className="mt-1 p-2 bg-muted rounded-full shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{log.user_email}</span>{' '}
                    <span className="text-muted-foreground">{getActionText(log)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
