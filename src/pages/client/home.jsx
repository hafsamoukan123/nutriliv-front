import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, LogOut, LogIn, UserPlus, Home as HomeIcon, Store, Plus, Package, Salad } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import ToastContainer, { useToast } from '../../components/Toast'

export default function Home() {
  const { user, logout } = useAuthStore()
  const { toasts, success, error } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data)
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search, categoryId],
    queryFn: () => api.get('/products', {
      params: { search, category_id: categoryId }
    }).then(r => r.data)
  })

  const handleLogout = async () => {
    await api.post('/logout')
    logout()
    navigate('/login')
  }

  const addToCart = async (productId) => {
    if (!user) return navigate('/login')
    try {
      await api.post('/cart', { product_id: productId, quantity: 1 })
      success('Produit ajouté au panier ✓')
    } catch {
      error("Erreur lors de l'ajout")
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <nav className="navbar">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-xl" style={{ background: 'var(--primary)', borderRadius: '12px' }}>🥗</div>
          <span className="font-bold text-xl" style={{ color: 'var(--primary-dark)' }}>NutriLiv</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm flex items-center gap-1" style={{ color: '#5EBC8E' }}>
                <Salad size={14} /> {user.name}
              </span>
              <Link to="/orders" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--primary-dark)', textDecoration: 'none' }}>
                <Package size={14} /> Mes commandes
              </Link>
              <Link to="/cart" className="btn btn-primary btn-sm">
                <ShoppingCart size={14} /> Panier
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                <LogOut size={14} /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm flex items-center gap-1" style={{ color: 'var(--primary-dark)', textDecoration: 'none' }}>
                <LogIn size={14} /> Connexion
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={14} /> S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="py-12 px-8 text-center" style={{ background: 'var(--gradient-hero)' }}>
        <h1 className="text-white text-4xl font-bold mb-3">🥗 Mangez sain, livré chez vous</h1>
        <p className="text-white text-lg mb-6" style={{ color: 'var(--primary-light)' }}>Des repas équilibrés préparés avec soin</p>
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#aaa' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un plat sain..."
              className="input pl-9"
            />
          </div>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="input w-auto"
          >
            <option value="">Toutes</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {categories && (
        <div className="flex gap-3 px-8 pt-6 overflow-x-auto">
          <button
            onClick={() => setCategoryId('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
              categoryId === '' ? 'text-white' : 'text-primary border border-primary'
            }`}
            style={{ background: categoryId === '' ? 'var(--primary)' : 'white' }}
          >
            <HomeIcon size={14} /> Tout
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(String(cat.id))}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                categoryId === String(cat.id) ? 'text-white' : 'text-primary border border-primary'
              }`}
              style={{ background: categoryId === String(cat.id) ? 'var(--primary)' : 'white' }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-6">
        {isLoading ? (
          <div className="text-center py-12" style={{ color: '#5EBC8E' }}>Chargement des plats...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productsData?.data?.map(product => (
              <div key={product.id} className="card card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <Link to={`/products/${product.id}`} className="no-underline">
                  <div className="relative">
                    <img
                      src={product.image ? `http://localhost:8000/storage/${product.image}` : 'https://placehold.co/300x200/C8EDD9/1A5C3A?text=🥗'}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <span className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--primary)' }}>
                      {product.category?.icon} {product.category?.name}
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product.id}`} className="no-underline">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--primary-dark)' }}>{product.name}</h3>
                  </Link>
                  <p className="text-gray-400 text-xs mb-3 flex items-center gap-1">
                    <Store size={12} /> {product.vendeur?.shop_name || product.vendeur?.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: 'var(--primary)' }}>{product.price} DH</span>
                    <button onClick={() => addToCart(product.id)} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && productsData?.data?.length === 0 && (
          <div className="text-center py-12" style={{ color: '#5EBC8E' }}>
            <div className="text-5xl mb-4">🥗</div>
            <p className="text-lg">Aucun plat trouvé</p>
          </div>
        )}
      </div>

      <footer className="text-center py-6 mt-8 text-sm" style={{ background: 'var(--primary-dark)', color: 'var(--primary-light)' }}>
        🥗 NutriLiv — Mangez sain, vivez bien © 2026
      </footer>
      
      <ToastContainer toasts={toasts} />
    </div>
  )
}