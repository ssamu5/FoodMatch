import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Ask from './pages/Ask'
import Results from './pages/Results'
import RestaurantDetail from './pages/RestaurantDetail'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import RestaurantPartner from './pages/RestaurantPartner'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/results" element={<Results />} />
        <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/restaurants" element={<RestaurantPartner />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
