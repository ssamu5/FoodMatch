# 🚀 Getting Started - Guía Paso a Paso

Esta guía te ayudará a configurar FoodMatch en tu máquina y empezar a desarrollar.

---

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

### Obligatorio
- **Node.js 16+** - [Descargar](https://nodejs.org)
  - Verifica: `node --version` y `npm --version`
- **PostgreSQL 12+** - [Descargar](https://www.postgresql.org/download)
  - Verifica: `psql --version`
- **Git** - [Descargar](https://git-scm.com)
  - Verifica: `git --version`

### Recomendado
- **VS Code** - [Descargar](https://code.visualstudio.com)
- **Postman o Thunder Client** - Para testear API (VS Code)
- **pgAdmin o DBeaver** - Para gestionar PostgreSQL

---

## 🔧 Configuración Inicial

### 1. Preparar la Base de Datos

**Opción A: PostgreSQL Local**

```bash
# Windows
# 1. Abre pgAdmin (viene con PostgreSQL)
# 2. Crea nueva base de datos "foodmatch"
# 3. Ten a mano: usuario, password, puerto (default 5432)

# macOS/Linux
createdb foodmatch
```

**Opción B: Docker (Más fácil)**

```bash
docker run --name foodmatch-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=foodmatch \
  -p 5432:5432 \
  -d postgres:15
```

Verifica que PostgreSQL está corriendo:
```bash
psql postgresql://postgres:password@localhost:5432/foodmatch
```

### 2. Clonar/Descargar el Proyecto

```bash
git clone <repo-url> foodmatch
cd foodmatch
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus valores:
# DATABASE_URL="postgresql://user:password@localhost:5432/foodmatch"
# JWT_SECRET="tu-secret-super-seguro-aqui"

# Crear tablas en BD
npx prisma migrate dev --name init

# Generar Prisma client
npx prisma generate

# Iniciar servidor
npm run dev
```

**Resultado esperado:** Backend corriendo en `http://localhost:5000`

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# El .env ya tiene VITE_API_URL=http://localhost:5000

# Iniciar dev server
npm run dev
```

**Resultado esperado:** Frontend corriendo en `http://localhost:5173`

---

## ✅ Verificar que Todo Funciona

1. **Backend**
   ```bash
   # En terminal del backend, deberías ver:
   # Server running on port 5000
   # Database connected
   
   # Abre en navegador:
   # http://localhost:5000/api/v1/restaurants
   # Deberías ver un JSON (vacío o con datos de ejemplo)
   ```

2. **Frontend**
   ```bash
   # Abre en navegador:
   # http://localhost:5173
   # Deberías ver la página de inicio
   ```

3. **Base de Datos**
   ```bash
   # En Prisma Studio:
   npx prisma studio
   # Abre http://localhost:5555
   # Deberías ver las tablas (vacías al inicio)
   ```

---

## 🎯 Estructura del Proyecto

```
FoodMatch/
├── docs/                          # Documentación
│   ├── sprints/                   # Sprints (guías de implementación)
│   ├── guides/                    # Guías adicionales
│   └── checklists/                # Checklists para trackear progreso
│
├── backend/                       # API Node.js + Express
│   ├── src/
│   │   ├── server.ts              # Entrada de la app
│   │   ├── routes/                # Rutas API
│   │   ├── controllers/           # Lógica de negocios
│   │   ├── services/              # Servicios (auth, chatbot, etc)
│   │   ├── middleware/            # Middleware (auth, validation)
│   │   └── types/                 # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma          # Definición de BD
│   │   └── seed.ts                # Datos iniciales
│   ├── .env                       # Variables de entorno
│   └── package.json
│
├── frontend/                      # App React + Vite
│   ├── src/
│   │   ├── App.tsx                # Componente raíz
│   │   ├── pages/                 # Páginas principales
│   │   ├── components/            # Componentes reutilizables
│   │   ├── hooks/                 # Custom hooks
│   │   ├── api/                   # Llamadas a backend
│   │   ├── context/               # React Context
│   │   ├── styles/                # Estilos globales
│   │   └── types/                 # TypeScript types
│   ├── .env                       # Variables de entorno
│   └── package.json
│
├── README.md                      # Este documento
├── ROADMAP.md                     # Visión general del proyecto
└── .gitignore
```

---

## 📖 Flujo de Desarrollo

### Para cada Sprint:

1. **Lee la guía del sprint**
   ```
   docs/sprints/0X-SPRINT_NAME.md
   ```

2. **Sigue el checklist**
   ```
   docs/checklists/SPRINT_CHECKLISTS.md
   ```

3. **Implementa paso a paso**
   - Backend primero (endpoints)
   - Frontend después (UI)
   - Testing manual

4. **Verifica todo funciona**
   - Sin errores en consola
   - Backend responde correctamente
   - Frontend muestra datos

5. **Commit a git**
   ```bash
   git add .
   git commit -m "feat: Sprint X - Descripción"
   ```

---

## 🔑 Variables de Entorno

### backend/.env

```env
# Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/foodmatch"

# JWT para autenticación
JWT_SECRET="your-super-secret-key-here-change-in-production"

# API Keys (para después)
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""

# Email (Gmail con App Passwords)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-app-password" # NO tu contraseña real

# WhatsApp (Twilio - opcional)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"

# App Config
PORT=5000
NODE_ENV=development
```

### frontend/.env

```env
# URL de backend
VITE_API_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### "Error: connect ECONNREFUSED"
**Significado:** No puede conectar a PostgreSQL

**Solución:**
```bash
# Verifica que PostgreSQL está corriendo
psql postgresql://localhost:5432

# Si no funciona, inicia PostgreSQL:
# Windows: Services > PostgreSQL > Start
# macOS: brew services start postgresql
# Linux: sudo service postgresql start
```

### "Error: EADDRINUSE: address already in use :::5000"
**Significado:** Puerto 5000 ya está en uso

**Solución:**
```bash
# Encuentra qué está usando el puerto
lsof -i :5000

# Mata el proceso (macOS/Linux)
kill -9 <PID>

# O usa otro puerto en backend/.env
PORT=5001
```

### "Error: Prisma client not found"
**Significado:** Prisma client no está generado

**Solución:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### "Error: Cannot find module 'react'"
**Significado:** Dependencias no están instaladas

**Solución:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### Base de datos vacía (sin restaurantes)
**Significado:** Necesitas ejecutar el seed

**Solución:**
```bash
cd backend
npx prisma db seed
# O crea manualmente en Prisma Studio (http://localhost:5555)
```

### "Error: Environmental variable 'DATABASE_URL' is not set"
**Significado:** El archivo .env no está correctamente configurado

**Solución:**
```bash
# En backend/
cat .env.example  # Ver ejemplo
nano .env         # Editar y llenar con tus valores
```

---

## 💡 Tips Útiles

### Borrar todo y empezar de cero

```bash
# Backend
cd backend
rm -rf node_modules prisma/migrations
npm install
npx prisma migrate dev --name init
npx prisma db seed

# Frontend
cd ../frontend
rm -rf node_modules
npm install
```

### Ver logs detallados

```bash
# Backend con debug
DEBUG=* npm run dev

# Frontend (abre consola del navegador F12)
```

### Testear endpoints API rápidamente

```bash
# Usar curl (terminal)
curl http://localhost:5000/api/v1/restaurants

# Mejor: Instalar Thunder Client en VS Code
# Extensions > Thunder Client > Install
# Luego crea requests igual que en Postman
```

### Reiniciar completamente

```bash
# Detener servidores (Ctrl+C en ambas terminales)

# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev

# Terminal 3 (opcional, para ver BD)
cd backend
npx prisma studio
```

---

## 🎓 Próximos Pasos

Una vez todo funcione:

1. **Lee el Sprint 0 completo**: `docs/sprints/01-SPRINT_0_SETUP.md`
2. **Entiende la arquitectura**: `docs/guides/ARCHITECTURE.md`
3. **Empieza Sprint 1**: `docs/sprints/02-SPRINT_1_MVP.md`

---

## 🆘 ¿Aún tienes problemas?

1. Verifica que instalaste todo del "Prerrequisitos"
2. Lee el archivo del sprint que estés haciendo
3. Revisa el checklist correspondiente
4. Consulta la sección de Troubleshooting arriba

---

**¿Ya funciona todo? ¡Genial! Ahora lee [docs/guides/ARCHITECTURE.md](./ARCHITECTURE.md) para entender cómo está estructurado el proyecto.** 🚀
