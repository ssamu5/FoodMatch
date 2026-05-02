import express, { Express } from 'express'
import cors from 'cors'
import 'dotenv/config'
import restaurantRoutes from './routes/restaurantRoutes'

const app: Express = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'FoodMatch backend is running' })
})

// Routes
app.use('/api/v1/restaurants', restaurantRoutes)
// app.use('/api/v1/auth', authRoutes)
// app.use('/api/v1/users', userRoutes)

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`📝 API docs at http://localhost:${PORT}/api/v1/health`)
})
