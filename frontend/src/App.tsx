import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import Home from './pages/Home'
import Ask from './pages/Ask'
import Results from './pages/Results'
import RestaurantDetail from './pages/RestaurantDetail'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import RestaurantPartner from './pages/RestaurantPartner'
import RestaurantSetup from './pages/RestaurantSetup'
import Admin from './pages/Admin'
import Welcome from './pages/Welcome'
import { hasSeenWelcome } from './lib/storage'

// First-run gate: on a fresh device (no account, welcome not seen), send the
// user to /welcome. After they sign in or skip, normal routing resumes.
function FirstRunGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  if (!hasSeenWelcome() && pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/*"
          element={
            <FirstRunGate>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ask" element={<Ask />} />
                <Route path="/results" element={<Results />} />
                <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/restaurants" element={<RestaurantPartner />} />
                <Route path="/restaurants/setup" element={<RestaurantSetup />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </FirstRunGate>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
