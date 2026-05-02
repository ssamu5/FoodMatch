import { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import RestaurantList from '../components/RestaurantList'
import { Restaurant } from '../types'
import client from '../api/client'

interface Filters {
  cuisine: string
  priceRange: string
  format: string
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    cuisine: 'Todos',
    priceRange: 'Todos',
    format: 'Todos'
  })

  // Cargar restaurantes iniciales
  useEffect(() => {
    fetchRestaurants()
  }, [])

  // Buscar/filtrar cuando cambia query o filtros
  useEffect(() => {
    if (searchQuery) {
      searchRestaurants()
    } else {
      filterRestaurants()
    }
  }, [searchQuery, filters])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const response = await client.get('/api/v1/restaurants')
      setRestaurants(response.data.data)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchRestaurants = async () => {
    try {
      setLoading(true)
      const response = await client.get(`/api/v1/restaurants/search?query=${searchQuery}`)
      setRestaurants(response.data.data)
    } catch (error) {
      console.error('Error searching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRestaurants = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.cuisine !== 'Todos') params.append('cuisine', filters.cuisine)
      if (filters.priceRange !== 'Todos') params.append('priceRange', filters.priceRange)
      if (filters.format !== 'Todos') params.append('format', filters.format)

      const response = await client.get(`/api/v1/restaurants/filter?${params}`)
      setRestaurants(response.data.data)
    } catch (error) {
      console.error('Error filtering restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  const handleRestaurantClick = (restaurantId: string) => {
    console.log('Restaurante clickeado:', restaurantId)
    // Próximamente: navegar a página de detalle
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">🍽️ FoodMatch</h1>
          <p className="text-gray-300">Descubre y pide comida de los mejores restaurantes</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Restaurant List */}
          <div className="lg:col-span-3">
            <RestaurantList
              restaurants={restaurants}
              loading={loading}
              onRestaurantClick={handleRestaurantClick}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
