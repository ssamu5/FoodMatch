import { useState } from 'react'

interface Filters {
  cuisine: string
  priceRange: string
  format: string
}

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<Filters>({
    cuisine: 'Todos',
    priceRange: 'Todos',
    format: 'Todos'
  })

  const cuisines = ['Todos', 'Sushi', 'Pizza', 'Carne', 'Asiática', 'Mediterránea', 'Italiana', 'Mexicana']
  const priceRanges = ['Todos', '€', '€€', '€€€']
  const formats = ['Todos', 'À la carte', 'Buffet', 'Menú del día']

  const handleCuisineChange = (cuisine: string) => {
    const newFilters = { ...filters, cuisine }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceChange = (priceRange: string) => {
    const newFilters = { ...filters, priceRange }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleFormatChange = (format: string) => {
    const newFilters = { ...filters, format }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const cleared = { cuisine: 'Todos', priceRange: 'Todos', format: 'Todos' }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-black">🔍 Filtros</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-red-600 hover:text-red-800 font-semibold"
        >
          Limpiar
        </button>
      </div>

      {/* Tipo de Comida */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-black mb-2">Tipo de Comida</label>
        <div className="grid grid-cols-2 gap-2">
          {cuisines.map((cuisine) => (
            <label key={cuisine} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.cuisine === cuisine}
                onChange={() => handleCuisineChange(cuisine)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de Precio */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-black mb-2">Rango de Precio</label>
        <div className="flex gap-2">
          {priceRanges.map((price) => (
            <button
              key={price}
              onClick={() => handlePriceChange(price)}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                filters.priceRange === price
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-black border border-gray-300 hover:border-red-600'
              }`}
            >
              {price}
            </button>
          ))}
        </div>
      </div>

      {/* Formato */}
      <div>
        <label className="block text-sm font-semibold text-black mb-2">Formato</label>
        <div className="flex flex-col gap-2">
          {formats.map((format) => (
            <label key={format} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={filters.format === format}
                onChange={() => handleFormatChange(format)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{format}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
