"use client"

import { useState, useMemo, useEffect } from 'react'
import { usePeserta } from '@/features/peserta/hooks/usePeserta'
import { TablePeserta } from '@/features/peserta/components/TablePeserta'
import { StatCard } from '@/features/peserta/components/StatCard'
import { SearchBox } from '@/features/peserta/components/SearchBox'
import { TambahPesertaModal } from '@/features/peserta/components/TambahPesertaModal'
import { EditPesertaModal } from '@/features/peserta/components/EditPesertaModal'
import { ImportExcelModal } from '@/features/peserta/components/ImportExcelModal'
import { PesertaWithStatus } from '@/features/peserta/types'
import { Users, CheckCircle2, Clock, Plus, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MasterDataPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingPeserta, setEditingPeserta] = useState<PesertaWithStatus | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  
  const { peserta, loading, toggleAcc, deletePeserta, updatePeserta, refresh } = usePeserta('master-data')

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (data?.role === 'super_admin') setIsSuperAdmin(true)
      }
    }
    checkRole()
  }, [])

  const stats = useMemo(() => {
    const total = peserta.length
    const verified = peserta.filter(p => p.status_acc).length
    return { total, verified, pending: total - verified }
  }, [peserta])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Data</h1>
          <p className="text-muted-foreground mt-1">Lihat semua peserta dari seluruh kategori lomba.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Cari nama / sekolah..." />
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium whitespace-nowrap">
            <Plus className="h-4 w-4" /> Tambah
          </button>
          {isSuperAdmin && (
            <button onClick={() => setIsImportOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium whitespace-nowrap">
              <Upload className="h-4 w-4" /> Import Excel
            </button>
          )}
          <button
            onClick={() => {
              import('@/features/peserta/utils/export').then(mod => {
                mod.exportPesertaToExcel(peserta, 'Master_Data_Peserta_IYRC_2026')
              })
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
        </div>
      </div>

      <TambahPesertaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => refresh()} />
      <EditPesertaModal isOpen={!!editingPeserta} onClose={() => setEditingPeserta(null)} onSave={updatePeserta} peserta={editingPeserta} />
      <ImportExcelModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={() => refresh()} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Keseluruhan Peserta" value={stats.total} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Total Sudah Verifikasi" value={stats.verified} valueColor="text-green-500" icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} />
        <StatCard title="Total Menunggu" value={stats.pending} valueColor="text-yellow-500" icon={<Clock className="h-4 w-4 text-yellow-500" />} />
      </div>

      <div className="mt-6">
        <TablePeserta
          peserta={peserta} loading={loading} searchQuery={searchQuery}
          onToggleAcc={toggleAcc} onDelete={deletePeserta} onEdit={setEditingPeserta}
          showLombaColumn={true}
        />
      </div>
    </div>
  )
}
