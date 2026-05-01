# SPRINT 4: PULIDO, OPTIMIZACIÓN Y MEJORAS FINALES
**Duración:** 2-3 semanas
**Objetivo:** MVP pulido, rápido, bonito y listo para usuarios reales.

---

## 📋 RESUMEN

No es funcionalidad nueva, es **pulir lo existente**:
1. Optimizar velocidad
2. Mejorar diseño visual
3. Fixes de bugs
4. Testing
5. Documentación

---

## 🎯 TAREAS ESPECÍFICAS

### 1. OPTIMIZACIÓN DE VELOCIDAD

#### Frontend:

**Code Splitting:**
- Implementar lazy loading de rutas
```typescript
import { lazy, Suspense } from 'react';
const Home = lazy(() => import('./pages/Home'));
const Restaurant = lazy(() => import('./pages/Restaurant'));

// Uso:
<Suspense fallback={<div>Cargando...</div>}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/restaurant/:id" element={<Restaurant />} />
  </Routes>
</Suspense>
```

**Optimización de imágenes:**
- Usar `<img loading="lazy">` para fotos de restaurantes
- Usar formato WebP si es posible
- Comprimir imágenes antes de subir

**Caché de requests:**
```typescript
// frontend/src/api/cache.ts
const cache = new Map();

export function getCachedData(key: string, fetcher: () => Promise<any>, ttl = 5 * 60 * 1000) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }

  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}
```

#### Backend:

**Índices en BD:**
```prisma
model Restaurant {
  // ... campos ...
  
  @@index([cuisine])      // Para filtrar por tipo comida
  @@index([priceRange])   // Para filtrar por precio
  @@index([city])         // Para filtrar por ciudad
  
  @@fulltext([name, description])  // Para búsqueda full-text (si uses PostgreSQL 14+)
}
```

**Paginación en listados:**
```typescript
// Siempre usar limit/offset
GET /api/v1/restaurants?limit=10&offset=0
```

**Compresión de responses:**
```typescript
import compression from 'compression';

app.use(compression());
```

---

### 2. DISEÑO VISUAL - MEJORAS

#### Color & Branding

**Paleta de colores consistente:**
```css
/* frontend/src/styles/globals.css */
:root {
  --color-primary: #D17A5A;      /* Naranja terracota */
  --color-dark: #2A2A2A;         /* Gris oscuro */
  --color-light: #F8F8F8;        /* Blanco roto */
  --color-accent: #06A77D;       /* Verde menta */
  --color-error: #D62828;        /* Rojo */
  --color-success: #06A77D;      /* Verde */
  --color-text: #3D3D3D;         /* Texto gris */
  --color-text-light: #808080;   /* Texto gris claro */
}
```

#### Componentes Visuales

**1. Card mejorada (RestaurantCard):**
```typescript
export function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
      {/* Imagen con skeleton loading */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {loading && <SkeletonLoader height={48} />}
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          loading="lazy"
        />
        
        {/* Badge de rating */}
        <div className="absolute top-3 right-3 bg-[--color-primary] text-white px-3 py-1 rounded-full text-sm font-semibold">
          ⭐ {restaurant.rating.toFixed(1)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
        <p className="text-[--color-text-light] text-sm mb-3">
          {restaurant.cuisine} • {restaurant.priceRange} • {restaurant.distance}km
        </p>
        
        <button className="w-full bg-[--color-primary] text-white py-2 rounded font-semibold hover:bg-opacity-90 transition-colors">
          Ver detalles
        </button>
      </div>
    </div>
  );
}
```

**2. Input mejorado:**
```typescript
export function SearchInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`border-2 rounded-lg px-4 py-3 flex items-center gap-2 transition-colors ${
      focused ? 'border-[--color-primary] bg-white' : 'border-gray-200 bg-gray-50'
    }`}>
      <span className="text-[--color-text-light]">🔍</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Busca por tipo de comida..."
        className="flex-1 bg-transparent outline-none text-[--color-text]"
      />
    </div>
  );
}
```

**3. Loading skeleton:**
```typescript
export function SkeletonLoader({ height = 48, width = '100%' }) {
  return (
    <div
      className="bg-gray-200 animate-pulse rounded"
      style={{ height: `${height}px`, width }}
    />
  );
}
```

**4. Toast notifications:**
```typescript
// frontend/src/components/Toast.tsx
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const bgColor = type === 'error' ? 'bg-[--color-error]' : 'bg-[--color-success]';

  return (
    <div className={`fixed bottom-4 right-4 text-white px-4 py-3 rounded-lg shadow-lg ${bgColor} animate-slide-in`}>
      {message}
    </div>
  );
}
```

#### Animaciones suaves

```css
/* frontend/src/styles/animations.css */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

---

### 3. FIXES Y BUGS

#### Errores Comunes a Revisar:

**1. Manejo de errores global:**
```typescript
// frontend/src/api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

**2. Validación de inputs:**
```typescript
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s\+\-\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 9;
}
```

**3. Límites de búsqueda:**
- Máximo 100 resultados por página
- Máximo 50 caracteres en búsqueda
- Debounce de 300ms en búsqueda en tiempo real

```typescript
import { useState, useCallback } from 'react';

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useCallback(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 4. TESTING

#### Frontend - Tests básicos:

```typescript
// frontend/src/components/__tests__/RestaurantCard.test.tsx
import { render, screen } from '@testing-library/react';
import RestaurantCard from '../RestaurantCard';

describe('RestaurantCard', () => {
  it('renders restaurant name', () => {
    const restaurant = {
      id: '1',
      name: 'Test Restaurant',
      cuisine: 'Sushi',
      priceRange: '€€',
      distance: 2.5,
      rating: 4.5
    };

    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('displays rating', () => {
    // ...
    expect(screen.getByText(/⭐ 4.5/)).toBeInTheDocument();
  });
});
```

#### Backend - Tests básicos:

```typescript
// backend/src/__tests__/restaurants.test.ts
import request from 'supertest';
import app from '../server';

describe('GET /api/v1/restaurants', () => {
  it('should return list of restaurants', async () => {
    const response = await request(app)
      .get('/api/v1/restaurants')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should filter by cuisine', async () => {
    const response = await request(app)
      .get('/api/v1/restaurants/filter')
      .query({ cuisine: 'Sushi' })
      .expect(200);

    expect(response.body.data.every((r: any) => r.cuisine === 'Sushi')).toBe(true);
  });
});
```

---

### 5. RESPONSIVE DESIGN

**Breakpoints:**
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```

**Ejemplo - Navbar responsive:**
```typescript
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="text-2xl font-bold text-[--color-primary]">FoodMatch</div>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6">
          <a href="/">Home</a>
          <a href="/my-orders">Mis Pedidos</a>
          <a href="/profile">Perfil</a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 right-0 bg-white border-b w-full p-4 space-y-2 md:hidden">
            <a href="/">Home</a>
            <a href="/my-orders">Mis Pedidos</a>
            <a href="/profile">Perfil</a>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

### 6. DOCUMENTACIÓN Y COMENTARIOS

**Backend - Comentarios:**
```typescript
/**
 * Obtiene restaurantes con filtros
 * @param cuisine - Tipo de comida (ej: Sushi)
 * @param priceRange - Rango de precio (€, €€, €€€)
 * @param city - Ciudad (ej: Valencia)
 * @returns Array de restaurantes
 */
export async function filterRestaurants(cuisine, priceRange, city) {
  // Implementación...
}
```

**README.md mejorado:**
```markdown
# FoodMatch

Descubre tu restaurante perfecto en segundos.

## Instalación

### Backend
```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Ver `.env.example` para plantilla completa.

## API Documentation

[Link a documentación API]

## Troubleshooting

- **"Database connection refused"**: Asegúrate que PostgreSQL está corriendo
- **"Token expirado"**: Borra localStorage y vuelve a iniciar sesión

---

## Contribuir

Pull requests welcome!
```

---

### 7. PERFORMANCE METRICS

**Cosas a medir:**

```typescript
// frontend/src/utils/analytics.ts
export function logPageLoad(pageName: string, loadTime: number) {
  console.log(`Page ${pageName} loaded in ${loadTime}ms`);
  // En producción: enviar a analytics
}

// Uso:
useEffect(() => {
  const startTime = performance.now();
  // ... cargar datos ...
  const endTime = performance.now();
  logPageLoad('RestaurantDetail', endTime - startTime);
}, []);
```

**Objetivos:**
- Página de home: < 2 segundos
- Detalle restaurante: < 1.5 segundos
- Búsqueda: < 500ms
- Mobile: puede ser un poco más lento, máximo 3 segundos

---

## ✅ CHECKLIST DE SALIDA (Sprint 4 - MVP COMPLETO)

**Velocidad:**
- [ ] Home carga en < 2 segundos
- [ ] Búsqueda responde inmediatamente
- [ ] Imágenes cargan lazy
- [ ] No hay peticiones innecesarias

**Diseño:**
- [ ] Consistencia visual (colores, tipografía)
- [ ] Botones son claramente clickeables
- [ ] Loading states en todos lados
- [ ] Error messages claros

**Responsive:**
- [ ] Funciona en móvil (320px+)
- [ ] Funciona en tablet
- [ ] Funciona en desktop
- [ ] Navbar se adapta

**Funcionalidad:**
- [ ] No hay errores en consola
- [ ] Todos los features funcionan
- [ ] Manejo de errores funciona
- [ ] Session persiste (localStorage)

**Documentación:**
- [ ] README actualizado
- [ ] Código comentado
- [ ] API documentada
- [ ] Deploy instructions claras

---

## 📝 NOTAS FINALES

Este es tu **MVP listo para producción**. No es perfecto, pero:
- ✅ Es funcional
- ✅ Es rápido
- ✅ Es bonito
- ✅ Es seguro
- ✅ Usuarios reales pueden usarlo

**Próximos pasos (después de MVP):**
- Recolectar feedback de usuarios reales
- Integración con restaurantes (panel de admin)
- Pagos reales con Stripe
- Notificaciones push
- App nativa
- Expansion a otras ciudades

---

## 🚀 DEPLOYMENT

Cuando todo esté listo:

**Backend (Heroku, Railway, AWS):**
```bash
git push heroku main
```

**Frontend (Vercel, Netlify):**
```bash
npm run build
# Deploy dist/ folder
```

**Base de Datos:**
- AWS RDS PostgreSQL
- Render.com PostgreSQL
- Railway PostgreSQL

---

**Felicidades, has completado el MVP. Ahora a buscar usuarios reales.**
