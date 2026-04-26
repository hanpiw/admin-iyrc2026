"use client"

import { useState } from 'react'
import { PesertaWithStatus } from '../types'
import { CheckCircle2, Circle, Trash2, Search } from 'lucide-react'

interface TablePesertaProps {
  peserta: PesertaWithStatus[]
  loading: boolean
  onToggleAcc: (id: string, currentStatus: boolean, pesertaName?: string) => void
  onDelete: (id: string, pesertaName?: string) => void
  searchQuery: string
  showLombaColumn?: boolean
}

export function TablePeserta({ peserta, loading, onToggleAcc, onDelete, searchQuery, showLombaColumn = false }: TablePesertaProps) {
  const filteredPeserta = peserta.filter(p => 
    p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sekolah.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-card border border-border rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Nama Peserta</th>
              <th className="px-6 py-4 font-medium">Kelas</th>
              <th className="px-6 py-4 font-medium">Sekolah</th>
              {showLombaColumn && <th className="px-6 py-4 font-medium">Lomba</th>}
              <th className="px-6 py-4 font-medium">Sub Kategori & Level</th>
              <th className="px-6 py-4 font-medium text-center">Status ACC</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPeserta.length === 0 ? (
              <tr>
                <td colSpan={showLombaColumn ? 7 : 6} className="px-6 py-8 text-center text-muted-foreground">
                  Tidak ada data peserta ditemukan.
                </td>
              </tr>
            ) : (
              filteredPeserta.map((p) => (
                <tr key={p.peserta_lomba_id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{p.nama}</td>
                  <td className="px-6 py-4">{p.kelas}</td>
                  <td className="px-6 py-4">{p.sekolah}</td>
                  {showLombaColumn && <td className="px-6 py-4">{p.lomba_nama}</td>}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {p.sub_kategori && <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{p.sub_kategori}</span>}
                      {p.level && <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">{p.level}</span>}
                      {!p.sub_kategori && !p.level && <span className="text-muted-foreground">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onToggleAcc(p.peserta_lomba_id, p.status_acc, p.nama)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                          p.status_acc 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20' 
                            : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {p.status_acc ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Terverifikasi</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4" />
                            <span className="text-xs font-medium">Menunggu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus peserta ${p.nama}?`)) {
                          onDelete(p.peserta_lomba_id, p.nama)
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      aria-label="Hapus peserta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
