// User
export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

// Restaurant
export interface Restaurant {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  address: string
  city: string
  phone: string
  email?: string
  website?: string
  cuisine: string
  format: string
  priceRange: string
  openingTime: string
  closingTime: string
  imageUrl?: string
  createdAt: string
}

// Menu Item
export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
}

// Order
export interface Order {
  id: string
  userId: string
  restaurantId: string
  status: 'pending' | 'confirmed' | 'delivered'
  total: number
  createdAt: string
}
