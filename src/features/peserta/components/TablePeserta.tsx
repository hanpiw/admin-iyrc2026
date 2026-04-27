"use client"

import { useState, useMemo } from 'react'
import { PesertaWithStatus } from '../types'
import { CheckCircle2, Circle, Trash2, Pencil, ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

// Capitalize Each Word helper
export function capitalizeEachWord(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

type SortField = 'nama' | 'kelas' | 'sekolah' | 'sub_level' | 'status_acc'
type SortDirection = 'asc' | 'desc'

interface TablePesertaProps {
  peserta: PesertaWithStatus[]
  loading: boolean
  onToggleAcc: (id: string, currentStatus: boolean, pesertaName?: string) => void
  onDelete: (id: string, pesertaName?: string) => void
  onEdit?: (peserta: PesertaWithStatus) => void
  searchQuery: string
  showLombaColumn?: boolean
}

export function TablePeserta({ peserta, loading, onToggleAcc, onDelete, onEdit, searchQuery, showLombaColumn = false }: TablePesertaProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else { setSortField(null); setSortDirection('asc') }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  // Filter
  const filteredPeserta = useMemo(() => {
    return peserta.filter(p =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sekolah.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [peserta, searchQuery])

  // Sort
  const sortedPeserta = useMemo(() => {
    if (!sortField) return filteredPeserta
    const sorted = [...filteredPeserta].sort((a, b) => {
      let valA = ''
      let valB = ''
      switch (sortField) {
        case 'nama': valA = a.nama; valB = b.nama; break
        case 'kelas': valA = a.kelas; valB = b.kelas; break
        case 'sekolah': valA = a.sekolah; valB = b.sekolah; break
        case 'sub_level':
          valA = `${a.sub_kategori || ''} ${a.level || ''}`
          valB = `${b.sub_kategori || ''} ${b.level || ''}`
          break
        case 'status_acc':
          valA = a.status_acc ? '1' : '0'
          valB = b.status_acc ? '1' : '0'
          break
      }
      return valA.localeCompare(valB, 'id')
    })
    return sortDirection === 'desc' ? sorted.reverse() : sorted
  }, [filteredPeserta, sortField, sortDirection])

  // Pagination
  const totalItems = sortedPeserta.length
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize)

  useMemo(() => { setCurrentPage(1) }, [searchQuery, pageSize])

  const currentItems = useMemo(() => {
    if (pageSize === 0) return sortedPeserta
    const start = (currentPage - 1) * pageSize
    return sortedPeserta.slice(start, start + pageSize)
  }, [sortedPeserta, currentPage, pageSize])

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (currentPage >= totalPages - 2) {
      pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2)
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
      {/* Controls */}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">
                <button onClick={() => handleSort('nama')} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  Nama Peserta <SortIcon field="nama" />
                </button>
              </th>
              <th className="px-6 py-4 font-medium">
                <button onClick={() => handleSort('kelas')} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  Kelas <SortIcon field="kelas" />
                </button>
              </th>
              <th className="px-6 py-4 font-medium">
                <button onClick={() => handleSort('sekolah')} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  Sekolah <SortIcon field="sekolah" />
                </button>
              </th>
              {showLombaColumn && <th className="px-6 py-4 font-medium">Lomba</th>}
              <th className="px-6 py-4 font-medium">
                <button onClick={() => handleSort('sub_level')} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  Sub Kategori & Level <SortIcon field="sub_level" />
                </button>
              </th>
              <th className="px-6 py-4 font-medium text-center">
                <button onClick={() => handleSort('status_acc')} className="flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors">
                  Status ACC <SortIcon field="status_acc" />
                </button>
              </th>
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
                  <td className="px-6 py-4 font-medium">{capitalizeEachWord(p.nama)}</td>
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
                          <><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-medium">Terverifikasi</span></>
                        ) : (
                          <><Circle className="h-4 w-4" /><span className="text-xs font-medium">Menunggu</span></>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(p)}
                          className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                          aria-label="Edit peserta"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus peserta ${capitalizeEachWord(p.nama)}?`)) {
                            onDelete(p.peserta_lomba_id, p.nama)
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        aria-label="Hapus peserta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map(n => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-9 h-9 flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  currentPage === n
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >{n}</button>
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
