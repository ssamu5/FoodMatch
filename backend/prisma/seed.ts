import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar BD anterior (opcional)
  await prisma.restaurant.deleteMany({})

  const restaurants = [
    {
      name: 'Sushi Paradise',
      description: 'Auténtico sushi japonés hecho al momento',
      latitude: 39.4699,
      longitude: -0.3763,
      address: 'Calle Paz, 15',
      city: 'Valencia',
      phone: '963 123 456',
      email: 'info@sushiparadise.es',
      website: 'www.sushiparadise.es',
      cuisine: 'Sushi',
      format: 'À la carte',
      priceRange: '€€€',
      openingTime: '12:00',
      closingTime: '23:00',
      closedDays: 'Lunes',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'
    },
    {
      name: 'Pizza Napoli',
      description: 'Pizzas italianas tradicionales con horno de leña',
      latitude: 39.4725,
      longitude: -0.3750,
      address: 'Calle Sanchís Bergamín, 22',
      city: 'Valencia',
      phone: '963 234 567',
      email: 'info@pizzanapoli.es',
      website: 'www.pizzanapoli.es',
      cuisine: 'Pizza',
      format: 'À la carte',
      priceRange: '€€',
      openingTime: '13:00',
      closingTime: '23:30',
      closedDays: 'Martes',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'
    },
    {
      name: 'La Carne y el Fuego',
      description: 'Carnes premium a la brasa',
      latitude: 39.4750,
      longitude: -0.3790,
      address: 'Calle Ruzafa, 45',
      city: 'Valencia',
      phone: '963 345 678',
      email: 'info@lacarneyelfuego.es',
      website: 'www.lacarneyelfuego.es',
      cuisine: 'Carne',
      format: 'À la carte',
      priceRange: '€€€',
      openingTime: '13:00',
      closingTime: '00:00',
      closedDays: 'Domingo',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
      name: 'Taj Mahal',
      description: 'Comida india auténtica con especias del subcontiente',
      latitude: 39.4680,
      longitude: -0.3800,
      address: 'Calle de la Paz, 30',
      city: 'Valencia',
      phone: '963 456 789',
      email: 'info@tajmahal.es',
      website: 'www.tajmahal.es',
      cuisine: 'Asiática',
      format: 'Menú del día',
      priceRange: '€€',
      openingTime: '12:00',
      closingTime: '23:00',
      closedDays: '',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
    },
    {
      name: 'El Olivar Mediterráneo',
      description: 'Cocina mediterránea fresca y saludable',
      latitude: 39.4710,
      longitude: -0.3770,
      address: 'Av. Blasco Ibáñez, 100',
      city: 'Valencia',
      phone: '963 567 890',
      email: 'info@olivar.es',
      website: 'www.olivar.es',
      cuisine: 'Mediterránea',
      format: 'À la carte',
      priceRange: '€€',
      openingTime: '13:00',
      closingTime: '23:00',
      closedDays: 'Lunes',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'
    },
    {
      name: 'Taquería México Lindo',
      description: 'Auténtica comida mexicana hecha en casa',
      latitude: 39.4695,
      longitude: -0.3820,
      address: 'Calle Sueca, 18',
      city: 'Valencia',
      phone: '963 678 901',
      email: 'info@mexicolindo.es',
      website: 'www.mexicolindo.es',
      cuisine: 'Mexicana',
      format: 'À la carte',
      priceRange: '€',
      openingTime: '12:00',
      closingTime: '23:00',
      closedDays: '',
      imageUrl: 'https://images.unsplash.com/photo-1565299885657-406dbf434b3f?w=400'
    }
  ]

  console.log('🌱 Sembrando restaurantes en la BD...')
  for (const restaurant of restaurants) {
    await prisma.restaurant.create({ data: restaurant })
  }
  console.log('✅ Datos sembrados correctamente')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
