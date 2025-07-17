import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { PrismaClient } from '@polarbot/database'
import 'dotenv/config'

const app = new Hono()
const prisma = new PrismaClient()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'PolarBot Control Panel API',
    version: '0.1.0'
  })
})

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Bot statistics endpoint
app.get('/api/stats', async (c) => {
  try {
    // Example: Get some statistics from your database
    // You can customize this based on your Prisma schema
    const stats = {
      // Add your database queries here
      // Example: userCount: await prisma.user.count(),
      // bansCount: await prisma.ban.count(),
      timestamp: new Date().toISOString()
    }

    return c.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

const port = parseInt(process.env.PORT || '3001')

console.log(`🚀 Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
