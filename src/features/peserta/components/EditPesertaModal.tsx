import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { lombaService } from '@/features/lomba/services/lomba.service'
import { Lomba } from '@/features/lomba/types'
import { PesertaWithStatus } from '../types'
import { LOMBA_HIERARCHY } from '@/lib/constants'
import { capitalizeEachWord } from './TablePeserta'

interface EditPesertaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (pesertaId: string, pesertaLombaId: string, data: { nama: string; kelas: string; sekolah: string; sub_kategori?: string; level?: string }) => Promise<boolean>
  peserta: PesertaWithStatus | null
}

export function EditPesertaModal({ isOpen, onClose, onSave, peserta }: EditPesertaModalProps) {
  const [lombaOptions, setLombaOptions] = useState<Lomba[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nama, setNama] = useState('')
  const [kelas, setKelas] = useState('')
  const [sekolah, setSekolah] = useState('')
  const [subKategori, setSubKategori] = useState('')
  const [level, setLevel] = useState('')

  // Pre-fill form when peserta changes
  useEffect(() => {
    if (peserta && isOpen) {
      setNama(peserta.nama)
      setKelas(peserta.kelas)
      setSekolah(peserta.sekolah)
      setSubKategori(peserta.sub_kategori || '')
      setLevel(peserta.level || '')
      setError(null)

      lombaService.getAllLomba().then(data => setLombaOptions(data))
    }
  }, [peserta, isOpen])

  const lombaName = useMemo(() => {
    if (!peserta) return ''
    return peserta.lomba_nama || ''
  }, [peserta])

  const hierarchy = useMemo(() => {
    if (!lombaName) return null
    return LOMBA_HIERARCHY[lombaName]
  }, [lombaName])

  const availableLevels = useMemo(() => {
    if (hierarchy?.subCategories && subKategori) {
      const sub = hierarchy.subCategories.find(s => s.name === subKategori)
      return sub?.levels || []
    }
    return hierarchy?.levels || []
  }, [hierarchy, subKategori])

  if (!isOpen || !peserta) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const success = await onSave(peserta.id, peserta.peserta_lomba_id, {
      nama: capitalizeEachWord(nama),
      kelas,
      sekolah,
      sub_kategori: subKategori || undefined,
      level: level || undefined
    })

    if (success) {
      onClose()
    } else {
      setError('Gagal memperbarui data peserta.')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold">Edit Peserta</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="edit-peserta-form" onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="edit-nama">Nama Lengkap</label>
              <input id="edit-nama" required type="text" value={nama} onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="edit-kelas">Kelas</label>
              <input id="edit-kelas" required type="text" value={kelas} onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="edit-sekolah">Asal Sekolah / Instansi</label>
              <input id="edit-sekolah" required type="text" value={sekolah} onChange={(e) => setSekolah(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            {lombaName && (
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Lomba</label>
                <div className="w-full px-3 py-2 border border-border bg-muted text-muted-foreground rounded-md font-medium">{lombaName}</div>
              </div>
            )}

            {hierarchy?.subCategories && hierarchy.subCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-sub">Sub Kategori</label>
                <select id="edit-sub" value={subKategori} onChange={(e) => { setSubKategori(e.target.value); setLevel('') }}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">-- Pilih --</option>
                  {hierarchy.subCategories.map(sub => (
                    <option key={sub.name} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {availableLevels.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-level">Level</label>
                <select id="edit-level" value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">-- Pilih --</option>
                  {availableLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors text-sm font-medium">
            Batal
          </button>
          <button type="submit" form="edit-peserta-form" disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium disabled:opacity-50">
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
