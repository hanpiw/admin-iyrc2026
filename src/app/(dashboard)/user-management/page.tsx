"use client"

import { useState, useEffect } from 'react'
import { createUser, updateUser, deleteUser } from './actions'
import { useLomba } from '@/features/lomba/hooks/useLomba'
import { Plus, X, Users, Shield, ShieldCheck, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export default function UserManagementPage() {
  const { lomba } = useLomba()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  // Form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('pic')
  const [lombaId, setLombaId] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*, lomba(nama)').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const resetForm = () => {
    setEmail(''); setPassword(''); setNama(''); setUsername(''); setRole('pic'); setLombaId('')
    setError(null); setSuccess(null)
  }

  const handleOpenAdd = () => { resetForm(); setEditingUser(null); setIsModalOpen(true) }

  const handleOpenEdit = (user: any) => {
    setEditingUser(user)
    setNama(user.nama || '')
    setUsername(user.username || '')
    setRole(user.role)
    setLombaId(user.lomba_id || '')
    setError(null); setSuccess(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true); setError(null); setSuccess(null)

    if (editingUser) {
      const fd = new FormData()
      fd.append('userId', editingUser.id)
      fd.append('nama', nama)
      fd.append('username', username)
      fd.append('role', role)
      fd.append('lomba_id', lombaId)
      const res = await updateUser(fd)
      if (res.error) setError(res.error)
      else { setSuccess(res.success!); setIsModalOpen(false); fetchUsers() }
    } else {
      const fd = new FormData()
      fd.append('email', email)
      fd.append('password', password)
      fd.append('nama', nama)
      fd.append('username', username)
      fd.append('role', role)
      fd.append('lomba_id', lombaId)
      const res = await createUser(fd)
      if (res.error) setError(res.error)
      else { setSuccess(res.success!); setIsModalOpen(false); fetchUsers() }
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (userId: string, userName: string) => {
    const res = await deleteUser(userId)
    if (res.error) alert(res.error)
    else fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground mt-1">Tambah dan kelola akses Admin dan PIC.</p>
        </div>
        <button onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data pengguna...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Belum ada pengguna terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama</th>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Kategori Assigned</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.nama}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.username || '-'}</td>
                    <td className="px-6 py-4">
                      {u.role === 'super_admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          <ShieldCheck className="h-3 w-3" /> Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Shield className="h-3 w-3" /> PIC Lomba
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {u.role === 'super_admin' ? 'Semua Kategori' : (u.lomba?.nama || 'Belum di-assign')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(u)}
                          className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" aria-label="Edit user">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ id: u.id, name: u.nama })}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" aria-label="Hapus user">
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

      {/* Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="user-form" onSubmit={handleSubmit} className="p-4 space-y-4">
                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                      <input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="admin@iyrc.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                      <input id="password" required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Minimal 6 karakter" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="nama">Nama Lengkap</label>
                  <input id="nama" required type="text" value={nama} onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Misal: Budi Santoso" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="username">Username <span className="text-muted-foreground font-normal">(opsional)</span></label>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Misal: budi_santoso" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="role">Role</label>
                  <select id="role" required value={role} onChange={(e) => { setRole(e.target.value); if (e.target.value === 'super_admin') setLombaId('') }}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="pic">PIC Lomba</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                {role === 'pic' && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="lomba">Assign Kategori Lomba</label>
                    <select id="lomba" required={role === 'pic'} value={lombaId} onChange={(e) => setLombaId(e.target.value)}
                      className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="" disabled>-- Pilih Kategori --</option>
                      {lomba.map(l => (<option key={l.id} value={l.id}>{l.nama}</option>))}
                    </select>
                  </div>
                )}
                {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md">{error}</div>}
              </form>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-md transition-colors text-sm font-medium">
                Batal
              </button>
              <button type="submit" form="user-form" disabled={isSubmitting}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium disabled:opacity-50">
                {isSubmitting ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Simpan User')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDelete(deleteConfirm.id, deleteConfirm.name)
          }
        }}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${deleteConfirm?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  )
}
