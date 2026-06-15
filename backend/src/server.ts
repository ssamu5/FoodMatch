import express, { Express } from 'express'
import cors from 'cors'
import 'dotenv/config'
import restaurantRoutes from './routes/restaurantRoutes'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import { rateLimit } from './middleware/rateLimit'

const app: Express = express()
const PORT = process.env.PORT || 5000

// Trust the first proxy so req.ip reflects the client behind a load balancer.
app.set('trust proxy', 1)

// Middleware
app.use(cors())
app.use(express.json())

// Rate limiting (in-memory; see middleware note about Redis for production).
// General limiter across the whole API surface.
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, keyPrefix: 'api' })
// Stricter limiter for auth to slow down credential stuffing / brute force.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'auth' })

// Health check endpoint (unthrottled)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'FoodMatch backend is running' })
})

// Routes. Auth uses ONLY the stricter auth limiter; the general limiter is
// mounted on the non-auth subtrees so auth attempts do not also burn an IP's
// general-API budget (the two limiters keep independent counters).
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/users', generalLimiter, userRoutes)
app.use('/api/v1/restaurants', generalLimiter, restaurantRoutes)

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`API docs at http://localhost:${PORT}/api/v1/health`)
})
