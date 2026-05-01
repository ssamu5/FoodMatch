# SPRINT 0: SETUP Y CONFIGURACIÓN INICIAL
**Duración:** 1-2 semanas
**Objetivo:** Tener el proyecto lista para desarrollo rápido. Base sólida, nada de funcionalidad de usuario aún.

---

## 📋 RESUMEN

Configurar:
1. Proyecto React/Node.js con estructura clara
2. Base de datos PostgreSQL local
3. Autenticación básica
4. Sistema de variables de entorno
5. Estructura de carpetas limpia
6. Herramientas de desarrollo (testing, linting)

---

## 🛠️ TECH STACK (Decidido)

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS (para estilos)
- Vite (compilador rápido)

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM (para base de datos)
- JWT para autenticación

**Base de Datos:**
- PostgreSQL local (en desarrollo)
- Later: AWS RDS o similar

**Terceros:**
- Stripe API (después en Sprint 3)
- OpenAI/Anthropic API (después en Sprint 2)

---

## 📁 ESTRUCTURA DE CARPETAS

```
foodmatch/
├── frontend/                 # Código React
│   ├── public/
│   ├── src/
│   │   ├── components/       # Componentes React reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # Llamadas a backend
│   │   ├── styles/          # Estilos globales
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Código Node/Express
│   ├── src/
│   │   ├── routes/          # Rutas API
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── models/          # Prisma models
│   │   ├── middleware/       # Auth, validación, etc
│   │   ├── services/        # Servicios (email, IA, etc)
│   │   ├── types/           # TypeScript types
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma    # Definición base de datos
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                     # Documentación (este archivo y similares)
│   ├── SPRINT_0_SETUP.md    (este archivo)
│   ├── SPRINT_1_MVP.md
│   ├── SPRINT_2_DETAIL.md
│   └── API_SPEC.md          (especificación de endpoints)
│
└── README.md
```

---

## 🗄️ BASE DE DATOS - SCHEMA INICIAL

**Prisma Schema (backend/prisma/schema.prisma):**

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Usuario (para futuro login)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // será hasheada con bcrypt
  name      String?
  createdAt DateTime @default(now())
  
  reviews   Review[]
  favorites Favorite[]
  
  @@map("users")
}

// Restaurante
model Restaurant {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // Ubicación
  latitude    Float
  longitude   Float
  address     String
  city        String  // "Valencia", "Madrid", etc
  
  // Contacto
  phone       String
  email       String?
  website     String?
  
  // Tipo de comida
  cuisine     String   // "Sushi", "Pizza", "Carne", etc
  format      String   // "Buffet", "À la carte", "Menú del día"
  priceRange  String   // "€", "€€", "€€€"
  
  // Horarios
  openingTime String  // "12:00"
  closingTime String  // "23:00"
  closedDays  String  // "Lunes,Martes" (vacío si abierto todos los días)
  
  // Imágenes
  imageUrl    String?
  
  // Menú
  menu        Menu[]
  
  // Reseñas
  reviews     Review[]
  
  // Favoritos
  favorites   Favorite[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("restaurants")
}

// Menú (platos de un restaurante)
model Menu {
  id           String   @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  name         String    // "Sushi Variado"
  description  String?   // "Incluye 20 piezas..."
  price        Float     // 15.50
  imageUrl     String?
  
  category     String    // "Sushi", "Rollos", "Postres", etc
  
  createdAt    DateTime @default(now())
  
  @@map("menus")
}

// Reseñas de usuarios
model Review {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  rating       Int      // 1-5
  comment      String?
  imageUrl     String?
  
  createdAt    DateTime @default(now())
  
  @@map("reviews")
}

// Restaurantes favoritos del usuario
model Favorite {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime @default(now())
  
  @@unique([userId, restaurantId])
  @@map("favorites")
}
```

---

## 🔑 VARIABLES DE ENTORNO

**backend/.env**
```
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/foodmatch"

# JWT
JWT_SECRET="tu_secret_key_super_segura_aqui"

# API Keys (para después)
OPENAI_API_KEY=""
STRIPE_API_KEY=""

# App
PORT=5000
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

## 📦 DEPENDENCIAS A INSTALAR

**Backend (package.json):**
```json
{
  "name": "foodmatch-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "tsx": "^3.14.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0"
  }
}
```

**Frontend (package.json):**
```json
{
  "name": "foodmatch-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0",
    "react-router-dom": "^6.14.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

---

## 🚀 SETUP ESPECÍFICO - PASO A PASO

### 1. Crear estructura inicial
```bash
# Backend
mkdir -p backend/src/{routes,controllers,models,middleware,services,types}
mkdir -p backend/prisma

# Frontend
mkdir -p frontend/src/{components,pages,hooks,api,styles,types}
mkdir -p frontend/public
```

### 2. Configurar PostgreSQL
```bash
# En tu máquina, asegúrate de tener PostgreSQL corriendo
# Luego crea la base de datos
createdb foodmatch

# O usa Docker:
docker run --name foodmatch-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=foodmatch -p 5432:5432 -d postgres
```

### 3. Inicializar Prisma
```bash
cd backend
npm install
npx prisma init
# Edita .env con tu DATABASE_URL
npx prisma migrate dev --name init
# Esto crea las tablas en la BD
```

### 4. Estructura básica de archivos a crear

**backend/src/server.ts:**
- Express app básica
- Rutas en /api/v1/...
- Middleware de CORS
- Manejo de errores

**backend/src/middleware/auth.ts:**
- Función para verificar JWT
- Función para generar JWT

**frontend/src/App.tsx:**
- Router principal (Home, About, etc - por ahora básico)
- Layout general

**frontend/src/api/client.ts:**
- Cliente Axios configurado
- Funciones para llamadas a backend

---

## ✅ CHECKLIST DE SALIDA (Sprint 0 Terminado)

- [ ] Proyecto React + Node creado y funcionando
- [ ] PostgreSQL corriendo en local
- [ ] Prisma configurado y migración hecha
- [ ] Autenticación JWT lista (backend)
- [ ] Login/Registro básico (frontend)
- [ ] Variables de entorno configuradas
- [ ] Carpetas organizadas como se especifica
- [ ] README.md con instrucciones para instalar y correr
- [ ] Backend en http://localhost:5000
- [ ] Frontend en http://localhost:5173
- [ ] Base de datos con tablas creadas

---

## 📝 NOTAS

- No toques IA aún (Sprint 2)
- No toques pagos aún (Sprint 3)
- Este sprint es solo **setup técnico**
- En Sprint 1 empezamos con funcionalidad de usuario
- Si algo falla aquí, todo lo demás falla - hazlo bien

---

## 🔄 SIGUIENTE PASO

Cuando termines Sprint 0, lee **SPRINT_1_MVP.md** para empezar con la funcionalidad real.
