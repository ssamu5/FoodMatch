# SPRINT 5: RESTAURANT ADMIN PANEL
**Duración:** 3-4 semanas
**Objetivo:** Restaurantes pueden gestionar su perfil, menú, pedidos y responder a clientes.

---

## 📋 RESUMEN

Lo que restaurante puede hacer:
1. Crear cuenta de restaurante
2. Editar perfil (nombre, foto, horarios, ubicación)
3. Gestionar menú (crear, editar, eliminar platos)
4. Ver pedidos recibidos
5. Cambiar estado de pedido (confirmado, preparando, listo)
6. Responder mensajes del chatbot
7. Ver estadísticas básicas

---

## 🎯 FUNCIONALIDADES ESPECÍFICAS

### PARTE 1: AUTHENTICATION RESTAURANTE

**Backend - Endpoints:**

```typescript
POST /api/v1/restaurants/auth/register
{
  "email": "sushi@master.com",
  "password": "secure123",
  "restaurantName": "Sushi Master",
  "phone": "+34 963 223344"
}

POST /api/v1/restaurants/auth/login
{
  "email": "sushi@master.com",
  "password": "secure123"
}
// Response: JWT token + restaurantId

GET /api/v1/restaurants/auth/me
// Response: Datos del restaurante autenticado
```

### PARTE 2: GESTIÓN DE PERFIL

**Backend - Endpoints:**

```typescript
GET /api/v1/restaurants/me
// Obtiene perfil completo

PUT /api/v1/restaurants/me
{
  "name": "Sushi Master",
  "description": "Los mejores sushi de Valencia",
  "phone": "+34 963 223344",
  "email": "info@sushi.com",
  "website": "www.sushi.com",
  "openingTime": "12:00",
  "closingTime": "23:00",
  "closedDays": "Lunes",
  "imageUrl": "[nueva foto]"
}
```

**Frontend - RestaurantProfile.tsx:**

```typescript
export default function RestaurantProfile() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get('/api/v1/restaurants/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
      });
      setRestaurant(response.data.restaurant);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (formData: any) => {
    try {
      await axios.put('/api/v1/restaurants/me', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
      });
      setRestaurant(formData);
      setEditing(false);
      alert('Perfil actualizado');
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{restaurant?.name}</h1>
      
      {!editing ? (
        <div>
          <p className="text-gray-600 mb-4">{restaurant?.description}</p>
          <p className="mb-2">📞 {restaurant?.phone}</p>
          <p className="mb-2">🕐 {restaurant?.openingTime} - {restaurant?.closingTime}</p>
          
          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Editar Perfil
          </button>
        </div>
      ) : (
        <RestaurantEditForm initialData={restaurant} onSave={handleUpdate} />
      )}
    </div>
  );
}
```

---

### PARTE 3: GESTIÓN DE MENÚ

**Backend - Endpoints:**

```typescript
GET /api/v1/restaurants/me/menu
// Obtiene todo el menú del restaurante

POST /api/v1/restaurants/me/menu
{
  "name": "Sushi Variado",
  "description": "20 piezas de nuestro sushi premium",
  "price": 18.50,
  "category": "Sushi",
  "imageUrl": "[URL foto plato]"
}

PUT /api/v1/restaurants/me/menu/:menuId
{
  "name": "Sushi Variado Premium",
  "price": 19.50
}

DELETE /api/v1/restaurants/me/menu/:menuId
```

**Frontend - MenuManager.tsx:**

```typescript
export default function MenuManager() {
  const [menu, setMenu] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      const response = await axios.get('/api/v1/restaurants/me/menu', {
        headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
      });
      setMenu(response.data.menu);
    };
    fetchMenu();
  }, []);

  const handleAddDish = async (dish: any) => {
    await axios.post('/api/v1/restaurants/me/menu', dish, {
      headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
    });
    setMenu([...menu, dish]);
    setShowForm(false);
  };

  const handleDeleteDish = async (menuId: string) => {
    await axios.delete(`/api/v1/restaurants/me/menu/${menuId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
    });
    setMenu(menu.filter(m => m.id !== menuId));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestionar Menú</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        + Agregar Plato
      </button>

      {showForm && <DishForm onSave={handleAddDish} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu.map(dish => (
          <div key={dish.id} className="border rounded-lg p-4">
            <h3 className="font-bold">{dish.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{dish.description}</p>
            <p className="text-lg font-bold mb-3">€{dish.price.toFixed(2)}</p>
            <p className="text-xs bg-gray-200 inline-block px-2 py-1 rounded mb-3">
              {dish.category}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {/* edit logic */}}
                className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteDish(dish.id)}
                className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### PARTE 4: GESTIÓN DE PEDIDOS

**Backend - Endpoints:**

```typescript
GET /api/v1/restaurants/me/orders
// Obtiene todos los pedidos de este restaurante

GET /api/v1/restaurants/me/orders/:orderId
// Detalle de un pedido específico

PUT /api/v1/restaurants/me/orders/:orderId/status
{
  "status": "preparing" // o "ready", "delivered"
}

POST /api/v1/restaurants/me/orders/:orderId/respond
{
  "message": "Listo en 20 minutos!"
}
```

**Frontend - OrdersDashboard.tsx:**

```typescript
export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await axios.get('/api/v1/restaurants/me/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
      });
      setOrders(response.data.orders);
    };

    fetchOrders();
    // Poll cada 5 segundos para nuevos pedidos
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await axios.put(
      `/api/v1/restaurants/me/orders/${orderId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` } }
    );

    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));

    // Notificar al cliente por chat
    // (Implementado en parte 5)
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'delivered': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pedidos Recibidos</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos aún</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 hover:shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold">Pedido #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-3 bg-gray-50 p-3 rounded">
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-sm">📞 {order.customerPhone}</p>
                <p className="text-sm">📧 {order.customerEmail}</p>
                {order.notes && <p className="text-sm mt-2 italic">📝 Notas: {order.notes}</p>}
              </div>

              <div className="mb-3">
                <h4 className="font-semibold mb-2">Platos:</h4>
                <ul className="text-sm space-y-1">
                  {order.items.map((item: any) => (
                    <li key={item.id}>
                      • {item.menuName} x{item.quantity} = €{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-3 mb-3">
                <p className="font-bold text-lg">Total: €{order.totalPrice.toFixed(2)}</p>
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'confirmed')}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                  >
                    ✓ Confirmar
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                    className="flex-1 bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
                  >
                    🍳 En preparación
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'ready')}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                  >
                    ✓ Listo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### PARTE 5: RESPONDER EN CHAT

Cuando cliente hace pregunta al chatbot, restaurante puede responder directamente.

**Backend - Endpoint:**

```typescript
POST /api/v1/restaurants/me/orders/:orderId/chat
{
  "message": "Listo en 15 minutos! 🍱"
}
// Esto notifica al cliente automáticamente
```

**Frontend - ChatResponses.tsx:**

```typescript
export function ChatResponses({ orderId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const handleSendResponse = async () => {
    if (!input.trim()) return;

    await axios.post(
      `/api/v1/restaurants/me/orders/${orderId}/chat`,
      { message: input },
      { headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` } }
    );

    setMessages([...messages, { role: 'restaurant', content: input }]);
    setInput('');
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold mb-2">Mensajes con cliente:</h4>
      
      <div className="bg-gray-50 p-3 rounded mb-3 max-h-48 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'customer' ? 'text-right' : ''}`}>
            <p className={`inline-block px-3 py-2 rounded-lg max-w-xs ${
              msg.role === 'customer' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-900'
            }`}>
              {msg.content}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
          placeholder="Responder al cliente..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleSendResponse}
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
```

---

### PARTE 6: ESTADÍSTICAS BÁSICAS

**Backend - Endpoint:**

```typescript
GET /api/v1/restaurants/me/stats
{
  "totalOrders": 150,
  "totalRevenue": 2250.50,
  "averageOrderValue": 15.00,
  "completedToday": 12,
  "avgPreparationTime": 18, // minutos
  "ratingAverage": 4.6,
  "topDishes": [
    { "name": "Sushi Variado", "sold": 45 },
    { "name": "Rollos California", "sold": 32 }
  ]
}
```

**Frontend - StatsDashboard.tsx:**

```typescript
export default function StatsDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await axios.get('/api/v1/restaurants/me/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('restaurantToken')}` }
      });
      setStats(response.data);
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Pedidos Total" value={stats?.totalOrders} icon="📦" />
      <StatCard title="Ingresos" value={`€${stats?.totalRevenue}`} icon="💰" />
      <StatCard title="Ticket Medio" value={`€${stats?.averageOrderValue}`} icon="💳" />
      <StatCard title="Rating" value={`${stats?.ratingAverage}⭐`} icon="⭐" />

      <div className="md:col-span-2">
        <h3 className="font-bold mb-2">Hoy</h3>
        <p className="text-lg">Pedidos completados: {stats?.completedToday}</p>
        <p className="text-gray-600">Tiempo promedio: {stats?.avgPreparationTime} min</p>
      </div>

      <div className="md:col-span-2">
        <h3 className="font-bold mb-2">Platos Más Vendidos</h3>
        <ul className="text-sm space-y-1">
          {stats?.topDishes.map((dish: any) => (
            <li key={dish.name}>• {dish.name}: {dish.sold} vendidos</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🏗️ ARQUITECTURA DEL PANEL

**Estructura Frontend:**

```
frontend/src/pages/restaurant/
├── Dashboard.tsx          (home del panel)
├── Profile.tsx           (editar perfil)
├── Menu/
│   ├── MenuManager.tsx
│   └── DishForm.tsx
├── Orders/
│   ├── OrdersDashboard.tsx
│   └── OrderDetail.tsx
└── Stats.tsx             (estadísticas)
```

**Routes del Panel:**
```
/restaurant/login
/restaurant/register
/restaurant/dashboard          (home después de login)
/restaurant/profile
/restaurant/menu
/restaurant/orders
/restaurant/orders/:orderId
/restaurant/stats
```

**Middleware - Auth Restaurante:**
```typescript
// Igual que usuario, pero con restaurantToken
// Restaurante NO puede acceder a rutas de usuario
// Usuario NO puede acceder a rutas de restaurante
```

---

## ✅ CHECKLIST DE SALIDA (Sprint 5 Completado)

**Autenticación Restaurante:**
- [ ] Register para restaurante funcionando
- [ ] Login para restaurante funcionando
- [ ] Token JWT generando para restaurante
- [ ] Rutas protegidas redirigen a login

**Gestión de Perfil:**
- [ ] Restaurante puede ver su perfil
- [ ] Restaurante puede editar: nombre, descripción, horarios, contacto
- [ ] Cambios se guardan en BD
- [ ] Foto de perfil se actualiza

**Gestión de Menú:**
- [ ] Restaurante ve lista de platos
- [ ] Puede agregar plato nuevo
- [ ] Puede editar precio, descripción
- [ ] Puede eliminar plato
- [ ] Platos se actualizen en app usuario en tiempo real

**Gestión de Pedidos:**
- [ ] Restaurante ve pedidos recibidos
- [ ] Puede cambiar estado (confirmed → preparing → ready)
- [ ] Cliente recibe notificación de cambio de estado
- [ ] Ve detalles: items, notas, contacto cliente
- [ ] Página se actualiza cada 5 segundos (nuevos pedidos)

**Chat Restaurante-Cliente:**
- [ ] Restaurante puede responder mensajes
- [ ] Cliente recibe respuesta en tiempo real
- [ ] Historial de chat visible

**Estadísticas:**
- [ ] Muestra total pedidos
- [ ] Muestra ingresos totales
- [ ] Muestra platos top vendidos
- [ ] Muestra rating promedio
- [ ] Datos son en tiempo real

**Frontend:**
- [ ] Navbar diferente para restaurante (no es usuario)
- [ ] No hay acceso a búsqueda o reseñas
- [ ] Logout funciona
- [ ] Responsive en móvil

---

## 🔑 VARIABLES DE ENTORNO

**Backend:**
```
RESTAURANT_JWT_SECRET="secret-para-restaurante"
```

**Frontend:**
```
// Mismo API_URL, pero con rutas /restaurants/...
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Seguridad:**
   - Restaurante SOLO puede ver sus propios pedidos
   - Usuario SOLO puede ver sus propios pedidos
   - No hay acceso cruzado

2. **Performance:**
   - Orders dashboard hace poll cada 5s
   - Considerar WebSocket en futuro para tiempo real
   - Índices en `restaurantId` en tabla orders

3. **Notificaciones:**
   - Cuando restaurante cambia estado → enviar email al cliente
   - Cuando restaurante responde en chat → notificar al cliente
   - Implementar en Sprint 4 Post-MVP

4. **Expansión Futura:**
   - Panel de analíticos más completo
   - Integraciones con sistemas POS
   - Promociones/descuentos
   - Horarios de trabajo (cerrado, pausa, etc)

---

## 🔄 SIGUIENTE PASO

Después de Sprint 5, el MVP está **COMPLETO y MONETIZABLE**:

✅ Usuarios pueden buscar y pedir
✅ Pagos están integrados (Stripe)
✅ Restaurantes pueden gestionar todo
✅ FoodMatch gana comisión
✅ Es un negocio real

Siguiente: **Validación de mercado y expand a otras ciudades**
