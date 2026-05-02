import { Restaurant } from '../types'

interface RestaurantCardProps {
  restaurant: Restaurant
  onClick: () => void
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={restaurant.imageUrl || 'https://via.placeholder.com/400x200'}
          alt={restaurant.name}
          className="w-full h-full object-cover hover:scale-105 transition"
        />
        <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
          {restaurant.priceRange}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-black mb-1">{restaurant.name}</h3>

        <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {restaurant.description || 'Sin descripción'}
        </p>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">
              📍 {restaurant.address}
            </p>
            <p className="text-xs text-gray-500">
              🕐 {restaurant.openingTime} - {restaurant.closingTime}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-red-600">
              ⭐ Reseñas
            </p>
            <p className="text-xs text-gray-500">
              {restaurant.format}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            console.log('Clickeado:', restaurant.name, restaurant.id)
            onClick()
          }}
          className="w-full mt-3 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition text-sm cursor-pointer"
        >
          Ver detalles
        </button>
      </div>
    </div>
  )
}
