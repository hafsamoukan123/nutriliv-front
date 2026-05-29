import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Salad, ShoppingCart, LogOut, Plus, Edit, Trash2, Save, X, Package, DollarSign, Tag, Archive, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../../components/NotificationBell'
import ToastContainer, { useToast } from '../../components/Toast'

const Sidebar = ({ active }) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = async () => { await api.post('/logout'); logout(); navigate('/login') }
  return (
    <aside style={{ width: '220px', minHeight: '100vh', background: 'var(--primary-dark)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🥗</div>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>NutriLiv</span>
      </div>
      <div style={{ padding: '0 0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Notifications</span>
          <NotificationBell />
        </div>
      </div>
      {[
        { to: '/vendeur', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/vendeur/products', icon: <Salad size={18} />, label: 'Mes plats' },
        { to: '/vendeur/orders', icon: <ShoppingCart size={18} />, label: 'Commandes' },
      ].map(item => (
        <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', textDecoration: 'none', background: active === item.to ? 'rgba(255,255,255,0.15)' : 'transparent', color: active === item.to ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: active === item.to ? '600' : '400', fontSize: '0.9rem' }}>
          {item.icon}{item.label}
        </Link>
      ))}
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', marginTop: 'auto', textAlign: 'left' }}>
        <LogOut size={18} /> Déconnexion
      </button>
    </aside>
  )
}

export default function VendeurProducts() {
  const { toasts, success, error } = useToast()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', category_id: '', description: '' })
  const [image, setImage] = useState(null)

  const { data: productsData } = useQuery({
    queryKey: ['vendeur-products'],
    queryFn: () => api.get('/vendeur/products').then(r => r.data)
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data)
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)
      if (editProduct) { fd.append('_method', 'PUT'); return api.post(`/vendeur/products/${editProduct.id}`, fd) }
      return api.post('/vendeur/products', fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vendeur-products'])
      setShowForm(false)
      setEditProduct(null)
      setForm({ name: '', price: '', stock: '', category_id: '', description: '' })
      setImage(null)
      success(editProduct ? '✅ Produit modifié avec succès' : '✅ Produit ajouté avec succès')
    },
    onError: () => {
      error('❌ Erreur lors de la sauvegarde')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vendeur/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendeur-products'])
      success('✅ Produit supprimé avec succès')
    },
    onError: () => {
      error('❌ Erreur lors de la suppression')
    }
  })

  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, price: p.price, stock: p.stock, category_id: p.category_id, description: p.description || '' }); setShowForm(true) }

  const inputStyle = { width: '100%', border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.7rem 1rem', fontSize: '0.9rem', outline: 'none', background: 'var(--bg)', color: 'var(--primary-dark)' }

  const products = productsData?.data || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active="/vendeur/products" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Salad size={24} /> Mes Plats
          </h1>
          <button onClick={() => { setShowForm(true); setEditProduct(null) }} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Nouveau plat
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editProduct ? <Edit size={18} /> : <Plus size={18} />}
              {editProduct ? 'Modifier le plat' : 'Nouveau plat'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '500', display: 'flex', marginBottom: '6px', alignItems: 'center', gap: '4px' }}><Tag size={12} /> Nom du plat</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Ex: Salade César" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '500', display: 'flex', marginBottom: '6px', alignItems: 'center', gap: '4px' }}><DollarSign size={12} /> Prix (DH)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '500', display: 'flex', marginBottom: '6px', alignItems: 'center', gap: '4px' }}><Archive size={12} /> Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '500', display: 'flex', marginBottom: '6px', alignItems: 'center', gap: '4px' }}><Package size={12} /> Catégorie</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={inputStyle}>
                  <option value="">Choisir...</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '500', display: 'flex', marginBottom: '6px', alignItems: 'center', gap: '4px' }}><Package size={12} /> Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '500', display: 'flex', marginBottom: '6px', alignItems: 'center', gap: '4px' }}><ImageIcon size={12} /> Photo</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ fontSize: '0.875rem', color: 'var(--primary-dark)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 2rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {saveMutation.isPending ? <Package size={16} /> : <Save size={16} />}
                {saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button onClick={() => { setShowForm(false); setEditProduct(null) }} style={{ background: 'var(--bg)', color: 'var(--primary-dark)', border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.75rem 2rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={16} /> Annuler
              </button>
            </div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>Plat</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>Catégorie</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>Prix</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--primary-light)' }}>
                  <td style={{ padding: '1rem', color: 'var(--primary-dark)', fontWeight: '500' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Salad size={14} /> {p.name}</div></td>
                  <td style={{ padding: '1rem', color: '#888' }}>{p.category?.icon} {p.category?.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: '700' }}><div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><DollarSign size={12} /> {p.price} DH</div></td>
                  <td style={{ padding: '1rem', color: p.stock < 5 ? '#E74C3C' : 'var(--primary-dark)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Archive size={12} /> {p.stock}</div></td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: p.is_active ? '#EAFAF1' : '#FDEDEC', color: p.is_active ? '#27AE60' : '#E74C3C', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                      {p.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(p)} style={{ background: '#EBF5FB', color: '#2980B9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit size={12} /> Modifier
                      </button>
                      <button onClick={() => { if (confirm('Supprimer ce produit ?')) deleteMutation.mutate(p.id) }} style={{ background: '#FDEDEC', color: '#E74C3C', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <div style={{ marginBottom: '0.75rem' }}><Salad size={40} strokeWidth={1.5} /></div>
              <p>Aucun plat ajouté</p>
            </div>
          )}
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  )
}