import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { lombaService } from '@/features/lomba/services/lomba.service'
import { Lomba } from '@/features/lomba/types'
import { pesertaService } from '../services/peserta.service'

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

  useEffect(() => {
    if (isOpen && !preselectedLombaId) {
      lombaService.getAllLomba().then(data => {
        setLombaOptions(data)
        if (data.length > 0 && !lombaId) {
          setLombaId(data[0].id)
        }
      })
    } else if (isOpen && preselectedLombaId) {
      setLombaId(preselectedLombaId)
    }
  }, [isOpen, preselectedLombaId])

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

    const success = await pesertaService.addPeserta({ nama, kelas, sekolah, lomba_id: lombaId })
    
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
      <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Tambah Peserta Baru</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              <div className="w-full px-3 py-2 border border-border bg-muted text-muted-foreground rounded-md">
                Kategori sudah dipilih
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

          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  )
}
