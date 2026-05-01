# ✅ CHECKLISTS POR SPRINT

Use estos checklists para trackear el progreso. Cuando todo esté checked, el sprint está completo.

---

## ✅ SPRINT 0: SETUP

### Configuración Inicial
- [ ] Carpeta del proyecto creada
- [ ] Git inicializado (`git init`)
- [ ] `.gitignore` creado
- [ ] Carpetas backend/ y frontend/ creadas

### Backend
- [ ] Carpeta `backend/` con estructura de carpetas:
  - [ ] `src/`
  - [ ] `src/routes/`
  - [ ] `src/controllers/`
  - [ ] `src/middleware/`
  - [ ] `src/services/`
  - [ ] `src/types/`
  - [ ] `prisma/`
- [ ] `package.json` creado con dependencias
- [ ] `tsconfig.json` creado
- [ ] `.env.example` creado
- [ ] `.env` creado con valores locales
- [ ] Prisma inicializado: `npx prisma init`
- [ ] Prisma schema completo (User, Restaurant, Menu, Review, Favorite, Order, OrderItem)
- [ ] Base de datos creada: `createdb foodmatch`
- [ ] Migraciones ejecutadas: `npx prisma migrate dev --name init`
- [ ] `backend/src/server.ts` básico creado
- [ ] Backend compila sin errores: `npm run build`
- [ ] Backend corre sin errores: `npm run dev`
- [ ] `localhost:5000` responde

### Frontend
- [ ] Carpeta `frontend/` con estructura:
  - [ ] `src/components/`
  - [ ] `src/pages/`
  - [ ] `src/hooks/`
  - [ ] `src/api/`
  - [ ] `src/styles/`
  - [ ] `src/types/`
  - [ ] `public/`
- [ ] `package.json` creado con dependencias (React, Vite, Tailwind, Axios)
- [ ] `vite.config.ts` creado
- [ ] `tailwind.config.js` creado
- [ ] `tsconfig.json` creado
- [ ] `.env` creado con `VITE_API_URL=http://localhost:5000`
- [ ] `frontend/src/App.tsx` básico
- [ ] Frontend compila sin errores: `npm run build`
- [ ] Frontend corre sin errores: `npm run dev`
- [ ] `localhost:5173` carga sin errores

### Base de Datos
- [ ] PostgreSQL corriendo (verificar: `psql -U postgres`)
- [ ] Base de datos `foodmatch` creada
- [ ] Todas las tablas creadas:
  - [ ] users
  - [ ] restaurants
  - [ ] menus
  - [ ] reviews
  - [ ] favorites
  - [ ] orders
  - [ ] order_items
- [ ] Prisma client generado: `npx prisma generate`
- [ ] Prisma Studio funciona: `npx prisma studio`

### Autenticación Básica
- [ ] `backend/src/services/auth.service.ts` creado
- [ ] `backend/src/middleware/auth.middleware.ts` creado
- [ ] JWT_SECRET en `.env`
- [ ] Bcrypt instalado

### Documentación
- [ ] `README.md` creado en raíz
- [ ] `README.md` incluye instrucciones de instalación
- [ ] `.env.example` con todos los valores necesarios

### Verificación Final
- [ ] `npm run dev` en backend funciona
- [ ] `npm run dev` en frontend funciona
- [ ] Backend en http://localhost:5000
- [ ] Frontend en http://localhost:5173
- [ ] Prisma Studio en http://localhost:5555
- [ ] No hay errores en consola de backend
- [ ] No hay errores en consola de frontend

---

## ✅ SPRINT 1: MVP BÁSICO

### Frontend

#### Home Page
- [ ] Componente `Home.tsx` creado
- [ ] Layout principal visible
- [ ] Navbar con logo
- [ ] Header con buscador prominente

#### Buscador
- [ ] `SearchBar.tsx` creado
- [ ] Input funcional
- [ ] Input busca en TIEMPO REAL
- [ ] Placeholder descriptivo
- [ ] Icono de lupa

#### Filtros
- [ ] `FilterPanel.tsx` creado
- [ ] Filtro por tipo de comida (Sushi, Pizza, Carne, etc)
- [ ] Filtro por zona/ciudad
- [ ] Filtro por rango de precio (€, €€, €€€)
- [ ] Filtro por formato (Buffet, À la carte, Menú del día)
- [ ] Botón "Limpiar filtros"
- [ ] Al cambiar filtro: lista actualiza EN TIEMPO REAL

#### Listado
- [ ] `RestaurantList.tsx` creado
- [ ] `RestaurantCard.tsx` creado
- [ ] Cada card muestra: foto, nombre, tipo, precio, distancia, rating
- [ ] Grid responsive (1 columna móvil, 2 tablet, 3+ desktop)
- [ ] Paginación o scroll infinito
- [ ] Loading state mientras carga
- [ ] Mensaje si no hay resultados

#### Mapa (Opcional pero recomendado)
- [ ] `Map.tsx` creado (si se hace)
- [ ] Google Maps o OpenStreetMap integrado
- [ ] Pins de restaurantes visibles
- [ ] Ubicación del usuario visible (azul)
- [ ] Click en pin muestra info

#### Geolocalización
- [ ] `useLocation.ts` hook creado
- [ ] Solicita permiso al usuario
- [ ] Si sí: muestra restaurantes en radio 5km
- [ ] Si no: muestra todos en Valencia

#### API Service
- [ ] `frontend/src/api/client.ts` creado
- [ ] Axios configurado con baseURL
- [ ] Funciones para GET `/restaurants`, `/search`, `/filter`
- [ ] Error handling en cliente

### Backend

#### Endpoints
- [ ] `GET /api/v1/restaurants` implementado
  - [ ] Query params: city, limit, offset
  - [ ] Response con lista de restaurantes
- [ ] `GET /api/v1/restaurants/search` implementado
  - [ ] Query param: query
  - [ ] Busca por nombre (case-insensitive)
  - [ ] Response con resultados
- [ ] `GET /api/v1/restaurants/filter` implementado
  - [ ] Query params: cuisine, priceRange, format, city, latitude, longitude, radius, sortBy, limit, offset
  - [ ] Filtra por todos los criterios
  - [ ] Calcula distancia si lat/lng proporcionado
  - [ ] Ordena por sortBy (distance, rating, name)
- [ ] `GET /api/v1/restaurants/:id` implementado
  - [ ] Param: id
  - [ ] Response con datos completos del restaurante

#### Controllers
- [ ] `backend/src/controllers/restaurants.controller.ts` creado
- [ ] Función `getAllRestaurants`
- [ ] Función `searchRestaurants`
- [ ] Función `filterRestaurants`
- [ ] Función `getRestaurantById`

#### Routes
- [ ] `backend/src/routes/restaurants.routes.ts` creado
- [ ] Rutas GET `/`, `/search`, `/filter`, `/:id` configuradas

#### Base de Datos
- [ ] Seed data con 30-50 restaurantes
- [ ] Script `backend/prisma/seed.ts` ejecutado
- [ ] Datos realistas (nombres reales de Valencia)
- [ ] Todos los campos completados (foto, ubicación, teléfono, horarios, etc)
- [ ] Índices en campos de filtrado:
  - [ ] `@@index([cuisine])`
  - [ ] `@@index([priceRange])`
  - [ ] `@@index([city])`

### Integración
- [ ] Frontend llama correctamente a backend
- [ ] Búsqueda filtra sin delays
- [ ] Filtros actualizan lista en vivo
- [ ] Resultados mostrados correctamente

### Responsive
- [ ] Home funciona en móvil (320px)
- [ ] Home funciona en tablet (768px)
- [ ] Home funciona en desktop (1024px+)
- [ ] Filtros responsivos (sidebar o collapsible en móvil)
- [ ] Listado responsivo (1-2-3 columnas)

### Performance
- [ ] Página carga en < 2 segundos
- [ ] Búsqueda responde en < 500ms
- [ ] No hay network requests duplicados
- [ ] Console sin warnings/errors

### Testing Manual
- [ ] Abre http://localhost:5173
- [ ] Escribe en buscador, ve resultados
- [ ] Cambia filtros, ve cambios en lista
- [ ] Click en restaurante (error esperado, para Sprint 2)
- [ ] Responsive en móvil

### Documentación
- [ ] `API.md` creado con endpoints documentados
- [ ] Ejemplos de responses en `API.md`

---

## ✅ SPRINT 2: DETALLE + CHATBOT + RESEÑAS

### Frontend

#### Página de Detalle
- [ ] `RestaurantDetail.tsx` creado
- [ ] Ruta `/restaurant/:id` funciona
- [ ] Datos del restaurante cargan correctamente
- [ ] Layout implementado (foto, info, menú, reseñas, chatbot)

#### Galería de Fotos
- [ ] `RestaurantGallery.tsx` creado
- [ ] Foto principal prominente
- [ ] Scroll horizontal de más fotos
- [ ] Lazy loading de imágenes

#### Info del Restaurante
- [ ] `RestaurantInfo.tsx` creado
- [ ] Nombre, rating, tipo visible
- [ ] Dirección
- [ ] Teléfono (clickeable para llamar: `tel:`)
- [ ] Link a ubicación (Google Maps)
- [ ] Botón de favorito (corazón)

#### Menú
- [ ] `MenuSection.tsx` creado
- [ ] Lista de platos
- [ ] Cada plato: nombre, descripción, precio, categoría
- [ ] Foto de plato si existe
- [ ] Categorizado (Sushi, Rollos, Postres, etc)

#### Reseñas
- [ ] `ReviewsSection.tsx` creado
- [ ] Últimas 5 reseñas visibles
- [ ] Cada reseña: avatar, nombre, rating (⭐), comentario, fecha
- [ ] Rating promedio calculado
- [ ] Botón "Ver todas las reseñas"
- [ ] Botón "Escribe una reseña" (solo usuarios logueados)

#### Formulario de Reseña
- [ ] `ReviewForm.tsx` creado
- [ ] Selector de rating (1-5 estrellas)
- [ ] Campo de comentario (máx 500 caracteres)
- [ ] Botón submit
- [ ] Validación: requiere mínimo 1 carácter
- [ ] Requiere estar logueado
- [ ] Mensaje de éxito al enviar

#### Chatbot
- [ ] `ChatbotWidget.tsx` creado
- [ ] Widget visible en la página (bottom-right recomendado)
- [ ] Mensaje de bienvenida
- [ ] Input para escribir
- [ ] Historial de conversación visible
- [ ] Loading state mientras procesa
- [ ] Mensajes del usuario y asistente diferenciados

#### Componentes Auxiliares
- [ ] `FavoriteButton.tsx` creado
- [ ] Icono corazón clickeable
- [ ] Estado toggle (favorito/no favorito)
- [ ] Requiere autenticación
- [ ] Mensaje si no está logueado

### Backend

#### Endpoints - Restaurantes
- [ ] `GET /api/v1/restaurants/:id` actualizado
  - [ ] Incluye menu items
  - [ ] Incluye reviews
  - [ ] Incluye rating promedio

#### Endpoints - Chatbot
- [ ] `POST /api/v1/restaurants/:id/chat` implementado
  - [ ] Recibe: message, conversationHistory
  - [ ] Responde con reply del chatbot
  - [ ] Basado en contexto del restaurante (menú, info)

#### Endpoints - Reseñas
- [ ] `GET /api/v1/restaurants/:id/reviews` implementado
  - [ ] Query param: limit, offset
  - [ ] Response: lista de reviews + averageRating + totalCount
- [ ] `POST /api/v1/restaurants/:id/reviews` implementado (requiere auth)
  - [ ] Body: rating, comment, imageUrl (opcional)
  - [ ] Validación: rating 1-5, comment no vacío
  - [ ] Guarda en BD
  - [ ] Response: review creada

#### Endpoints - Favoritos
- [ ] `POST /api/v1/restaurants/:id/favorite` implementado (requiere auth)
  - [ ] Añade a favoritos
- [ ] `DELETE /api/v1/restaurants/:id/favorite` implementado (requiere auth)
  - [ ] Quita de favoritos
- [ ] `GET /api/v1/me/favorites` implementado (requiere auth)
  - [ ] Lista de restaurantes favoritos del usuario

#### Controllers
- [ ] `backend/src/controllers/reviews.controller.ts` creado
- [ ] `backend/src/controllers/favorites.controller.ts` creado

#### Services
- [ ] `backend/src/services/chatbot.service.ts` creado
- [ ] Función `chatWithRestaurant` implementada
- [ ] Integración con OpenAI/Anthropic API
- [ ] System prompt configurado correctamente

#### Base de Datos
- [ ] Datos de menús en BD (via seed o migration)
- [ ] Algunos menús tienen imágenes (URLs placeholder ok por ahora)
- [ ] Relaciones Menu ↔ Restaurant correctas

#### API Key
- [ ] OPENAI_API_KEY o ANTHROPIC_API_KEY en `.env`
- [ ] Service de chatbot usa correctamente la key
- [ ] Error handling si key inválida

### Integración
- [ ] Click en restaurante abre detalle
- [ ] Datos cargan correctamente
- [ ] Menú muestra categorizado
- [ ] Reseñas se muestran
- [ ] Chatbot responde a preguntas
  - [ ] "¿Cuál es tu mejor plato?" → Responde sobre menú
  - [ ] "¿A qué hora cierran?" → Responde horarios
  - [ ] "¿Sin gluten?" → Responde relevante

### Seguridad
- [ ] Solo usuarios logueados pueden escribir reseñas
- [ ] Usuario solo ve su propia opción de eliminar/editar reseña
- [ ] Favoritos protegidos por autenticación

### Performance
- [ ] Detalle carga en < 1.5 segundos
- [ ] Chatbot responde en < 3 segundos (API latency ok)
- [ ] Imágenes lazy load
- [ ] Historial de chat no carga miles de mensajes

### Testing Manual
- [ ] Abre detalle de un restaurante
- [ ] Ves menú categorizado
- [ ] Ves reseñas existentes
- [ ] Escribes en chatbot: "¿Qué es lo mejor?"
- [ ] Chatbot responde sobre el menú
- [ ] Click en corazón favorito (requiere login)
- [ ] Click en "Escribe reseña" (requiere login)

---

## ✅ SPRINT 3: PEDIDOS + LOGIN

### Frontend

#### Autenticación

**Register Page:**
- [ ] Página `/register` creada
- [ ] Form con: email, password, nombre
- [ ] Validación cliente (email válido, password mín 8 caracteres)
- [ ] Submit crea usuario
- [ ] Token guardado en localStorage
- [ ] Redirige a home si éxito
- [ ] Error message si falla

**Login Page:**
- [ ] Página `/login` creada
- [ ] Form con: email, password
- [ ] Submit llama a endpoint login
- [ ] Token guardado en localStorage
- [ ] Redirige a home si éxito
- [ ] Error message si falla
- [ ] Link a registro si no tiene cuenta

**Auth Context:**
- [ ] `AuthContext.tsx` creado
- [ ] Provider wraps la app
- [ ] Mantiene estado del usuario
- [ ] Función logout
- [ ] Al cargar app: verifica si hay token guardado
- [ ] Hook `useAuth()` funciona

**Protected Routes:**
- [ ] Rutas protegidas redirigen a login si no autenticado
- [ ] Ej: `/my-orders`, `/profile` requieren auth
- [ ] Component `ProtectedRoute.tsx` implementado

**Navbar Actualizado:**
- [ ] Si logueado: muestra nombre usuario
- [ ] Si logueado: muestra botón logout
- [ ] Si no logueado: muestra links login/register
- [ ] Logout limpia localStorage y redirige

#### Pedidos

**Order Form:**
- [ ] `OrderForm.tsx` creado
- [ ] En página de detalle del restaurante
- [ ] Selector de cantidad por plato (+/- botones)
- [ ] Campo de notas especiales (opcional)
- [ ] Muestra total actualizado
- [ ] Botón "Hacer pedido"
- [ ] Valida: al menos 1 plato
- [ ] Valida: usuario logueado
- [ ] Submit crea orden

**Historial de Pedidos:**
- [ ] Página `/my-orders` creada
- [ ] Lista de pedidos del usuario
- [ ] Cada pedido muestra:
  - [ ] Nombre del restaurante
  - [ ] Fecha
  - [ ] Total
  - [ ] Estado (pendiente, confirmado, listo, etc)
- [ ] Click en pedido → detalle
- [ ] Requiere autenticación

**Detalle de Pedido:**
- [ ] Página `/orders/:id` creada
- [ ] Muestra todos los datos:
  - [ ] Restaurante
  - [ ] Platos pedidos (cantidad, precio)
  - [ ] Total
  - [ ] Estado
  - [ ] Notas
  - [ ] Contacto restaurante
- [ ] Requiere que sea el propietario

**Perfil de Usuario:**
- [ ] Página `/profile` creada
- [ ] Muestra datos: email, nombre, teléfono
- [ ] Botón para editar
- [ ] Botón logout
- [ ] Requiere autenticación

### Backend

#### Auth Endpoints
- [ ] `POST /api/v1/auth/register` implementado
  - [ ] Body: email, password, name
  - [ ] Validación: email único, password mín 8 caracteres
  - [ ] Password hasheado con bcrypt
  - [ ] Response: token JWT + user
- [ ] `POST /api/v1/auth/login` implementado
  - [ ] Body: email, password
  - [ ] Validación: email existe, password correcto
  - [ ] Response: token JWT + user
- [ ] `GET /api/v1/auth/me` implementado (requiere auth)
  - [ ] Response: datos del usuario autenticado
- [ ] `PUT /api/v1/auth/me` implementado (requiere auth)
  - [ ] Body: name, phone, email (actualizar)
  - [ ] Response: usuario actualizado
- [ ] `POST /api/v1/auth/logout` (opcional, client-side es suficiente)

#### Order Endpoints
- [ ] `POST /api/v1/orders` implementado (requiere auth)
  - [ ] Body: restaurantId, items[], notes
  - [ ] Validación: restaurante existe, items válidos
  - [ ] Calcula total correcto
  - [ ] Crea Order en BD
  - [ ] **Envía a restaurante por WhatsApp o Email**
  - [ ] Response: order creada
- [ ] `GET /api/v1/orders` implementado (requiere auth)
  - [ ] Query: limit, offset
  - [ ] Response: lista de pedidos del usuario
- [ ] `GET /api/v1/orders/:id` implementado (requiere auth)
  - [ ] Param: id
  - [ ] Validación: usuario es propietario
  - [ ] Response: detalle completo del pedido

#### Controllers
- [ ] `backend/src/controllers/auth.controller.ts` creado
- [ ] Función `register`
- [ ] Función `login`
- [ ] Función `getMe`
- [ ] Función `updateMe`
- [ ] `backend/src/controllers/orders.controller.ts` creado
- [ ] Función `createOrder`
- [ ] Función `getOrders`
- [ ] Función `getOrderById`

#### Services
- [ ] `backend/src/services/auth.service.ts` actualizado
- [ ] Función `registerUser` con bcrypt
- [ ] Función `loginUser` con validación
- [ ] Función `verifyToken` JWT
- [ ] `backend/src/services/whatsapp.service.ts` creado (si Twilio)
  - [ ] Función `sendOrderViaWhatsApp`
  - [ ] Formatea número correctamente
  - [ ] Mensaje claro con datos del pedido
- [ ] `backend/src/services/email.service.ts` creado (fallback)
  - [ ] Función `sendOrderViaEmail`
  - [ ] Email profesional con datos
  - [ ] Tested con nodemailer

#### Middleware
- [ ] `backend/src/middleware/auth.middleware.ts` actualizado
- [ ] Valida JWT
- [ ] Extrae userId
- [ ] Retorna 401 si inválido

#### Base de Datos
- [ ] Schema actualizado con Order, OrderItem models
- [ ] Relaciones correctas
- [ ] Índices en userId, restaurantId
- [ ] Migraciones ejecutadas

#### Config
- [ ] JWT_SECRET en `.env`
- [ ] EMAIL_USER, EMAIL_PASSWORD en `.env` (Gmail App Password)
- [ ] TWILIO_* en `.env` si usas WhatsApp
- [ ] Bcrypt salt rounds configurado (10+)

### Integración
- [ ] Register/Login flujo completo
- [ ] Usuario logueado puede hacer pedidos
- [ ] Pedido aparece en "Mis Pedidos"
- [ ] **Restaurante recibe pedido por WhatsApp o Email**
- [ ] Mensaje incluye: cliente, teléfono, platos, total, notas

### Seguridad
- [ ] Contraseña hasheada (no texto plano)
- [ ] JWT valida antes de acceder a datos protegidos
- [ ] Usuario no puede ver pedidos de otros
- [ ] Email único (no duplicados)
- [ ] Validación inputs: email, password, phone

### Testing Manual
- [ ] Register: crea usuario, logea automaticamente
- [ ] Login: entra con email/password correctos
- [ ] Login fallido: muestra error
- [ ] Navegar protegidas sin login → redirige a login
- [ ] Hacer pedido → aparece en "Mis Pedidos"
- [ ] Restaurante recibe WhatsApp o Email
- [ ] Logout: limpia localStorage, redirige

---

## ✅ SPRINT 4: PULIDO

### Performance
- [ ] Home carga en < 2 segundos
- [ ] Detalle carga en < 1.5 segundos
- [ ] Búsqueda responde en < 500ms
- [ ] Imágenes con lazy loading
- [ ] Code splitting implementado
- [ ] No hay requests duplicados (revisar Network tab)

### Frontend - Diseño
- [ ] Colores consistentes (primario, dark, light, accent)
- [ ] Tipografía consistente
- [ ] Botones claramente clickeables
- [ ] Loading states en todos lados
- [ ] Error messages claros
- [ ] Animaciones suaves (no jarring)
- [ ] Hover effects en botones/cards

### Frontend - Responsive
- [ ] Mobile (320px): funciona perfecto
- [ ] Tablet (768px): layout adapta
- [ ] Desktop (1024px+): uso de espacio
- [ ] Navbar responsive (hamburger en móvil)
- [ ] Listado responsive (1-2-3 columnas)
- [ ] Detalle responsive (layout adapta)

### Frontend - Código
- [ ] No hay errores en consola
- [ ] No hay warnings en consola
- [ ] Componentes bien nombrados
- [ ] Props tipadas con TypeScript
- [ ] Funciones documentadas (JSDoc)
- [ ] No hay código comentado/muerto
- [ ] Imports organizados

### Backend - Código
- [ ] No hay errores en logs
- [ ] Endpoints validan inputs
- [ ] Errores retornan status correcto (400, 401, 404, 500)
- [ ] Messages de error claros
- [ ] Funciones documentadas
- [ ] No hay código comentado

### Backend - Seguridad
- [ ] Contraseñas hasheadas ✅
- [ ] JWT valida ✅
- [ ] CORS configurado
- [ ] Rate limiting (opcional pero recomendado)
- [ ] Validación de inputs
- [ ] SQL injection prevenido (Prisma lo hace)

### Testing
- [ ] Tests unitarios básicos para componentes
- [ ] Tests para funciones auth
- [ ] Tests para endpoints principales
- [ ] Manual testing completo:
  - [ ] Register/Login funciona
  - [ ] Búsqueda funciona
  - [ ] Detalle funciona
  - [ ] Chatbot funciona
  - [ ] Pedidos funcionan

### Documentación
- [ ] README.md actualizado
  - [ ] Instrucciones instalación
  - [ ] Instrucciones desarrollo
  - [ ] Variables de entorno
  - [ ] Troubleshooting
- [ ] API.md completo
  - [ ] Todos los endpoints
  - [ ] Request/response examples
  - [ ] Errores posibles
- [ ] Código comentado:
  - [ ] Funciones complejas
  - [ ] Lógica no obvia
  - [ ] Servicio de chatbot especialmente

### Deployment
- [ ] Build frontend sin errores: `npm run build`
- [ ] Build backend compila: `npm run build`
- [ ] Env variables documentadas
- [ ] README con pasos de deploy

### Final QA
- [ ] Abre app desde cero
- [ ] Navega home → detalle → pedido → historial
- [ ] Completa flujo usuario:
  1. Visita home
  2. Busca restaurante
  3. Ve detalle
  4. Habla con chatbot
  5. Se registra
  6. Hace pedido
  7. Ve historial
- [ ] Todo funciona sin errores
- [ ] Se ve profesional
- [ ] Es rápido
- [ ] Error messages son útiles
- [ ] No hay bugs obvios

### Go-Live Checklist
- [ ] Backup de BD hecho
- [ ] Código en git con commits claros
- [ ] `.env` tiene valores seguros (no públicos)
- [ ] API keys seguras (no en código)
- [ ] CORS whitelist configurado (para producción)
- [ ] Logs configurados (para debug en producción)
- [ ] Error monitoring listo (Sentry, etc - opcional)

---

## 🏁 MVP COMPLETO

Si todo está checked en los 4 sprints:

✅ **Tienes un MVP funcional, rápido, bonito y seguro**

Puedes:
- Hacer deploy a producción
- Buscar primeros usuarios
- Recolectar feedback
- Iterar según feedback

---

## 📊 TRACKING FINAL

Marca el estado actual:

```
Sprint 0: [████████░░] 80%
Sprint 1: [██████░░░░] 60%
Sprint 2: [███░░░░░░░] 30%
Sprint 3: [░░░░░░░░░░] 0%
Sprint 4: [░░░░░░░░░░] 0%

MVP Completo: 25%
```

---

Buena suerte. ¡A terminar esto! 🚀
