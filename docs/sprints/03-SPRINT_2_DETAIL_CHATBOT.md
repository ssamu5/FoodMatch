# SPRINT 2: DETALLE + CHATBOT IA + RESEÑAS
**Duración:** 3-4 semanas
**Objetivo:** Usuario puede ver detalle completo de restaurante, interactuar con chatbot, ver reseñas.

---

## 📋 RESUMEN

Lo que el usuario puede hacer:
1. Hacer click en un restaurante
2. Ver página completa: fotos, menú, horarios, ubicación
3. Ver reseñas de otros usuarios
4. Hablar con chatbot IA para preguntas
5. Guardar como favorito
6. Ver número de teléfono para llamar

---

## 🎯 FUNCIONALIDADES ESPECÍFICAS

### PARTE 1: PÁGINA DE DETALLE DEL RESTAURANTE

**URL:** `/restaurant/:id`

#### Componentes Frontend:

**1. RestaurantDetail.tsx (Página principal)**
```
┌──────────────────────────────────────┐
│ [Logo] FoodMatch        [< Volver]   │
├──────────────────────────────────────┤
│ [Foto grande del restaurante]        │
├──────────────────────────────────────┤
│ Sushi Master                    ⭐⭐⭐ │
│ €€ • Sushi • Buffet                  │
│ Calle San Vicente Mártir, 45         │
│                                      │
│ [Teléfono] [Ubicación] [Favorito]    │
├──────────────────────────────────────┤
│ HORARIOS                             │
│ Hoy: 12:00 - 23:00 (abierto)        │
│ Lunes - Domingo                      │
│                                      │
│ MENÚ                                 │
│ [Sushi Variado €15]                  │
│ [Rollos California €12]              │
│ ...                                  │
│                                      │
│ RESEÑAS (últimas 5)                  │
│ [Usuario] ⭐⭐⭐⭐ "Muy bueno"     │
│ ...                                  │
│                                      │
│ CHATBOT IA                           │
│ ┌──────────────────────────────────┐ │
│ │ Hola, soy el asistente...       │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ [Escribe tu pregunta...]         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ PEDIR / RESERVAR                     │
│ [Botón grande] LLAMAR AL RESTAURANTE │
│                                      │
└──────────────────────────────────────┘
```

**2. RestaurantGallery.tsx**
- Foto principal grande
- Galería de fotos (scroll horizontal)
- Si no hay fotos: mostrar placeholder genérico

**3. RestaurantInfo.tsx**
- Nombre, rating, tipo
- Dirección
- Teléfono (clickeable para llamar)
- Ubicación (icono con link a Google Maps)
- Botón favorito (corazón)

**4. MenuSection.tsx**
- Lista de platos
- Cada plato: nombre, descripción, precio
- Foto si existe
- Categorizado por tipo (Sushi, Rollos, Postres, etc)

**5. ReviewsSection.tsx**
- Últimas 5 reseñas
- Cada reseña: avatar usuario, nombre, puntuación (⭐), comentario, fecha
- Foto de la reseña si existe
- Botón "Ver todas las reseñas"
- Botón "Escribe una reseña" (para usuarios logueados)

**6. ChatbotWidget.tsx** ← IMPORTANTE
- Chat box sticky en la página
- Usuario escribe preguntas: "¿Cuál es tu mejor sushi?", "¿Tienes comida sin gluten?", etc
- El chatbot responde en tiempo real
- Historial de conversación

---

### PARTE 2: CHATBOT IA CONVERSACIONAL

#### Cómo funciona:

**El usuario pregunta algo →**
```
"¿Cuál es vuestro mejor plato de sushi?"
"¿Puedo pedir para llevar?"
"¿A qué hora cierran?"
"¿Tenéis opciones sin gluten?"
```

**El chatbot procesa la pregunta y responde basándose en:**
1. Datos del restaurante (horarios, menú, etc)
2. Contexto de reseñas
3. Información que tú proporciones

#### Backend - Chatbot Endpoint:

**POST `/api/v1/restaurants/:id/chat`**
```json
Request:
{
  "message": "¿Cuál es vuestro mejor plato?",
  "conversationHistory": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "Hola, soy el asistente de Sushi Master..." }
  ]
}

Response:
{
  "success": true,
  "reply": "Nuestro mejor plato es el Sushi Variado (€15). Incluye una selección de 20 piezas de nuestros mejores cortes de salmón, atún y otros pescados frescos.",
  "sources": ["menu", "description"]
}
```

#### Implementación Chatbot:

**backend/src/services/chatbot.service.ts:**

```typescript
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function chatWithRestaurant(
  restaurantId: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  restaurantData: any // nombre, menú, horarios, etc
): Promise<string> {
  
  const systemPrompt = `Eres un asistente inteligente de un restaurante llamado "${restaurantData.name}".
  
  Información del restaurante:
  - Tipo de comida: ${restaurantData.cuisine}
  - Horarios: ${restaurantData.openingTime} - ${restaurantData.closingTime}
  - Dirección: ${restaurantData.address}
  - Teléfono: ${restaurantData.phone}
  - Formato: ${restaurantData.format}
  
  Menú:
  ${restaurantData.menu.map(item => `- ${item.name}: €${item.price} (${item.category})`).join('\n')}
  
  Debes responder preguntas del usuario sobre el restaurante de manera amable y profesional.
  Si no sabes la respuesta, sugiere que llame al restaurante.
  Sé conciso, máximo 2-3 líneas.`;

  const messages = [
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022", // O el modelo que tengas
    max_tokens: 150,
    system: systemPrompt,
    messages: messages as any
  });

  const assistantMessage = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  return assistantMessage;
}
```

**backend/src/routes/restaurants.routes.ts (añadir):**

```typescript
import { chatWithRestaurant } from '../services/chatbot.service';
import { getRestaurantById } from '../controllers/restaurants.controller';

router.post('/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, conversationHistory } = req.body;

    // Obtener datos completos del restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { menu: true }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurante no encontrado' });
    }

    // Llamar al chatbot
    const reply = await chatWithRestaurant(
      id,
      message,
      conversationHistory,
      restaurant
    );

    res.json({
      success: true,
      reply: reply
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al procesar la pregunta' });
  }
});
```

**frontend/src/components/ChatbotWidget.tsx:**

```typescript
import { useState } from 'react';
import axios from 'axios';

export default function ChatbotWidget({ restaurantId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola 👋 Soy el asistente de este restaurante. ¿En qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Añadir mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/restaurants/${restaurantId}/chat`,
        {
          message: input,
          conversationHistory: messages
        }
      );

      // Añadir respuesta del asistente
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Disculpa, no pude procesar tu pregunta. Intenta llamar al restaurante directamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-[#D17A5A] text-white p-4 rounded-t-lg">
        <h3 className="font-bold">Asistente del restaurante</h3>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-[#D17A5A] text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-400 text-sm">Escribiendo...</div>}
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu pregunta..."
          className="flex-1 border rounded px-3 py-2 text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-[#D17A5A] text-white px-3 py-2 rounded hover:bg-[#c46a4a] disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
}
```

---

### PARTE 3: SISTEMA DE RESEÑAS

#### Backend - Endpoints:

**GET `/api/v1/restaurants/:id/reviews`**
```json
Response:
{
  "success": true,
  "reviews": [
    {
      "id": "review123",
      "userId": "user456",
      "userName": "Juan García",
      "rating": 5,
      "comment": "Excelente sushi, muy fresco. El buffet tiene mucha variedad.",
      "imageUrl": "...",
      "createdAt": "2024-01-15"
    }
  ],
  "averageRating": 4.7,
  "totalReviews": 42
}
```

**POST `/api/v1/restaurants/:id/reviews`** (Requiere autenticación)
```json
Request:
{
  "rating": 4,
  "comment": "Muy bueno, pero tardan un poco",
  "imageUrl": "..."  // opcional
}

Response:
{
  "success": true,
  "review": { /* review object */ }
}
```

#### Frontend - Form de reseña:

**ReviewForm.tsx**
```typescript
import { useState } from 'react';
import axios from 'axios';

export default function ReviewForm({ restaurantId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/restaurants/${restaurantId}/reviews`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Resetear form
      setRating(5);
      setComment('');
      onReviewSubmitted();
      alert('Reseña enviada con éxito');
    } catch (error) {
      alert('Error al enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-bold mb-4">Escribe tu reseña</h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Puntuación:</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Comentario */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Tu opinión:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="Cuéntanos tu experiencia..."
          className="w-full border rounded px-3 py-2 text-sm h-24 resize-none"
        />
        <div className="text-xs text-gray-400 mt-1">{comment.length}/500</div>
      </div>

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#D17A5A] text-white px-4 py-2 rounded hover:bg-[#c46a4a] disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </div>
  );
}
```

---

### PARTE 4: SISTEMA DE FAVORITOS

**Backend:**

```typescript
// POST /api/v1/restaurants/:id/favorite (añadir a favoritos)
// DELETE /api/v1/restaurants/:id/favorite (quitar de favoritos)
// GET /api/v1/me/favorites (obtener mis favoritos - requiere auth)
```

**Frontend:**

```typescript
export function FavoriteButton({ restaurantId }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/v1/restaurants/${restaurantId}/favorite`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/restaurants/${restaurantId}/favorite`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      alert('Error al guardar favorito');
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`text-2xl ${isFavorite ? 'text-red-500' : 'text-gray-300'}`}
    >
      ❤️
    </button>
  );
}
```

---

## 🗄️ CAMBIOS EN BASE DE DATOS

**Prisma Schema (añadir a schema.prisma):**

```prisma
// Actualizar Restaurant para incluir menú
model Restaurant {
  // ... campos anteriores ...
  menu        Menu[]      // Relación
  reviews     Review[]    // Relación
  favorites   Favorite[]  // Relación
}

// Menu ya existe

// Review actualizado
model Review {
  id           String   @id @default(cuid())
  userId       String?  // NULL si es anónimo
  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  rating       Int      // 1-5
  comment      String   // Hasta 500 caracteres
  imageUrl     String?
  
  createdAt    DateTime @default(now())
  
  @@map("reviews")
}

// Favorite ya existe
```

---

## ✅ CHECKLIST DE SALIDA (Sprint 2 Terminado)

**Página de Detalle:**
- [ ] Cargar página con todos los datos del restaurante
- [ ] Mostrar fotos
- [ ] Mostrar menú con categorías
- [ ] Mostrar horarios
- [ ] Botón para llamar (tel:)
- [ ] Botón para ubicación (Google Maps)
- [ ] Botón favorito funcionando

**Chatbot IA:**
- [ ] Widget chatbot visible en página
- [ ] Usuario puede escribir preguntas
- [ ] Chatbot responde basado en info del restaurante
- [ ] Historial de conversación visible
- [ ] Funciona sin errors

**Reseñas:**
- [ ] Mostrar últimas reseñas
- [ ] Calcular rating promedio
- [ ] Form para escribir reseña (solo usuarios logueados)
- [ ] Nuevas reseñas aparecen inmediatamente
- [ ] Mostrar fecha de reseña

**Frontend:**
- [ ] Página es responsive
- [ ] Loading states
- [ ] Error handling
- [ ] Navegación fluida

---

## 📝 NOTAS IMPORTANTES

1. **API Key de Claude/OpenAI:**
   - Necesitas obtenerla: https://platform.openai.com o https://console.anthropic.com
   - Guardarla en `.env` como `ANTHROPIC_API_KEY` o `OPENAI_API_KEY`
   - NO compartirla nunca

2. **Rate limiting:**
   - El chatbot usa API externa = cuesta dinero
   - Limita a máximo 1 mensaje por segundo
   - Considera límite de mensajes por usuario

3. **Datos de menús:**
   - Por ahora datos hardcodeados en BD
   - Sprint 3: los restaurantes suben sus propios menús

---

## 🔄 SIGUIENTE PASO

Cuando termines Sprint 2, lee **SPRINT_3_INTEGRATION.md** para integrar:
- WhatsApp/Email para pedidos
- Login/Registro completo
- Pagos con Stripe
