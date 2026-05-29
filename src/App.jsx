import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Client
import Home from './pages/client/Home'
import ProductDetail from './pages/client/ProductDetail'
import Cart from './pages/client/Cart'
import ClientOrders from './pages/client/Orders'
import TrackOrder from './pages/client/TrackOrder'
import Notifications from './pages/shared/Notifications'

// Vendeur
import VendeurDashboard from './pages/vendeur/Dashboard'
import VendeurProducts from './pages/vendeur/Products'
import VendeurOrders from './pages/vendeur/Orders'

// Livreur
import LivreurDashboard from './pages/livreur/Dashboard'

// Admin
import AdminDashboard from './pages/admin/Dashboard'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Client */}
          <Route path="/cart" element={
            <ProtectedRoute role="client"><Cart /></ProtectedRoute>
          }/>
          <Route path="/orders" element={
            <ProtectedRoute role="client"><ClientOrders /></ProtectedRoute>
          }/>
          <Route path="/orders/:id/track" element={
            <ProtectedRoute role="client"><TrackOrder /></ProtectedRoute>
          }/>
         <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          }/>

          {/* Vendeur */}
          <Route path="/vendeur" element={
            <ProtectedRoute role="vendeur"><VendeurDashboard /></ProtectedRoute>
          }/>
          <Route path="/vendeur/products" element={
            <ProtectedRoute role="vendeur"><VendeurProducts /></ProtectedRoute>
          }/>
          <Route path="/vendeur/orders" element={
            <ProtectedRoute role="vendeur"><VendeurOrders /></ProtectedRoute>
          }/>

          {/* Livreur */}
          <Route path="/livreur" element={
            <ProtectedRoute role="livreur"><LivreurDashboard /></ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
         
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}