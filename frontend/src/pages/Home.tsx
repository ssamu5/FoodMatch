export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-4">
        <h1 className="text-3xl font-bold">🍽️ FoodMatch</h1>
        <p className="text-gray-300">Descubre y pide comida de los mejores restaurantes</p>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="bg-red-600 text-white p-8 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">¡Bienvenido a FoodMatch!</h2>
          <p className="mb-4">Sprint 0 está completado. El backend y frontend están funcionando.</p>
          <div className="space-y-2">
            <p>✅ Base de datos configurada</p>
            <p>✅ API backend corriendo en http://localhost:5000</p>
            <p>✅ Frontend corriendo en http://localhost:5173</p>
            <p>✅ Estructuras listas para Sprint 1</p>
          </div>
        </div>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-black">Próximos pasos:</h3>
          <ul className="space-y-3">
            <li className="p-4 border-l-4 border-red-600">
              <strong>Sprint 1:</strong> Crear búsqueda de restaurantes y login de usuario
            </li>
            <li className="p-4 border-l-4 border-red-600">
              <strong>Sprint 2:</strong> Integrar chatbot IA para recomendaciones
            </li>
            <li className="p-4 border-l-4 border-red-600">
              <strong>Sprint 3:</strong> Sistema de pedidos y pagos con Stripe
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
