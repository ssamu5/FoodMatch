import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value) // Buscar en tiempo real
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Busca sushi, pizza, carne... 🍜🍕🥩"
          className="w-full px-6 py-4 text-lg border-2 border-red-600 rounded-lg focus:outline-none focus:border-black transition"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-4 text-gray-400 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>
      {query && (
        <p className="text-sm text-gray-500 mt-2">
          Buscando: <strong>{query}</strong>
        </p>
      )}
    </div>
  )
}
