# SPRINT 3: PEDIDOS + LOGIN COMPLETO + STRIPE INTEGRADO
**Duración:** 4-5 semanas (EXTENDIDO de 3-4)
**Objetivo:** Usuario puede registrarse/loginear, hacer pedidos PAGADOS que llegan a restaurante con dinero procesado.

---

## 📋 RESUMEN

Lo que el usuario puede hacer:
1. Crear cuenta con email/contraseña
2. Iniciar sesión
3. Hacer un pedido desde un restaurante
4. El pedido llega al restaurante por WhatsApp o Email
5. Ver historial de pedidos
6. Preparación para pagos (sin dinero real aún)

---

## 🎯 FUNCIONALIDADES ESPECÍFICAS

### PARTE 1: AUTENTICACIÓN COMPLETA

#### Backend - Endpoints:

**POST `/api/v1/auth/register`**
```json
Request:
{
  "email": "usuario@example.com",
  "password": "miContraseña123",
  "name": "Juan García"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "usuario@example.com",
    "name": "Juan García"
  }
}
```

**POST `/api/v1/auth/login`**
```json
Request:
{
  "email": "usuario@example.com",
  "password": "miContraseña123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user object */ }
}
```

**GET `/api/v1/auth/me`** (Requiere autenticación)
```json
Response:
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "usuario@example.com",
    "name": "Juan García",
    "phone": "+34 612 345 678"  // Campo nuevo
  }
}
```

**PUT `/api/v1/auth/me`** (Requiere autenticación)
```json
Request:
{
  "name": "Juan García Updated",
  "phone": "+34 612 345 678"
}

Response:
{
  "success": true,
  "user": { /* user object actualizado */ }
}
```

#### Backend - Implementación Auth:

**backend/src/services/auth.service.ts:**

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function registerUser(email: string, password: string, name: string) {
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });

  // Generar JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function loginUser(email: string, password: string) {
  // Encontrar usuario
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Email o contraseña incorrectos');
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Email o contraseña incorrectos');
  }

  // Generar JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
}
```

**backend/src/middleware/auth.middleware.ts:**

```typescript
import { verifyToken } from '../services/auth.service';

export async function authMiddleware(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.slice(7);
    const decoded = await verifyToken(token);
    
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
}
```

#### Frontend - Componentes Auth:

**frontend/src/pages/Register.tsx:**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
        { email, password, name }
      );

      // Guardar token
      localStorage.setItem('token', response.data.token);
      
      // Redirigir a home
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Cuenta</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D17A5A] text-white py-2 rounded hover:bg-[#c46a4a] disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-center mt-4">
        ¿Ya tienes cuenta? <a href="/login" className="text-[#D17A5A] font-semibold">Inicia sesión</a>
      </p>
    </div>
  );
}
```

**frontend/src/pages/Login.tsx:** (Similar a Register)

#### Frontend - Context/Hook para Auth:

**frontend/src/context/AuthContext.tsx:**

```typescript
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado
    const token = localStorage.getItem('token');
    if (token) {
      // Obtener datos del usuario
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

### PARTE 2: SISTEMA DE PEDIDOS

#### Modelo de Base de Datos:

**Prisma Schema (añadir):**

```prisma
model Order {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  items        OrderItem[]  // Platos pedidos
  
  // Información de contacto
  customerName String
  customerPhone String
  customerEmail String
  
  // Estado
  status       String   // "pendiente", "confirmado", "en preparación", "listo", "entregado"
  
  // Total
  totalPrice   Float
  notes        String?  // Notas especiales
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("orders")
}

model OrderItem {
  id       String @id @default(cuid())
  orderId  String
  order    Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  menuId   String
  menuName String
  price    Float
  quantity Int
  
  @@map("order_items")
}

// Actualizar User para incluir pedidos
model User {
  // ... campos anteriores ...
  orders   Order[]
}

// Actualizar Restaurant para incluir pedidos
model Restaurant {
  // ... campos anteriores ...
  orders   Order[]
}
```

#### Backend - Endpoints de Pedidos:

**POST `/api/v1/orders`** (Requiere autenticación)
```json
Request:
{
  "restaurantId": "rest123",
  "items": [
    { "menuId": "menu1", "quantity": 2 },
    { "menuId": "menu2", "quantity": 1 }
  ],
  "notes": "Sin picante, por favor"
}

Response:
{
  "success": true,
  "order": {
    "id": "order123",
    "restaurantId": "rest123",
    "status": "pendiente",
    "totalPrice": 45.50,
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

**GET `/api/v1/orders`** (Requiere autenticación)
```json
Response:
{
  "success": true,
  "orders": [
    {
      "id": "order123",
      "restaurantName": "Sushi Master",
      "status": "confirmado",
      "totalPrice": 45.50,
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

**GET `/api/v1/orders/:id`** (Requiere autenticación)
```json
Response:
{
  "success": true,
  "order": {
    "id": "order123",
    "restaurantId": "rest123",
    "restaurantName": "Sushi Master",
    "restaurantPhone": "+34 963 223344",
    "status": "confirmado",
    "items": [
      { "name": "Sushi Variado", "quantity": 2, "price": 30 }
    ],
    "totalPrice": 45.50,
    "customerName": "Juan García",
    "customerPhone": "+34 612 345 678",
    "notes": "Sin picante",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Backend - Controlador de Pedidos:

**backend/src/controllers/orders.controller.ts:**

```typescript
import { PrismaClient } from '@prisma/client';
import { sendOrderViaWhatsApp } from '../services/whatsapp.service';
import { sendOrderViaEmail } from '../services/email.service';

const prisma = new PrismaClient();

export async function createOrder(req: any, res: any) {
  try {
    const { restaurantId, items, notes } = req.body;
    const userId = req.userId;

    // Obtener usuario
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Obtener restaurante y menú
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menu: true }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurante no encontrado' });
    }

    // Procesar items y calcular total
    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const menuItem = restaurant.menu.find(m => m.id === item.menuId);
      if (!menuItem) {
        return res.status(400).json({ success: false, error: `Plato ${item.menuId} no encontrado` });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        menuName: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // Crear orden
    const order = await prisma.order.create({
      data: {
        userId,
        restaurantId,
        customerName: user.name || 'Cliente',
        customerPhone: user.phone || '',
        customerEmail: user.email,
        status: 'pendiente',
        totalPrice,
        notes,
        items: {
          create: orderItems
        }
      },
      include: { items: true }
    });

    // Enviar a restaurante por WhatsApp o Email
    const orderMessage = `
Nuevo pedido en FoodMatch:
ID: ${order.id}

Cliente: ${order.customerName}
Teléfono: ${order.customerPhone}
Email: ${order.customerEmail}

Pedido:
${orderItems.map(item => `- ${item.menuName} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: €${totalPrice.toFixed(2)}

Notas: ${notes || 'Ninguna'}

Responde a través de FoodMatch o llama al cliente.
    `.trim();

    // Intentar enviar por WhatsApp primero, si no, por email
    try {
      await sendOrderViaWhatsApp(restaurant.phone, orderMessage);
    } catch (error) {
      console.error('Error sending WhatsApp, trying email...');
      await sendOrderViaEmail(restaurant.email || '', orderMessage);
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalPrice: order.totalPrice
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al crear pedido' });
  }
}

export async function getOrders(req: any, res: any) {
  try {
    const userId = req.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { restaurant: true, items: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        restaurantName: order.restaurant.name,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener pedidos' });
  }
}

export async function getOrderById(req: any, res: any) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { restaurant: true, items: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        restaurantName: order.restaurant.name,
        restaurantPhone: order.restaurant.phone,
        status: order.status,
        items: order.items,
        totalPrice: order.totalPrice,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        notes: order.notes,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener pedido' });
  }
}
```

---

### PARTE 3: INTEGRACIÓN WHATSAPP Y EMAIL

#### Servicio WhatsApp (usando Twilio):

**backend/src/services/whatsapp.service.ts:**

```typescript
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio_number = process.env.TWILIO_WHATSAPP_NUMBER; // "whatsapp:+1234567890"

const client = twilio(accountSid, authToken);

export async function sendOrderViaWhatsApp(restaurantPhone: string, message: string) {
  // Formatear número si es necesario
  const phoneNumber = `whatsapp:+${restaurantPhone.replace(/\D/g, '')}`;

  await client.messages.create({
    body: message,
    from: twilio_number,
    to: phoneNumber
  });
}
```

#### Servicio Email:

**backend/src/services/email.service.ts:**

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // O el que uses
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendOrderViaEmail(restaurantEmail: string, message: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: restaurantEmail,
    subject: '📦 Nuevo Pedido en FoodMatch',
    text: message
  });
}
```

#### Frontend - Order Form:

**frontend/src/components/OrderForm.tsx:**

```typescript
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function OrderForm({ restaurantId, restaurantName, menu }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<any>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = (menuId: string) => {
    setItems(prev => ({
      ...prev,
      [menuId]: (prev[menuId] || 0) + 1
    }));
  };

  const removeItem = (menuId: string) => {
    setItems(prev => ({
      ...prev,
      [menuId]: Math.max(0, (prev[menuId] || 0) - 1)
    }));
  };

  const calculateTotal = () => {
    return Object.entries(items).reduce((total, [menuId, quantity]: any) => {
      const menuItem = menu.find((m: any) => m.id === menuId);
      return total + (menuItem?.price || 0) * quantity;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Debes iniciar sesión para hacer pedidos');
      return;
    }

    const orderItems = Object.entries(items)
      .filter(([_, quantity]: any) => quantity > 0)
      .map(([menuId, quantity]: any) => ({ menuId, quantity }));

    if (orderItems.length === 0) {
      alert('Por favor selecciona al menos un plato');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/orders`,
        {
          restaurantId,
          items: orderItems,
          notes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      alert(`Pedido creado! ID: ${response.data.order.id}\n\nEl restaurante lo recibirá en breve.`);
      // Limpiar form
      setItems({});
      setNotes('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-bold mb-4">Haz tu pedido</h3>

      {/* Items seleccionables */}
      <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
        {menu.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">€{item.price.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => removeItem(item.id)}
                className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
              >
                −
              </button>
              <span className="w-6 text-center">{items[item.id] || 0}</span>
              <button
                onClick={() => addItem(item.id)}
                className="bg-[#D17A5A] text-white px-2 py-1 rounded hover:bg-[#c46a4a]"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notas */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Notas especiales:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Sin picante, alergias, etc..."
          className="w-full border rounded px-3 py-2 text-sm"
          maxLength={200}
        />
      </div>

      {/* Total */}
      <div className="border-t pt-3 mb-4">
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || total === 0}
        className="w-full bg-[#D17A5A] text-white py-2 rounded hover:bg-[#c46a4a] disabled:opacity-50"
      >
        {loading ? 'Creando pedido...' : `Hacer pedido (€${total.toFixed(2)})`}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        El restaurante recibirá tu pedido por WhatsApp o email y se pondrá en contacto contigo.
      </p>
    </div>
  );
}
```

---

### PARTE 4: PANTALLA DE HISTORIAL DE PEDIDOS

**frontend/src/pages/MyOrders.tsx:**

```typescript
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => setOrders(res.data.orders))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="p-4">Debes iniciar sesión</div>;
  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No tienes pedidos aún.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{order.restaurantName}</h3>
                  <p className="text-sm text-gray-600">Pedido #{order.id}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">€{order.totalPrice.toFixed(2)}</div>
                  <div className={`text-sm font-semibold ${
                    order.status === 'confirmado' ? 'text-green-600' :
                    order.status === 'pendiente' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
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

## 💳 PARTE 5: STRIPE INTEGRADO (CRÍTICO PARA MONETIZACIÓN)

### ¿Por qué Stripe es crítico?

Sin Stripe:
- ❌ Cliente NO paga en plataforma (riesgo de fraude)
- ❌ FoodMatch NO gana dinero
- ❌ Restaurante NO sabe si cliente está serio
- ❌ Es como Uber sin pagos integrados

Con Stripe:
- ✅ Cliente paga seguro con tarjeta
- ✅ FoodMatch gana 5-15% comisión
- ✅ Restaurante recibe dinero confirmado
- ✅ Es un negocio real

### Backend - Stripe Integration

**Instalar Stripe:**
```bash
npm install stripe
```

**backend/src/services/payment.service.ts:**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(orderId: string, amount: number) {
  // amount en céntimos (45.50 € = 4550)
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { orderId }
  });

  return paymentIntent.client_secret;
}

export async function confirmPayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.status === 'succeeded';
}
```

**backend/src/routes/payments.routes.ts:**

```typescript
import express from 'express';
import { createPaymentIntent } from '../services/payment.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create-payment', authMiddleware, async (req: any, res: any) => {
  try {
    const { orderId, amount } = req.body;
    const clientSecret = await createPaymentIntent(orderId, amount);
    
    res.json({
      success: true,
      clientSecret
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Payment error' });
  }
});

export default router;
```

**Actualizar orden POST endpoint:**

```typescript
// backend/src/controllers/orders.controller.ts

export async function createOrder(req: any, res: any) {
  try {
    const { restaurantId, items, notes, paymentIntentId } = req.body;
    const userId = req.userId;

    // Verificar que payment fue exitoso
    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // Crear orden (SOLO SI pago fue exitoso)
    const order = await prisma.order.create({
      data: {
        userId,
        restaurantId,
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
        status: 'confirmed', // Ya pagado, listo
        totalPrice,
        notes,
        paymentIntentId, // Guardar para refunds
        items: {
          create: orderItems
        }
      }
    });

    // Enviar a restaurante
    await sendOrderViaWhatsApp(restaurant.phone, orderMessage);

    res.json({
      success: true,
      order: { id: order.id, status: order.status }
    });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}
```

### Frontend - Payment Form

**frontend/src/components/PaymentForm.tsx:**

```typescript
import { useState } from 'react';
import { loadStripe } from '@stripe/js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function PaymentForm({ orderId, amount, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Crear payment intent en backend
      const { data } = await axios.post('/api/v1/payments/create-payment', {
        orderId,
        amount: Math.round(amount * 100) // convertir a céntimos
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // 2. Confirmar pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: { email: localStorage.getItem('userEmail') }
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      // 3. Crear orden en backend (SOLO si pago exitoso)
      await axios.post('/api/v1/orders', {
        restaurantId: orderId,
        items,
        notes,
        paymentIntentId: paymentIntent.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="p-4 border rounded-lg">
      <h3 className="font-bold mb-4">Pagar con Tarjeta</h3>
      
      <CardElement className="mb-4 p-3 border rounded" />
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-[#D17A5A] text-white py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
      >
        {loading ? 'Procesando...' : `Pagar €${amount.toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        💳 Seguro: Stripe procesa tu pago, no guardamos tus datos
      </p>
    </form>
  );
}
```

**Instalar librerías Stripe React:**
```bash
npm install @stripe/react-stripe-js @stripe/js
```

### Database Changes

**Prisma Schema (actualizar Order model):**

```prisma
model Order {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  
  items        OrderItem[]
  
  customerName String
  customerPhone String
  customerEmail String
  
  status       String   // "pending", "confirmed", "preparing", "ready", "delivered"
  totalPrice   Float
  notes        String?
  
  // NUEVO: Stripe
  paymentIntentId  String?  // Para refunds
  paymentStatus    String   // "pending", "succeeded", "failed"
  paidAt           DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("orders")
}
```

### Monetización - Opciones

**OPCIÓN A: Comisión por pedidos**
```
Cliente paga €15
FoodMatch toma €1.50 (10%)
Restaurante recibe €13.50

Con 1000 pedidos/mes:
FoodMatch gana: €1,500/mes = €18,000/año
```

**OPCIÓN B: Suscripción Pro + Comisión**
```
Restaurante paga €30/mes por panel
+ FoodMatch toma 3% de comisión

100 restaurantes x €30 = €3,000/mes
+ 1000 pedidos x €0.45 (3%) = €450/mes
Total: €3,450/mes = €41,400/año
```

### Environment Variables

**Actualizar .env:**
```
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**frontend/.env:**
```
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

### Testing Payments

```
Usar test cards de Stripe:
- 4242 4242 4242 4242 (success)
- 4000 0000 0000 0002 (decline)
- 4000 0000 0000 9995 (CVC error)

Expiración: cualquier fecha futura
CVC: cualquier 3 dígitos
```

### Webhook Setup

**Para production, recibir notificaciones de Stripe:**

```typescript
// backend/src/routes/webhook.routes.ts

import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    // Actualizar orden en BD
    await prisma.order.update({
      where: { paymentIntentId: paymentIntent.id },
      data: { paymentStatus: 'succeeded', paidAt: new Date() }
    });
  }

  res.json({received: true});
});
```

---

## 🔑 VARIABLES DE ENTORNO (Backend)

**.env actualizado:**
```
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/foodmatch"

# JWT
JWT_SECRET="tu_secret_super_seguro_aqui"

# Email
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-app-password-gmail"  # NO tu contraseña real, usa App Passwords

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"  # Tu número de Twilio

# API Keys
OPENAI_API_KEY=""  # Para después

# App
PORT=5000
NODE_ENV=development
```

---

## ✅ CHECKLIST DE SALIDA (Sprint 3 Terminado)

**Autenticación:**
- [ ] Register funcionando
- [ ] Login funcionando
- [ ] JWT generando y validando
- [ ] Rutas protegidas funcionando
- [ ] Logout limpiando token

**Pedidos:**
- [ ] Usuario puede crear pedido
- [ ] Se calcula total correcto
- [ ] Pedido se guarda en BD
- [ ] Order form es intuitivo

**Integración WhatsApp/Email:**
- [ ] Pedido llega a restaurante por WhatsApp (si Twilio configurado)
- [ ] Si no WhatsApp, llega por email
- [ ] Restaurante recibe: cliente, teléfono, email, notas
- [ ] Mensaje es claro y profesional

**Historial:**
- [ ] Usuario ve sus pedidos
- [ ] Muestra estado, total, fecha
- [ ] Listing es responsive

**Frontend:**
- [ ] Navbar muestra usuario logueado
- [ ] Links a registro/login en navbar
- [ ] Rutas protegidas redirigen a login si no autenticado

---

## 📝 NOTAS IMPORTANTES

1. **Twilio (WhatsApp):**
   - Crea cuenta en twilio.com
   - Obtén número WhatsApp de prueba (es gratis para testing)
   - En producción: pagar por número real
   - Para development: función perfectamente con email como fallback

2. **Email (Gmail):**
   - Habilitar "App Passwords" en tu cuenta Gmail
   - NO usar tu contraseña real
   - Seguro y simple

3. **Teléfonos de restaurante:**
   - Guardar en formato internacional: +34 + número
   - En BD ya está en campo `phone`

4. **Seguridad:**
   - Las contraseñas están hasheadas con bcrypt ✅
   - JWT expira en 30 días ✅
   - Las ordenes solo las puede ver el usuario que las creó ✅

---

## 🔄 SIGUIENTE PASO

Cuando termines Sprint 3, lee **SPRINT_4_POLISH.md** para:
- Optimizar velocidad
- Mejorar UI/UX
- Añadir notificaciones push
- Pulir detalles
