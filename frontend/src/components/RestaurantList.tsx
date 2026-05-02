import { Restaurant } from '../types'
import RestaurantCard from './RestaurantCard'

interface RestaurantListProps {
  restaurants: Restaurant[]
  loading: boolean
  onRestaurantClick: (restaurantId: string) => void
}

export default function RestaurantList({ restaurants, loading, onRestaurantClick }: RestaurantListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin">
          <div className="text-4xl">🍽️</div>
        </div>
        <p className="ml-4 text-gray-600">Cargando restaurantes...</p>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-2xl mb-2">😞</p>
          <p className="text-gray-600 text-lg">No hay restaurantes que coincidan con tu búsqueda</p>
          <p className="text-gray-500 text-sm mt-2">Intenta cambiar los filtros o la búsqueda</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} encontrado{restaurants.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onClick={() => onRestaurantClick(restaurant.id)}
          />
        ))}
      </div>
    </div>
  )
}
