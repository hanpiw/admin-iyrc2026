import * as XLSX from 'xlsx'
import { PesertaWithStatus } from '../types'

export function exportPesertaToExcel(peserta: PesertaWithStatus[], fileName: string) {
  // Format data for Excel
  const dataToExport = peserta.map((p, index) => ({
    'No': index + 1,
    'Nama Peserta': p.nama,
    'Kelas': p.kelas,
    'Sekolah': p.sekolah,
    'Kategori Lomba': p.lomba_nama || '-',
    'Status ACC': p.status_acc ? 'Terverifikasi' : 'Menunggu',
    'Tanggal Daftar': new Date(p.created_at).toLocaleDateString('id-ID')
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(dataToExport)

  // Auto-size columns
  const columnWidths = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama
    { wch: 15 }, // Kelas
    { wch: 30 }, // Sekolah
    { wch: 20 }, // Lomba
    { wch: 15 }, // Status
    { wch: 15 }, // Tanggal
  ]
  worksheet['!cols'] = columnWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peserta')

  // Generate and download Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
