"use client"

import { useState } from 'react'
import { useLomba } from '@/features/lomba/hooks/useLomba'
import { lombaService } from '@/features/lomba/services/lomba.service'
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'

export default function LombaManagementPage() {
  const { lomba, loading, fetchLomba } = useLomba()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedLomba, setSelectedLomba] = useState<{ id: string, nama: string } | null>(null)
  const [nama, setNama] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setModalMode('add')
    setNama('')
    setSelectedLomba(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (l: { id: string, nama: string }) => {
    setModalMode('edit')
    setSelectedLomba(l)
    setNama(l.nama)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    let success = false
    if (modalMode === 'add') {
      success = await lombaService.addLomba(nama)
    } else if (modalMode === 'edit' && selectedLomba) {
      success = await lombaService.updateLomba(selectedLomba.id, nama)
    }
    
    if (success) {
      setIsModalOpen(false)
      fetchLomba()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsSubmitting(true)
    const success = await lombaService.deleteLomba(deleteId)
    if (success) {
      setDeleteId(null)
      fetchLomba()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Lomba</h1>
          <p className="text-muted-foreground mt-1">
            Kelola kategori lomba IYRC YARSI 2026.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : lomba.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Belum ada kategori lomba.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Kategori Lomba</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lomba.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{l.nama}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(l.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">{modalMode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="nama">Nama Kategori</label>
                <input
                  id="nama"
                  required
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Misal: Line Follower"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold">Hapus Kategori Lomba?</h2>
              <p className="text-muted-foreground">
                Tindakan ini tidak dapat dibatalkan. Menghapus kategori ini juga akan menghapus **semua data peserta** yang terkait dengan lomba ini.
              </p>
            </div>
            <div className="p-4 bg-muted/50 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
