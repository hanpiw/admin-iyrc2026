export type Peserta = {
  id: string
  nama: string
  kelas: string
  sekolah: string
  created_at: string
}

export type Lomba = {
  id: string
  nama: string
  deskripsi: string | null
  created_at: string
}

export type PesertaLomba = {
  id: string
  peserta_id: string
  lomba_id: string
  status_acc: boolean
  created_at: string
  peserta?: Peserta
  lomba?: Lomba
}

export type PesertaWithStatus = Peserta & {
  status_acc: boolean
  peserta_lomba_id: string
  lomba_nama?: string
}
