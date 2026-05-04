import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react'
import { pesertaService } from '../services/peserta.service'
import * as XLSX from 'xlsx'

interface ImportExcelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type ImportRow = { nama: string; kelas: string; sekolah: string; kategori_lomba: string; level: string }

export function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [fileName, setFileName] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<{ inserted: number; updated: number; skipped: number; errors: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<any>(sheet)

      // Map column names (flexible matching)
      const mapped: ImportRow[] = json.map((row: any) => ({
        nama: row['Nama'] || row['nama'] || row['NAMA'] || '',
        kelas: row['Kelas'] || row['kelas'] || row['KELAS'] || '',
        sekolah: row['Sekolah'] || row['sekolah'] || row['SEKOLAH'] || row['Asal Sekolah'] || '',
        kategori_lomba: row['Kategori Lomba'] || row['kategori_lomba'] || row['KATEGORI LOMBA'] || row['Lomba'] || row['lomba'] || '',
        level: row['Level'] || row['level'] || row['LEVEL'] || ''
      })).filter((r: ImportRow) => r.nama)

      setRows(mapped)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    setIsImporting(true)
    const res = await pesertaService.importFromExcel(rows)
    setResult(res)
    setIsImporting(false)
    if (res.inserted > 0 || res.updated > 0) onSuccess()
  }

  const handleClose = () => {
    setRows([])
    setFileName('')
    setResult(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /> Import Excel</h2>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Upload area */}
          {!result && (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">{fileName || 'Klik untuk memilih file Excel'}</p>
                <p className="text-xs text-muted-foreground mt-1">Format: .xlsx atau .xls</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p className="font-medium mb-1">Format kolom yang diharapkan:</p>
                <p><strong>Nama</strong> | <strong>Kelas</strong> | <strong>Sekolah</strong> | <strong>Kategori Lomba</strong></p>
              </div>
            </>
          )}

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div>
              <p className="text-sm font-medium mb-2">Preview Data ({rows.length} baris):</p>
              <div className="overflow-x-auto max-h-60 border border-border rounded-md">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border sticky top-0">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Kelas</th>
                      <th className="px-3 py-2">Sekolah</th>
                      <th className="px-3 py-2">Kategori Lomba</th>
                      <th className="px-3 py-2">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-1.5 font-medium">{r.nama}</td>
                        <td className="px-3 py-1.5">{r.kelas}</td>
                        <td className="px-3 py-1.5">{r.sekolah}</td>
                        <td className="px-3 py-1.5">{r.kategori_lomba}</td>
                        <td className="px-3 py-1.5">{r.level || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 50 && <p className="text-xs text-muted-foreground mt-1">...dan {rows.length - 50} baris lainnya</p>}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Import Selesai!</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">{result.inserted}</div>
                  <div className="text-xs text-muted-foreground">Data Baru</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">{result.updated}</div>
                  <div className="text-xs text-muted-foreground">Diperbarui</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{result.skipped}</div>
                  <div className="text-xs text-muted-foreground">Dilewati</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-500 text-sm font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" /> Catatan Kesalahan:
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((err, i) => <li key={i}>• {err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 shrink-0">
          <button type="button" onClick={handleClose}
            className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors text-sm font-medium">
            {result ? 'Tutup' : 'Batal'}
          </button>
          {rows.length > 0 && !result && (
            <button onClick={handleImport} disabled={isImporting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium disabled:opacity-50">
              {isImporting ? 'Mengimpor...' : `Import ${rows.length} Data`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
