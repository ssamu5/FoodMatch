# 📚 FOODMATCH - GUÍA DE SPRINTS Y DESARROLLO

Bienvenido a la guía de desarrollo de FoodMatch. Este documento te orienta a través de los 4 sprints principales para construir el MVP.

---

## 🗺️ ROADMAP COMPLETO

```
SPRINT 0: SETUP                  (1-2 semanas)
         ↓
SPRINT 1: MVP BÁSICO             (3-4 semanas)
         ↓
SPRINT 2: DETALLE + IA + REVIEWS (3-4 semanas)
         ↓
SPRINT 3: PEDIDOS + LOGIN        (3-4 semanas)
         ↓
SPRINT 4: PULIDO                 (2-3 semanas)
         ↓
🚀 MVP LISTO PARA PRODUCCIÓN    (Total: 13-18 semanas)
```

Con Claude Code: **Probablemente 10-14 semanas reales**

---

## 📖 CÓMO USAR ESTA GUÍA

### Antes de empezar:
1. Lee **SPRINT_0_SETUP.md** completo
2. Configura tu proyecto
3. Asegúrate de que everything funciona

### Para cada sprint:
1. Lee el archivo correspondiente (SPRINT_1, SPRINT_2, etc)
2. Entiende las funcionalidades antes de codear
3. Sigue las especificaciones **exactamente**
4. Usa Claude Code para acelerar el desarrollo
5. Cuando termines, pasa al siguiente sprint

---

## 📁 ESTRUCTURA DE ARCHIVOS EN ESTA CARPETA

```
FoodMatch_Sprints/
├── INDEX.md                    (este archivo)
├── SPRINT_0_SETUP.md          (configuración inicial)
├── SPRINT_1_MVP.md            (buscador + filtros)
├── SPRINT_2_DETAIL_CHATBOT.md (detalle + IA + reseñas)
├── SPRINT_3_PEDIDOS_LOGIN.md  (autenticación + pedidos)
├── SPRINT_4_POLISH.md         (pulido final)
└── CHECKLISTS.md              (checklists por sprint)
```

---

## 🎯 SPRINT 0: SETUP
**Duración:** 1-2 semanas
**Archivo:** `SPRINT_0_SETUP.md`

### Qué harás:
- Crear proyecto React + Node.js
- Configurar PostgreSQL
- Setup de Prisma ORM
- Estructura de carpetas
- Variables de entorno

### Deliverables:
- Proyecto corriendo en localhost:5173 (frontend) + localhost:5000 (backend)
- Base de datos creada
- Estructura lista para código de usuario

### Cuándo pasar a Sprint 1:
- Backend compila sin errores
- Frontend carga sin errores
- PostgreSQL está corriendo

---

## 🎯 SPRINT 1: MVP BÁSICO
**Duración:** 3-4 semanas
**Archivo:** `SPRINT_1_MVP.md`

### Qué harás:
- Página de inicio con buscador
- Sistema de filtros (6+ tipos)
- Listado de restaurantes
- Geolocalización (opcional)
- Backend con endpoints GET

### Funcionalidades de Usuario:
```
Abre la app
     ↓
Ve un buscador grande
     ↓
Escribe "sushi" o usa filtros
     ↓
Ve lista de restaurantes
     ↓
Click en uno (para Sprint 2)
```

### Deliverables:
- Home page funcional
- Búsqueda en tiempo real
- ~50 restaurantes de ejemplo en BD
- Responsive (móvil + desktop)

### Cuándo pasar a Sprint 2:
- Buscador filtra correctamente
- Lista actualiza al cambiar filtros
- Responsive en móvil

---

## 🎯 SPRINT 2: DETALLE + IA + RESEÑAS
**Duración:** 3-4 semanas
**Archivo:** `SPRINT_2_DETAIL_CHATBOT.md`

### Qué harás:
- Página de detalle de restaurante
- **Chatbot IA conversacional** (lo más complejo)
- Sistema de reseñas
- Sistema de favoritos
- Menú interactivo

### Funcionalidades de Usuario:
```
Hace click en restaurante
     ↓
Ve página completa (fotos, menú, horarios)
     ↓
Ve reseñas de otros usuarios
     ↓
Habla con chatbot: "¿Qué es lo mejor aquí?"
     ↓
Chatbot responde basado en menú/info
```

### Lo más importante aquí:
**El Chatbot IA** - Requiere:
- API Key de OpenAI o Anthropic
- Implementación correcta del contexto
- Testing de respuestas

### Deliverables:
- Página de detalle funcional
- Chatbot respondiendo preguntas
- Reseñas mostrándose
- Botón de favorito

### Cuándo pasar a Sprint 3:
- Chatbot responde correctamente
- Página de detalle carga datos
- Reseñas se muestran

---

## 🎯 SPRINT 3: PEDIDOS + LOGIN
**Duración:** 3-4 semanas
**Archivo:** `SPRINT_3_PEDIDOS_LOGIN.md`

### Qué harás:
- **Autenticación** (Register + Login)
- **Sistema de pedidos** completo
- **Integración WhatsApp/Email** (pedidos llegan a restaurante)
- Historial de pedidos
- Perfil de usuario

### Funcionalidades de Usuario:
```
Se registra/login
     ↓
Ve botón "Hacer pedido"
     ↓
Selecciona platos y cantidad
     ↓
Escribe notas (sin picante, etc)
     ↓
"Hacer pedido" - costo: €X
     ↓
Restaurante recibe por WhatsApp/Email
     ↓
Ve en "Mis Pedidos" con estado
```

### Lo más importante aquí:
**WhatsApp/Email** - El restaurante debe recibir el pedido en su teléfono o correo

### Deliverables:
- Login/Register funcional
- Tokens JWT generando/validando
- Pedidos creándose y guardándose
- Restaurante recibiendo por WhatsApp O Email
- Historial de pedidos visible

### Cuándo pasar a Sprint 4:
- Login funciona
- Pedidos llegan a restaurante
- Historial muestra pedidos

---

## 🎯 SPRINT 4: PULIDO
**Duración:** 2-3 semanas
**Archivo:** `SPRINT_4_POLISH.md`

### Qué harás:
- Optimizar velocidad (caché, lazy loading, etc)
- Mejorar diseño visual (colores, animaciones)
- Fixes de bugs
- Testing básico
- Documentación

### No es funcionalidad nueva, es:
- Hacer la app **más rápida**
- Hacer la app **más bonita**
- Hacer la app **más confiable**

### Deliverables:
- Home carga en < 2 segundos
- Diseño consistente
- Sin errores en consola
- README actualizado
- Tests pasando

### Cuándo está completo:
- MVP listo para usuarios reales
- Puedes hacer deploy
- Documentación clara

---

## 🚀 CÓMO USAR CON CLAUDE CODE

### Mejor práctica:
1. **Lee el sprint completo** (no saltes partes)
2. **Copia el contenido del sprint** a Claude Code
3. **Dale instrucciones claras:**
```
Aquí está la especificación del Sprint 1. Implementa:
- Home page en React
- Buscador funcional
- Filtros
- Listado de restaurantes
- Endpoints backend para GET /restaurants, /search, /filter

Especificación completa:
[PEGA TODO EL CONTENIDO DEL SPRINT]
```

4. **Claude Code generará el código**
5. **Revisa, ajusta, prueba**

---

## 🔑 COSAS CRÍTICAS A RECORDAR

### Seguridad:
- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de inputs
- ✅ CORS configurado correctamente

### Base de Datos:
- ✅ Índices en campos que filtras
- ✅ Migraciones claras
- ✅ Seeds con datos de ejemplo
- ✅ Relaciones bien definidas

### Frontend:
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Lazy loading de imágenes

### Backend:
- ✅ Rate limiting en endpoints públicos
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Logs para debug

---

## 📊 TRACKING DE PROGRESO

Marca los sprints completados:

- [ ] Sprint 0: Setup
- [ ] Sprint 1: MVP Básico
- [ ] Sprint 2: Detalle + IA + Reseñas
- [ ] Sprint 3: Pedidos + Login
- [ ] Sprint 4: Pulido

---

## 🆘 SI ALGO FALLA

### El backend no compila:
1. Revisa los tipos TypeScript
2. Asegúrate que las dependencias están instaladas
3. Revisa los imports

### La base de datos no conecta:
1. ¿PostgreSQL está corriendo?
2. ¿DATABASE_URL es correcto?
3. Prueba: `psql postgresql://user:password@localhost:5432/foodmatch`

### El frontend no se ve bien:
1. Limpia la caché del navegador
2. Verifica que Tailwind CSS se compiló
3. Abre la consola del navegador, ¿hay errores?

### El chatbot no responde:
1. ¿Tengo API KEY de OpenAI/Anthropic?
2. ¿La key está en .env?
3. ¿He gastado el crédito gratis de OpenAI?

### El pedido no llega al restaurante:
1. ¿Tengo Twilio configurado para WhatsApp?
2. ¿El número del restaurante es válido?
3. ¿El email está correcto?

---

## 💡 CONSEJOS PARA ACELERAR

1. **Copia y pega del código de ejemplo** - No escribas desde cero
2. **Usa componentes reutilizables** - Loading, Error, Toast
3. **Testing en vivo** - No esperes a terminar todo
4. **Commit frecuente** - Git commit cada funcionalidad
5. **Usa Claude Code** - Es para esto

---

## 🎓 ESTRUCTURA TÍPICA DE UN SPRINT

1. **Leer la especificación** (30 min)
2. **Implementar backend** (1-2 días)
3. **Implementar frontend** (1-2 días)
4. **Testing y fixes** (0.5-1 día)
5. **Pasar al siguiente sprint**

Con Claude Code: Potencialmente **2-3 días por sprint**.

---

## 🎉 DESPUÉS DEL MVP

Una vez completes los 4 sprints:

### Inmediato:
- Deploy a producción
- Buscar primeros usuarios reales
- Recolectar feedback

### Próximas fases (no incluidas aquí):
- Integración real con restaurantes (panel de admin)
- Pagos reales con Stripe
- Notificaciones push
- App nativa (React Native)
- Expansion a otras ciudades

---

## 📞 PREGUNTAS FRECUENTES

**¿Cuánto tiempo total?**
- Con Claude Code: 10-14 semanas
- Sin Claude Code: 6-12 meses

**¿Necesito un diseñador?**
- No para MVP, las especificaciones son suficientes
- Después del MVP: considera contratar diseñador

**¿Necesito ser expertp en React/Node?**
- No, Claude Code puede ayudarte a aprender
- Leer los archivos te enseñará mucho

**¿Puedo ir más rápido?**
- Sí, si eres muy bueno con Claude Code
- Potencialmente 8-10 semanas

**¿Qué pasa si algo falla?**
- Vuelve al sprint anterior
- Revisa la especificación
- Pide ayuda a Claude

---

## 📚 RECURSOS ÚTILES

- **React Docs:** https://react.dev
- **Node.js Docs:** https://nodejs.org/en/docs/
- **Prisma Docs:** https://www.prisma.io/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Express.js:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/

---

**¡Buena suerte! Ahora a codear. 🚀**
