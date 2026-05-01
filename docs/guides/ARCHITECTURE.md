# 🏗️ Arquitectura de FoodMatch

Esta guía explica cómo está estructurado FoodMatch a nivel técnico.

---

## 🎯 Visión General

FoodMatch es una aplicación **Full-Stack** moderna con:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  FRONTEND (React)                   BACKEND (Node) │
│  ┌──────────────────┐              ┌──────────────┐│
│  │ Home             │◄──────────────┤ API Routes   ││
│  │ Search / Filter  │  HTTP/JSON    │ Controllers  ││
│  │ Detail Page      │               │ Services     ││
│  │ Chatbot          │◄──────────────┤ Middleware   ││
│  │ Orders           │               │              ││
│  │ Auth             │               ├──────────────┤│
│  └──────────────────┘               │ Prisma ORM   ││
│                                    └────────┬───────┘│
│                                             │        │
│                                     ┌───────▼───────┐│
│                                     │  PostgreSQL   ││
│                                     └───────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas

### Backend

```
backend/
│
├── src/
│   ├── server.ts                  # Entrada principal
│   │   - Express app setup
│   │   - Middleware global
│   │   - Routes configuration
│   │
│   ├── routes/                    # Rutas de API
│   │   ├── restaurants.routes.ts  # GET /restaurants, /search, /filter
│   │   ├── auth.routes.ts         # POST /auth/register, /login
│   │   ├── orders.routes.ts       # GET/POST /orders
│   │   ├── reviews.routes.ts      # POST/GET /reviews
│   │   └── favorites.routes.ts    # POST/DELETE /favorites
│   │
│   ├── controllers/               # Lógica de negocios
│   │   ├── restaurants.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── reviews.controller.ts
│   │   └── favorites.controller.ts
│   │
│   ├── services/                  # Servicios reutilizables
│   │   ├── auth.service.ts        # JWT, password hashing
│   │   ├── chatbot.service.ts     # OpenAI/Anthropic integration
│   │   ├── email.service.ts       # Nodemailer
│   │   └── whatsapp.service.ts    # Twilio integration
│   │
│   ├── middleware/                # Middleware Express
│   │   ├── auth.middleware.ts     # JWT validation
│   │   ├── errorHandler.ts        # Global error handling
│   │   └── validation.ts          # Input validation
│   │
│   └── types/                     # TypeScript types
│       └── index.ts               # Custom types
│
├── prisma/
│   ├── schema.prisma              # Definición de modelos
│   │   - User
│   │   - Restaurant
│   │   - Menu
│   │   - Review
│   │   - Favorite
│   │   - Order
│   │   - OrderItem
│   │
│   └── seed.ts                    # Datos iniciales
│       - 30-50 restaurantes de ejemplo
│
├── .env.example                   # Plantilla de variables
├── package.json                   # Dependencias
├── tsconfig.json                  # TypeScript config
└── README.md
```

### Frontend

```
frontend/
│
├── src/
│   ├── App.tsx                    # Componente raíz
│   │
│   ├── pages/                     # Páginas principales
│   │   ├── Home.tsx               # Buscador + Listado
│   │   ├── Restaurant.tsx         # Detalle restaurante
│   │   ├── Register.tsx           # Formulario registro
│   │   ├── Login.tsx              # Formulario login
│   │   ├── MyOrders.tsx           # Historial de pedidos
│   │   └── Profile.tsx            # Perfil usuario
│   │
│   ├── components/                # Componentes reutilizables
│   │   ├── Header/
│   │   │   ├── Navbar.tsx
│   │   │   └── SearchBar.tsx
│   │   │
│   │   ├── Restaurant/
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── RestaurantList.tsx
│   │   │   ├── RestaurantDetail.tsx
│   │   │   ├── RestaurantGallery.tsx
│   │   │   └── RestaurantInfo.tsx
│   │   │
│   │   ├── Filters/
│   │   │   ├── FilterPanel.tsx
│   │   │   └── FilterOption.tsx
│   │   │
│   │   ├── Reviews/
│   │   │   ├── ReviewsSection.tsx
│   │   │   └── ReviewForm.tsx
│   │   │
│   │   ├── Orders/
│   │   │   ├── OrderForm.tsx
│   │   │   └── OrderCard.tsx
│   │   │
│   │   ├── Chatbot/
│   │   │   └── ChatbotWidget.tsx
│   │   │
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   │
│   │   └── Common/
│   │       ├── Loading.tsx
│   │       ├── Error.tsx
│   │       ├── Toast.tsx
│   │       └── Button.tsx
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.ts             # Context de autenticación
│   │   ├── useLocation.ts         # Geolocalización
│   │   └── useDebounce.ts         # Debounce para búsqueda
│   │
│   ├── context/                   # React Context
│   │   ├── AuthContext.tsx        # Estado de usuario
│   │   └── AppContext.tsx         # Estado global (opcional)
│   │
│   ├── api/                       # Llamadas a backend
│   │   ├── client.ts              # Axios config
│   │   ├── restaurants.api.ts     # GET /restaurants
│   │   ├── auth.api.ts            # POST /auth
│   │   ├── orders.api.ts          # GET/POST /orders
│   │   └── reviews.api.ts         # POST /reviews
│   │
│   ├── types/                     # TypeScript types
│   │   ├── restaurant.ts
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── index.ts
│   │
│   ├── styles/                    # Estilos
│   │   ├── globals.css            # Estilos globales
│   │   ├── animations.css         # Animaciones
│   │   └── variables.css          # Variables CSS
│   │
│   └── utils/                     # Utilidades
│       ├── formatters.ts          # Formateo (precio, fecha)
│       ├── validators.ts          # Validación de inputs
│       └── constants.ts           # Constantes
│
├── public/                        # Assets estáticos
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.example                   # Plantilla de variables
├── package.json                   # Dependencias
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Config Vite
├── tailwind.config.js             # Config Tailwind
└── README.md
```

---

## 🔄 Flujo de Datos

### Ejemplo: Buscar Restaurantes

```
USER
  │
  └─► Frontend: SearchBar.tsx
        │
        └─► onChange() ─┐
                        │
                        └─► useDebounce(300ms)
                              │
                              └─► api.searchRestaurants(query)
                                    │
                                    └─► Axios HTTP GET
                                          │
                                          ▼
BACKEND
  GET /api/v1/restaurants/search?query=sushi
        │
        ├─► restaurants.routes.ts
        │     └─► searchRestaurants()
        │
        ├─► restaurants.controller.ts
        │     └─► Buscar en BD (Prisma)
        │
        └─► Response JSON
              │
              ▼
Frontend: RestaurantList.tsx
  │
  └─► state.setRestaurants(data)
        │
        └─► Re-render con resultados
              │
              └─► User ve lista actualizada
```

### Ejemplo: Hacer un Pedido

```
USER
  │
  └─► Frontend: OrderForm.tsx
        │
        ├─► Selecciona platos
        ├─► Escribe notas
        └─► Click "Hacer pedido"
              │
              └─► api.createOrder(restaurantId, items, notes)
                    │
                    └─► Axios HTTP POST
                          └─► Auth header con JWT
                                │
                                ▼
BACKEND
  POST /api/v1/orders
    │
    ├─► auth.middleware.ts
    │     └─► Verifica JWT
    │           └─► req.userId = decoded.userId
    │
    ├─► orders.routes.ts
    │     └─► createOrder()
    │
    ├─► orders.controller.ts
    │     ├─► Obtener datos del usuario
    │     ├─► Validar restaurante
    │     ├─► Calcular total
    │     ├─► Guardar en BD (Prisma)
    │     │
    │     └─► services/whatsapp.service.ts
    │           └─► Enviar mensaje a restaurante
    │
    └─► Response { orderId, status, total }
          │
          ▼
Frontend
  │
  ├─► Mostrar confirmación
  ├─► Guardar orderId en state
  └─► Redirigir a MyOrders
        │
        └─► User ve su pedido creado
```

---

## 🗄️ Base de Datos - Relaciones

```
        User (1) ──── (n) Order
         │
         ├──── (n) Review
         │
         ├──── (n) Favorite
         │
         └──── (n) Session

        Restaurant (1) ──── (n) Order
         │
         ├──── (n) Review
         │
         ├──── (n) Menu
         │
         └──── (n) Favorite

        Menu (1) ──── (n) OrderItem
         │
         └──── (1) Restaurant

        Order (1) ──── (n) OrderItem
         │
         ├──── (1) User
         │
         └──── (1) Restaurant

        Review (n) ──── (1) User
         │
         └──── (1) Restaurant
```

---

## 🔐 Autenticación

### JWT Flow

```
1. User hace POST /auth/register
   {
     email: "user@example.com",
     password: "securePassword123",
     name: "Juan"
   }

2. Backend:
   ├─► Hash password con bcrypt (10 rounds)
   ├─► Crear usuario en BD
   ├─► Generar JWT:
   │   header: { alg: "HS256", typ: "JWT" }
   │   payload: { userId: "...", email: "..." }
   │   signature: HMAC(header.payload, JWT_SECRET)
   └─► Return token

3. Frontend:
   ├─► localStorage.setItem('token', token)
   └─► Redirigir a home

4. Requests posteriores:
   GET /api/v1/orders
   Authorization: Bearer <token>
        │
        └─► auth.middleware.ts
              ├─► Extrae token del header
              ├─► Verifica firma
              ├─► Si válido: req.userId = decoded.userId
              └─► Si inválido: 401 Unauthorized
```

---

## 🤖 Chatbot IA

### Flujo de Conversación

```
User pregunta en ChatbotWidget:
"¿Cuál es vuestro mejor plato?"
  │
  └─► POST /restaurants/:id/chat
        {
          message: "¿Cuál es vuestro mejor plato?",
          conversationHistory: [
            { role: "user", content: "Hola" },
            { role: "assistant", content: "Hola, ..." }
          ]
        }

Backend:
  ├─► Obtener datos del restaurante:
  │   ├─► Nombre, horarios, descripción
  │   ├─► Menú completo
  │   └─► Reseñas recientes
  │
  ├─► Crear system prompt:
  │   "Eres un asistente del restaurante X.
  │    Tipo: Sushi | Horarios: 12:00-23:00
  │    Menú: Sushi Variado €15, Rollos €10...
  │    Responde concisamente sobre el restaurante."
  │
  ├─► Llamar a OpenAI/Anthropic API:
  │   {
  │     model: "gpt-4" o "claude-3-sonnet",
  │     system: system_prompt,
  │     messages: conversation_history + new_message
  │   }
  │
  └─► Response: "Nuestro mejor plato es el Sushi Variado..."
        │
        └─► Frontend:
              ├─► Agregar a historial
              ├─► Mostrar mensaje
              └─► Permitir nueva pregunta
```

---

## 📊 State Management

### Frontend

```
AuthContext (Global)
  ├─► user: { id, email, name, phone }
  ├─► loading: boolean
  ├─► logout(): void
  └─► setUser(user): void

Component Local State
  ├─► Home.tsx
  │   ├─► searchQuery
  │   ├─► filters
  │   └─► restaurants (list)
  │
  ├─► RestaurantDetail.tsx
  │   ├─► restaurant (object)
  │   ├─► reviews (list)
  │   ├─► messages (chatbot history)
  │   └─► isFavorite (boolean)
  │
  └─► OrderForm.tsx
      ├─► selectedItems (map)
      ├─► notes (string)
      └─► total (number)
```

---

## ⚡ Performance Optimizations

### Frontend

```typescript
// 1. Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Restaurant = lazy(() => import('./pages/Restaurant'));

// 2. Image Lazy Loading
<img loading="lazy" src={url} />

// 3. Debouncing en búsqueda
const debouncedSearch = useDebounce(searchQuery, 300);

// 4. Memoization
const MemoCard = memo(RestaurantCard);

// 5. API Caching
const cache = new Map();
function getCachedData(key, fetcher) { ... }
```

### Backend

```sql
-- 1. Índices en BD
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX idx_restaurants_price ON restaurants(priceRange);
CREATE INDEX idx_restaurants_city ON restaurants(city);

-- 2. Pagination
SELECT * FROM restaurants LIMIT 10 OFFSET 0;

-- 3. Eager loading (Prisma)
const restaurant = await prisma.restaurant.findUnique({
  where: { id },
  include: { menu: true, reviews: true }
});
```

---

## 🧪 Testing

### Frontend

```typescript
// Unit test (React Testing Library)
test('SearchBar actualiza lista al escribir', () => {
  const { getByPlaceholderText } = render(<SearchBar />);
  const input = getByPlaceholderText('Busca...');
  
  fireEvent.change(input, { target: { value: 'sushi' } });
  
  expect(axios.get).toHaveBeenCalledWith('/restaurants/search?query=sushi');
});
```

### Backend

```typescript
// Integration test (Supertest)
test('GET /restaurants devuelve lista', async () => {
  const res = await request(app)
    .get('/api/v1/restaurants')
    .expect(200);
  
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});
```

---

## 🚀 Deployment

### Backend (AWS, Heroku, Railway)

```
1. Build:   npm run build
2. DB:      Migrate en producción
3. Env:     Configurar variables de producción
4. Deploy:  git push heroku main
```

### Frontend (Vercel, Netlify)

```
1. Build:   npm run build  → dist/
2. Deploy:  npm install -g vercel && vercel deploy
3. Env:     Configurar VITE_API_URL a producción
```

### Base de Datos (AWS RDS, Render, Railway)

```
1. Crear PostgreSQL en cloud
2. Actualizar DATABASE_URL
3. Ejecutar migraciones en producción
```

---

## 📚 Referencias

- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**¿Entiendes la estructura? Ahora lee el sprint correspondiente.** 🚀
