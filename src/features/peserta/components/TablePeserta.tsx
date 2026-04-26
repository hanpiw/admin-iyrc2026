"use client"

import { useState, useMemo } from 'react'
import { PesertaWithStatus } from '../types'
import { CheckCircle2, Circle, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface TablePesertaProps {
  peserta: PesertaWithStatus[]
  loading: boolean
  onToggleAcc: (id: string, currentStatus: boolean, pesertaName?: string) => void
  onDelete: (id: string, pesertaName?: string) => void
  searchQuery: string
  showLombaColumn?: boolean
}

export function TablePeserta({ peserta, loading, onToggleAcc, onDelete, searchQuery, showLombaColumn = false }: TablePesertaProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10) // 0 means 'All'

  // Filter based on search query
  const filteredPeserta = useMemo(() => {
    return peserta.filter(p => 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sekolah.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [peserta, searchQuery])

  // Calculate pagination
  const totalItems = filteredPeserta.length
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize)
  
  // Reset to page 1 if search changes or page size changes
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize])

  // Get current page items
  const currentItems = useMemo(() => {
    if (pageSize === 0) return filteredPeserta
    const startIndex = (currentPage - 1) * pageSize
    return filteredPeserta.slice(startIndex, startIndex + pageSize)
  }, [filteredPeserta, currentPage, pageSize])

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5)
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2)
      }
    }
    return pages
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-card border border-border rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full bg-card border border-border rounded-xl shadow-sm flex flex-col">
      {/* Table Controls (Top) */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{totalItems}</span> peserta
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline-block">Tampilkan:</span>
          <div className="relative inline-block w-24">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full appearance-none bg-background border border-border rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={0}>Semua</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
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
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={showLombaColumn ? 7 : 6} className="px-6 py-8 text-center text-muted-foreground">
                  Tidak ada data peserta ditemukan.
                </td>
              </tr>
            ) : (
              currentItems.map((p) => (
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

      {/* Pagination Controls (Bottom) */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> hingga <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> dari <span className="font-medium text-foreground">{totalItems}</span> hasil
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border bg-background rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {pageNumbers.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 p-2 border border-border bg-background rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <span className="hidden sm:inline-block pl-1">Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
