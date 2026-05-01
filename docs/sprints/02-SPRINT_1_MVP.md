# SPRINT 1: MVP - BUSCADOR + FILTROS + LISTADO
**Duración:** 3-4 semanas
**Objetivo:** Funcionalidad principal: usuario busca restaurantes, ve lista, puede filtrar.

---

## 📋 RESUMEN

Lo que el usuario puede hacer:
1. Abrir la app
2. Ver mapa con restaurantes cerca (geolocalización)
3. Buscar por texto (nombre restaurante)
4. Filtrar por:
   - Tipo de comida (sushi, pizza, carne, etc)
   - Zona/ciudad
   - Rango de precio
   - Formato (buffet, à la carte, etc)
5. Ver listado de restaurantes filtrados
6. Ver info básica de cada restaurante

---

## 🎯 FUNCIONALIDADES ESPECÍFICAS

### Frontend

#### Página Principal (Home)
**URL:** `/`

**Componentes:**
- Header con logo FoodMatch
- Buscador prominente (input grande en el centro)
- Mapa interactivo (mostrar restaurantes)
- Listado de restaurantes debajo/al lado
- Filtros (sidebar o collapsible)

**Funcionalidad:**
- Cuando el usuario carga la página, obtener su ubicación (geolocalización)
- Si dice "sí" a location: mostrar restaurantes cercanos (radio 5km)
- Si dice "no": mostrar todos los restaurantes de Valencia
- Cuando escribe en buscador: filtrar EN TIEMPO REAL
- Cuando cambia filtros: actualizar lista EN TIEMPO REAL

#### Componentes a crear:

1. **SearchBar.tsx**
   - Input para buscar por nombre
   - Icono de búsqueda
   - Placeholder: "Busca sushi, pizza, carne..."
   - Al escribir: llama a `/api/v1/restaurants/search?query=...`

2. **FilterPanel.tsx**
   - Checkboxes para tipo de comida: Sushi, Pizza, Carne, Mediterránea, Asiática, Italiana, Mexicana, Otros
   - Dropdown para zona: Centro, Ruzafa, Ensanche, Benimaclet, etc
   - Radio buttons para precio: €, €€, €€€
   - Radio buttons para formato: Buffet, À la carte, Menú del día, Todos
   - Botón "Limpiar filtros"
   - Al cambiar cualquier filtro: llama a `/api/v1/restaurants/filter` con los parámetros

3. **RestaurantCard.tsx**
   - Tarjeta que muestra:
     - Foto del restaurante (imageUrl)
     - Nombre
     - Tipo de comida (cuisine)
     - Rango de precio
     - Distancia (en km)
     - Rating (promedio de reseñas, o "sin reseñas" si no hay)
     - Botón "Ver detalles" que va a `/restaurant/:id`
   - Al hover: ligero efecto visual
   - Click: navega a página de detalle

4. **RestaurantList.tsx**
   - Grid o lista de RestaurantCard
   - Si no hay resultados: mostrar "No hay restaurantes que coincidan"
   - Loading state mientras carga
   - Scroll infinito o paginación (10 por página)

5. **Map.tsx** (opcional en Sprint 1, pero si tiempo: hacerlo)
   - Mapa interactivo (Google Maps o OpenStreetMap)
   - Mostrar pin de cada restaurante
   - Al hacer click en pin: mostrar info rápida
   - Si el usuario tiene ubicación: mostrar su ubicación como icono azul
   - Mostrar radio de búsqueda (5km)

---

### Backend

#### Endpoints a crear:

**1. GET `/api/v1/restaurants`**
- Obtiene TODOS los restaurantes
- Query params:
  - `city` (opcional): "Valencia"
  - `limit` (opcional): 10
  - `offset` (opcional): 0
- Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Sushi Master",
      "cuisine": "Sushi",
      "priceRange": "€€",
      "address": "Calle San Vicente Mártir, 45",
      "latitude": 39.4699,
      "longitude": -0.3763,
      "imageUrl": "...",
      "phone": "+34 963 223344",
      "rating": 4.7,
      "reviewCount": 42
    }
    // ... más restaurantes
  ],
  "count": 120,
  "total": 340
}
```

**2. GET `/api/v1/restaurants/search`**
- Busca por nombre o descripción
- Query params:
  - `query` (requerido): "sushi"
  - `city` (opcional): "Valencia"
- Response: mismo formato que GET /restaurants

**3. GET `/api/v1/restaurants/filter`**
- Filtra por múltiples criterios
- Query params:
  - `cuisine` (opcional, comma-separated): "Sushi,Pizza"
  - `priceRange` (opcional, comma-separated): "€,€€"
  - `format` (opcional, comma-separated): "Buffet"
  - `city` (opcional): "Valencia"
  - `latitude` (opcional): 39.4699
  - `longitude` (opcional): -0.3763
  - `radius` (opcional, en km): 5
  - `sortBy` (opcional): "distance", "rating", "name"
  - `limit`: 10
  - `offset`: 0
- Response: mismo formato

**4. GET `/api/v1/restaurants/:id`**
- Obtiene un restaurante específico (para detalle - Sprint 2)
- Response:
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Sushi Master",
    "cuisine": "Sushi",
    "priceRange": "€€",
    "format": "Buffet",
    "address": "Calle San Vicente Mártir, 45",
    "latitude": 39.4699,
    "longitude": -0.3763,
    "imageUrl": "...",
    "phone": "+34 963 223344",
    "email": "info@sushimaster.es",
    "website": "www.sushimaster.es",
    "openingTime": "12:00",
    "closingTime": "23:00",
    "closedDays": "",
    "rating": 4.7,
    "reviewCount": 42
  }
}
```

---

#### Controladores a crear:

**restaurants.controller.ts**
```typescript
export const getAllRestaurants = async (req, res) => {
  // Query params: city, limit, offset
  // Lógica: obtener de BD, limitar, retornar
}

export const searchRestaurants = async (req, res) => {
  // Query param: query, city
  // Lógica: buscar por nombre que contenga query (case-insensitive)
}

export const filterRestaurants = async (req, res) => {
  // Múltiples query params
  // Lógica: filtrar por todos los criterios
}

export const getRestaurantById = async (req, res) => {
  // Param: id
  // Lógica: obtener uno específico
}
```

**restaurants.routes.ts**
```typescript
import express from 'express';
import { getAllRestaurants, searchRestaurants, filterRestaurants, getRestaurantById } from '../controllers/restaurants.controller';

const router = express.Router();

router.get('/', getAllRestaurants);
router.get('/search', searchRestaurants);
router.get('/filter', filterRestaurants);
router.get('/:id', getRestaurantById);

export default router;
```

---

## 🗄️ BASE DE DATOS - DATOS INICIALES

**backend/prisma/seed.ts:**

Insertar ~30-50 restaurantes de ejemplo en Valencia con datos realistas:
- Sushi Master (Buffet, €€, Sushi, Centro)
- Pizzería Luigi (À la carte, €€, Italiana, Ruzafa)
- La Paella Valenciana (À la carte, €€, Mediterránea, Centro)
- Burger King (À la carte, €, Hamburguesas, Ensanche)
- etc...

Script:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpiar primero
  await prisma.restaurant.deleteMany();

  // Insertar datos
  await prisma.restaurant.createMany({
    data: [
      {
        name: "Sushi Master",
        cuisine: "Sushi",
        format: "Buffet",
        priceRange: "€€",
        address: "Calle San Vicente Mártir, 45",
        city: "Valencia",
        latitude: 39.4699,
        longitude: -0.3763,
        phone: "+34 963 223344",
        email: "info@sushimaster.es",
        website: "www.sushimaster.es",
        openingTime: "12:00",
        closingTime: "23:00",
        closedDays: "",
        // imageUrl: necesitaremos URLs reales o generar
      },
      // ... más restaurantes
    ]
  });

  console.log("Seed completado");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
```

---

## 🎨 UI/UX ESPECÍFICA

### Home Page Layout:
```
┌─────────────────────────────────────┐
│  [Logo] FoodMatch        [Menu]     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔍 Busca sushi, pizza...    │  │
│  └───────────────────────────────┘  │
│                                     │
├──────┬──────────────────────────────┤
│      │                              │
│ FIL- │     [Mapa o Listado]         │
│ TROS │                              │
│      │  ┌─────────────────────────┐ │
│      │  │ [Sushi Master]          │ │
│      │  │ ⭐ 4.7 • €€ • 2km      │ │
│      │  └─────────────────────────┘ │
│      │  ┌─────────────────────────┐ │
│      │  │ [Pizzería Luigi]        │ │
│      │  │ ⭐ 4.3 • €€ • 1.5km    │ │
│      │  └─────────────────────────┘ │
│      │                              │
└──────┴──────────────────────────────┘
```

**Estilos:**
- Usar Tailwind CSS
- Colores: primario #D17A5A (naranja), oscuro #2A2A2A
- Fuente: Sans serif (Helvetica, Inter)
- Responsive: Mobile first

---

## ✅ CHECKLIST DE SALIDA (Sprint 1 Terminado)

- [ ] Home page con buscador
- [ ] Filtros funcionales (6+ filtros)
- [ ] Listado de restaurantes actualizado en tiempo real
- [ ] Endpoints en backend: GET /restaurants, /search, /filter, /:id
- [ ] Base de datos con 30+ restaurantes de ejemplo
- [ ] Geolocalización funcionando (si el usuario lo permite)
- [ ] Responsive (funciona en móvil)
- [ ] Loading states (mientras carga)
- [ ] Error handling (si algo falla)
- [ ] Búsqueda funciona (sin IA aún, solo texto)

---

## 🔄 NO INCLUYE ESTE SPRINT

- ❌ Chatbot IA (Sprint 2)
- ❌ Página de detalle (Sprint 2)
- ❌ Reseñas (Sprint 3)
- ❌ Pagos (Sprint 3)
- ❌ Reservas (Sprint 3)

---

## 📝 NOTAS IMPORTANTES

1. **Datos de restaurantes:** Necesitas insertar datos reales (o semi-reales para demo)
   - Busca restaurantes reales de Valencia
   - Obtén nombres, teléfono, ubicación
   - O inventa 30 restaurantes creíbles para demo

2. **Imágenes:** Por ahora puedes usar URLs placeholder
   - En Sprint 3 integras subida de imágenes real

3. **Geolocalización:** Usa Geolocation API del navegador
   ```javascript
   navigator.geolocation.getCurrentPosition(position => {
     const lat = position.coords.latitude;
     const lng = position.coords.longitude;
     // Guardar y usar para búsqueda por distancia
   });
   ```

4. **Búsqueda por distancia:** En el backend, calcula distancia usando:
   - Haversine formula o librería npm como `geolib`

---

## 🔄 SIGUIENTE PASO

Cuando termines Sprint 1, lee **SPRINT_2_DETAIL.md** para añadir:
- Página de detalle de restaurante
- Chatbot IA básico
- Reseñas
