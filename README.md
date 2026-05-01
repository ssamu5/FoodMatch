# 🍽️ FoodMatch

**Descubre tu restaurante perfecto en segundos** 

Una aplicación web moderna que te permite buscar, explorar y hacer pedidos en restaurantes locales con un asistente IA conversacional.

---

## ✨ Características Principales

- 🔍 **Búsqueda Inteligente** - Busca por nombre, tipo de comida, zona y precio
- 🗺️ **Geolocalización** - Encuentra restaurantes cercanos a ti
- 💬 **Chatbot IA** - Asistente conversacional para preguntas sobre menús y horarios
- ⭐ **Reseñas de Usuarios** - Lee opiniones reales de otros usuarios
- ❤️ **Favoritos** - Guarda tus restaurantes preferidos
- 📦 **Pedidos** - Haz pedidos directo desde la app (el restaurante recibe por WhatsApp/Email)
- 👤 **Autenticación** - Registrate, inicia sesión y mantén tu historial de pedidos

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js 16+
- PostgreSQL 12+
- Git

### Instalación

```bash
# 1. Clonar/descargar el proyecto
git clone <repo-url>
cd foodmatch

# 2. Instalar backend
cd backend
npm install
npx prisma migrate dev --name init

# 3. En otra terminal, instalar frontend
cd ../frontend
npm install

# 4. Variables de entorno
# Ver backend/.env.example y frontend/.env.example
```

### Correr localmente

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL
npm run dev
# El servidor estará en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# La app estará en http://localhost:5173
```

---

## 📊 Estructura del Proyecto

```
foodmatch/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── routes/      # Rutas de API
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── middleware/  # Auth, validación
│   │   ├── services/    # Servicios (email, IA, etc)
│   │   └── server.ts    # Entrada principal
│   ├── prisma/
│   │   └── schema.prisma # Definición de BD
│   └── package.json
│
├── frontend/            # App React + TypeScript
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── pages/      # Páginas principales
│   │   ├── api/        # Cliente HTTP
│   │   ├── types/      # TypeScript types
│   │   └── App.tsx     # Componente principal
│   └── package.json
│
└── docs/               # Documentación y sprints
```

---

## 🔧 Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (compilador rápido)
- Tailwind CSS (estilos)
- Axios (HTTP client)
- React Router (navegación)

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM (base de datos)
- JWT (autenticación)
- bcrypt (hash de contraseñas)

**Base de Datos:**
- PostgreSQL

**Terceros (en sprints posteriores):**
- OpenAI/Anthropic (IA chatbot)
- Stripe (pagos)

---

## 🗂️ Sprints

- **Sprint 0:** Setup inicial (EN PROGRESO)
- **Sprint 1:** Búsqueda de restaurantes + login
- **Sprint 2:** Chatbot IA
- **Sprint 3:** Sistema de pedidos + Stripe
- **Sprint 4:** Pulido y optimizaciones
- **Sprint 5:** Panel de restaurantes

Ver documentación en `docs/sprints/`

---

## 📝 Configuración de Base de Datos

### Opción 1: PostgreSQL local (recomendado para desarrollo)

```bash
# Instala PostgreSQL si no lo tienes
# https://www.postgresql.org/download/

# Crea la base de datos
createdb foodmatch

# Luego en el backend:
cd backend
npm install
npx prisma migrate dev --name init
```

### Opción 2: Docker

```bash
docker run --name foodmatch-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=foodmatch \
  -p 5432:5432 \
  -d postgres

# DATABASE_URL="postgresql://postgres:password@localhost:5432/foodmatch"
```

---

## 🔐 Variables de Entorno

### Backend (.env)
```
DATABASE_URL="postgresql://user:pass@localhost:5432/foodmatch"
JWT_SECRET="tu_secret_key_super_segura"
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testing

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Verifica en el navegador: http://localhost:5173
```

---

## 📚 Documentación

- [ROADMAP.md](./ROADMAP.md) - Visión completa del proyecto
- [docs/sprints/](./docs/sprints/) - Detalles de cada sprint
- [docs/guides/](./docs/guides/) - Guías técnicas
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Estado actual

---

## 🤝 Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Escucha en http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Abre http://localhost:5173
```

---

## 📚 Documentación Completa

### Para Empezar
- [Getting Started Guide](./docs/guides/GETTING_STARTED.md) - Guía paso a paso
- [Architecture](./docs/guides/ARCHITECTURE.md) - Arquitectura del proyecto

### Desarrollo por Sprints
- [Sprint 0 - Setup](./docs/sprints/01-SPRINT_0_SETUP.md) - Configuración inicial
- [Sprint 1 - MVP Básico](./docs/sprints/02-SPRINT_1_MVP.md) - Buscador + Filtros
- [Sprint 2 - Detalle + IA](./docs/sprints/03-SPRINT_2_DETAIL_CHATBOT.md) - Página detalle + Chatbot
- [Sprint 3 - Pedidos + Login](./docs/sprints/04-SPRINT_3_PEDIDOS_LOGIN.md) - Autenticación + Pedidos
- [Sprint 4 - Pulido](./docs/sprints/05-SPRINT_4_POLISH.md) - Optimización y mejoras

### Útil
- [Roadmap Completo](./ROADMAP.md) - Visión general
- [API Spec](./docs/guides/API_SPEC.md) - Especificación de endpoints
- [Checklists](./docs/checklists/SPRINT_CHECKLISTS.md) - Checklists por sprint

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **Vite** - Build tool rápido
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Server
- **TypeScript** - Type safety
- **Prisma ORM** - Database
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación

### Terceros (Integrados en Sprint 2-3)
- **OpenAI/Anthropic API** - Chatbot IA
- **Twilio** - WhatsApp para pedidos
- **Nodemailer** - Email fallback

---

## 📋 Estado Actual

### Sprint 0: Setup ✅
- [x] Proyecto creado
- [x] Documentación completa
- [x] Estructura definida
- [ ] Código implementado (pendiente)

### Sprint 1-4: En Progreso ⏳
Ver [Checklists](./docs/checklists/SPRINT_CHECKLISTS.md) para detalles

---

## 🤝 Contribuir

1. Lee la [Architecture](./docs/guides/ARCHITECTURE.md)
2. Sigue el sprint correspondiente
3. Crea commits claros
4. Abre un PR

---

## 📞 Soporte

Si tienes dudas:
1. Revisa la documentación del sprint actual
2. Busca en la sección de [Troubleshooting](./docs/guides/GETTING_STARTED.md#troubleshooting)
3. Abre un issue

---

## 📄 Licencia

MIT

---

## 🎯 Roadmap

**Versión 1.0 (MVP)** - 13-18 semanas
- Buscador funcional
- Chatbot IA
- Sistema de pedidos
- Autenticación

**Versión 2.0 (Post-MVP)**
- Panel de admin para restaurantes
- Pagos con Stripe
- Notificaciones push
- App móvil nativa

---

**¡Listo para empezar? Abre [docs/sprints/01-SPRINT_0_SETUP.md](./docs/sprints/01-SPRINT_0_SETUP.md)** 🚀
