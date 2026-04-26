import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { lombaService } from '@/features/lomba/services/lomba.service'
import { Lomba } from '@/features/lomba/types'
import { pesertaService } from '../services/peserta.service'
import { LOMBA_HIERARCHY } from '@/lib/constants'

interface TambahPesertaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedLombaId?: string
}

export function TambahPesertaModal({ isOpen, onClose, onSuccess, preselectedLombaId }: TambahPesertaModalProps) {
  const [lombaOptions, setLombaOptions] = useState<Lomba[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [nama, setNama] = useState('')
  const [kelas, setKelas] = useState('')
  const [sekolah, setSekolah] = useState('')
  const [lombaId, setLombaId] = useState(preselectedLombaId || '')
  const [subKategori, setSubKategori] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    if (isOpen) {
      lombaService.getAllLomba().then(data => {
        setLombaOptions(data)
        if (data.length > 0 && !lombaId && !preselectedLombaId) {
          setLombaId(data[0].id)
        }
      })
    }
  }, [isOpen, preselectedLombaId])

  // Get selected Lomba name
  const selectedLombaName = useMemo(() => {
    return lombaOptions.find(l => l.id === lombaId)?.nama || ''
  }, [lombaId, lombaOptions])

  // Get hierarchy data
  const hierarchy = useMemo(() => {
    if (!selectedLombaName) return null
    return LOMBA_HIERARCHY[selectedLombaName]
  }, [selectedLombaName])

  // Reset sub_kategori and level when lombaId changes
  useEffect(() => {
    if (hierarchy?.subCategories && hierarchy.subCategories.length > 0) {
      setSubKategori(hierarchy.subCategories[0].name)
    } else {
      setSubKategori('')
    }
  }, [hierarchy])

  // Available levels based on subKategori or parent levels
  const availableLevels = useMemo(() => {
    if (hierarchy?.subCategories && subKategori) {
      const sub = hierarchy.subCategories.find(s => s.name === subKategori)
      return sub?.levels || []
    }
    return hierarchy?.levels || []
  }, [hierarchy, subKategori])

  // Reset level when sub_kategori or availableLevels change
  useEffect(() => {
    if (availableLevels.length > 0) {
      setLevel(availableLevels[0])
    } else {
      setLevel('')
    }
  }, [availableLevels])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!lombaId) {
      setError('Kategori Lomba harus dipilih')
      setIsSubmitting(false)
      return
    }

    const success = await pesertaService.addPeserta({ 
      nama, 
      kelas, 
      sekolah, 
      lomba_id: lombaId,
      sub_kategori: subKategori || undefined,
      level: level || undefined
    })
    
    if (success) {
      // Reset form
      setNama('')
      setKelas('')
      setSekolah('')
      onSuccess()
      onClose()
    } else {
      setError('Gagal menambahkan peserta. Silakan coba lagi.')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold">Tambah Peserta Baru</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <form id="add-peserta-form" onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="nama">Nama Lengkap</label>
              <input
                id="nama"
                required
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masukkan nama peserta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="kelas">Kelas</label>
              <input
                id="kelas"
                required
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Misal: 10 IPA 1 / Mahasiswa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="sekolah">Asal Sekolah / Instansi</label>
              <input
                id="sekolah"
                required
                type="text"
                value={sekolah}
                onChange={(e) => setSekolah(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Misal: SMAN 1 Jakarta"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lomba">Kategori Lomba</label>
              {preselectedLombaId ? (
                <div className="w-full px-3 py-2 border border-border bg-muted text-muted-foreground rounded-md font-medium">
                  {selectedLombaName || 'Memuat...'}
                </div>
              ) : (
                <select
                  id="lomba"
                  required
                  value={lombaId}
                  onChange={(e) => setLombaId(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {lombaOptions.map(l => (
                    <option key={l.id} value={l.id}>{l.nama}</option>
                  ))}
                </select>
              )}
            </div>

            {hierarchy?.subCategories && hierarchy.subCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="subKategori">Sub Kategori</label>
                <select
                  id="subKategori"
                  required
                  value={subKategori}
                  onChange={(e) => setSubKategori(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {hierarchy.subCategories.map(sub => (
                    <option key={sub.name} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {availableLevels.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="level">Level</label>
                <select
                  id="level"
                  required
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors text-sm font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-peserta-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
