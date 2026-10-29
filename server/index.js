import { createServer } from 'node:http'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { initialListings } from './seedData.js'

const port = Number(process.env.PORT || process.env.CHAT_PORT || 3001)
const dataDir = resolve(process.cwd(), 'server-data')
const dbFile = resolve(dataDir, 'db.json')
const legacyChatsFile = resolve(dataDir, 'chats.json')
const validId = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

await mkdir(dataDir, { recursive: true })

let db = {
  listings: [],
  users: [],
  favorites: [],
  chats: {},
}

// Load or initialize persistent DB
try {
  const content = await readFile(dbFile, 'utf8')
  db = JSON.parse(content)
  if (!Array.isArray(db.listings) || db.listings.length === 0) {
    db.listings = [...initialListings]
  }
  if (!Array.isArray(db.users)) db.users = []
  if (!Array.isArray(db.favorites)) db.favorites = []
  if (!db.chats || typeof db.chats !== 'object') db.chats = {}
} catch (error) {
  // If db.json doesn't exist, check legacy chats.json to preserve chat history
  let legacyChats = {}
  try {
    const legacyContent = await readFile(legacyChatsFile, 'utf8')
    const parsed = JSON.parse(legacyContent)
    if (parsed && typeof parsed.chats === 'object') {
      legacyChats = parsed.chats
    }
  } catch {}

  db = {
    listings: [...initialListings],
    users: [
      {
        id: 'user-demo-1',
        name: 'Ahmed Al Mansoor',
        email: 'ahmed@dubaiza.ae',
        phone: '+971 50 123 4567',
        city: 'Dubai',
        createdAt: new Date().toISOString(),
      },
    ],
    favorites: ['listing-m1', 'listing-p1', 'listing-e1'],
    chats: legacyChats,
  }
  await writeFile(dbFile, JSON.stringify(db, null, 2), 'utf8')
  console.log(`[DubaiZA DB] Initialized db.json with ${db.listings.length} listings and ${Object.keys(db.chats).length} chats.`)
}

let writeQueue = Promise.resolve()

function persistDb() {
  const serialized = JSON.stringify(db, null, 2)
  writeQueue = writeQueue.then(async () => {
    const tempFile = `${dbFile}.tmp`
    await writeFile(tempFile, serialized, 'utf8')
    await rename(tempFile, dbFile)
  })
  return writeQueue
}

function publicChat(chat) {
  return {
    id: chat.id,
    listingId: chat.listingId,
    listingTitle: chat.listingTitle,
    listingPrice: chat.listingPrice,
    chatType: chat.chatType || 'listing',
    createdAt: chat.createdAt,
  }
}

// Setup Express app
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'DubaiZA Full-Stack API',
    listingsCount: db.listings.length,
    usersCount: db.users.length,
    favoritesCount: db.favorites.length,
    chatsCount: Object.keys(db.chats).length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// --- LISTINGS API ---

// GET /api/listings (Supports ?category=...&city=...&q=...)
app.get('/api/listings', (req, res) => {
  const { category, city, q } = req.query
  let results = [...db.listings]

  if (category && category !== 'All') {
    const catLower = String(category).toLowerCase()
    results = results.filter((item) => String(item.category || '').toLowerCase() === catLower)
  }

  if (city && city !== 'All' && city !== 'All Cities') {
    const cityLower = String(city).toLowerCase()
    results = results.filter((item) => String(item.city || '').toLowerCase() === cityLower)
  }

  if (q && String(q).trim()) {
    const query = String(q).trim().toLowerCase()
    results = results.filter((item) =>
      String(item.title || '').toLowerCase().includes(query) ||
      String(item.description || '').toLowerCase().includes(query) ||
      String(item.location || '').toLowerCase().includes(query) ||
      String(item.category || '').toLowerCase().includes(query)
    )
  }

  res.json({
    success: true,
    count: results.length,
    total: db.listings.length,
    listings: results,
  })
})

// GET /api/listings/:id
app.get('/api/listings/:id', (req, res) => {
  const id = String(req.params.id)
  const item = db.listings.find((listing) => String(listing.id) === id)
  if (!item) {
    return res.status(404).json({ success: false, error: 'Listing not found' })
  }
  res.json({ success: true, listing: item })
})

// POST /api/listings (Create a new listing)
app.post('/api/listings', async (req, res) => {
  const { title, price, category, location, city, description, image, info } = req.body

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, error: 'Title, price, and category are required' })
  }

  const newListing = {
    id: `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: String(title).trim().slice(0, 160),
    price: String(price).trim().slice(0, 50),
    category: String(category).trim(),
    city: String(city || 'Dubai').trim(),
    location: String(location || 'Dubai, UAE').trim().slice(0, 100),
    description: String(description || '').trim().slice(0, 2000),
    image: String(image || '').trim() || 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    info: Array.isArray(info) ? info : [city || 'Dubai', 'Verified Seller'],
    badge: 'New',
    accent: 'new',
    time: 'Just now',
    createdAt: new Date().toISOString(),
  }

  db.listings.unshift(newListing)
  await persistDb()

  // Real-time notification to all connected clients
  socketServer.emit('listing:created', newListing)

  res.status(201).json({
    success: true,
    message: 'Listing published successfully',
    listing: newListing,
  })
})

// DELETE /api/listings/:id
app.delete('/api/listings/:id', async (req, res) => {
  const id = String(req.params.id)
  const initialCount = db.listings.length
  db.listings = db.listings.filter((item) => String(item.id) !== id)

  if (db.listings.length === initialCount) {
    return res.status(404).json({ success: false, error: 'Listing not found' })
  }

  await persistDb()
  socketServer.emit('listing:deleted', { id })

  res.json({ success: true, message: 'Listing deleted', id })
})

// --- FAVORITES API ---

app.get('/api/favorites', (req, res) => {
  res.json({ success: true, favorites: db.favorites || [] })
})

app.post('/api/favorites/:id', async (req, res) => {
  const id = String(req.params.id)
  if (!db.favorites) db.favorites = []

  const index = db.favorites.indexOf(id)
  let isFavorited = false

  if (index >= 0) {
    db.favorites.splice(index, 1)
    isFavorited = false
  } else {
    db.favorites.push(id)
    isFavorited = true
  }

  await persistDb()
  res.json({ success: true, isFavorited, favorites: db.favorites })
})

// --- AUTH & PROFILE API ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, city } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail && !phone) {
    return res.status(400).json({ success: false, error: 'Email or phone number is required' })
  }

  let existing = db.users.find((u) => u.email === normalizedEmail)
  if (existing) {
    return res.json({
      success: true,
      message: 'Account already exists. Logged in successfully.',
      user: existing,
      token: existing.id,
    })
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: String(name || 'DubaiZA User').trim(),
    email: normalizedEmail,
    phone: String(phone || '').trim(),
    city: String(city || 'Dubai').trim(),
    createdAt: new Date().toISOString(),
  }

  db.users.push(newUser)
  await persistDb()

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: newUser,
    token: newUser.id,
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, phone, name } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()

  let user = db.users.find(
    (u) => (normalizedEmail && u.email === normalizedEmail) || (phone && u.phone === String(phone).trim())
  )

  if (!user) {
    // If not found, create seamless session profile
    user = {
      id: `user-${Date.now()}`,
      name: String(name || normalizedEmail.split('@')[0] || 'DubaiZA Member').trim(),
      email: normalizedEmail || `${Date.now()}@user.dubaiza.ae`,
      phone: String(phone || '').trim(),
      city: 'Dubai',
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    persistDb()
  }

  res.json({
    success: true,
    message: 'Welcome back!',
    user,
    token: user.id,
  })
})

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null

  if (token) {
    const user = db.users.find((u) => u.id === token)
    if (user) return res.json({ success: true, user })
  }

  // Return the first or default demo user
  const defaultUser = db.users[0] || {
    id: 'user-guest',
    name: 'Guest User',
    email: 'guest@dubaiza.ae',
    city: 'Dubai',
  }

  res.json({ success: true, user: defaultUser })
})

// --- CHAT HTTP ENDPOINTS ---

app.get('/api/chats', (req, res) => {
  const list = Object.values(db.chats).map(publicChat)
  res.json({ success: true, chats: list })
})

app.post('/api/chats', async (req, res) => {
  try {
    const { listingId, listingTitle, listingPrice } = req.body
    const cleanId = String(listingId || '').slice(0, 100)
    const cleanTitle = String(listingTitle || '').trim().slice(0, 120)
    const cleanPrice = String(listingPrice || '').trim().slice(0, 50)

    if (!cleanId || !cleanTitle) {
      return res.status(400).json({ error: 'A listing is required' })
    }

    // Check if a chat already exists for this listing
    const existing = Object.values(db.chats).find(
      (c) => c.listingId === cleanId && c.chatType !== 'random'
    )
    if (existing) {
      return res.json({ success: true, chat: publicChat(existing) })
    }

    const id = randomUUID()
    const chat = {
      id,
      listingId: cleanId,
      listingTitle: cleanTitle,
      listingPrice: cleanPrice,
      chatType: 'listing',
      createdAt: new Date().toISOString(),
      messages: [],
    }
    db.chats[id] = chat
    await persistDb()

    res.status(201).json({ success: true, chat: publicChat(chat) })
  } catch (error) {
    res.status(500).json({ error: 'Could not create chat' })
  }
})

app.get('/api/chats/:id', (req, res) => {
  const id = req.params.id
  const chat = db.chats[id]
  if (!chat) {
    return res.status(404).json({ error: 'Chat invite not found' })
  }
  res.json({ success: true, chat: publicChat(chat) })
})

// Create HTTP server wrapping Express
const httpServer = createServer(app)

// Setup Socket.io on top of httpServer
const allowedOrigins = new Set(
  (process.env.CHAT_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
)

const socketServer = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('loca.lt') || origin.includes('192.168.')) {
        return callback(null, true)
      }
      return callback(null, true) // Allow during testing across LAN/tunnel
    },
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 16_384,
})

const waitingForRandomChat = new Map()

socketServer.on('connection', (socket) => {
  socket.on('match:find', async (payload, acknowledge = () => {}) => {
    if (socket.data.randomWaiting) return acknowledge({ ok: true, status: 'searching' })

    let partner
    for (const [socketId, candidate] of waitingForRandomChat) {
      if (!candidate.connected) {
        waitingForRandomChat.delete(socketId)
      } else if (candidate.id !== socket.id) {
        partner = candidate
        waitingForRandomChat.delete(socketId)
        break
      }
    }

    if (!partner) {
      socket.data.randomWaiting = true
      waitingForRandomChat.set(socket.id, socket)
      return acknowledge({ ok: true, status: 'searching' })
    }

    partner.data.randomWaiting = false
    const id = randomUUID()
    const chat = {
      id,
      listingId: `random-${id}`,
      listingTitle: 'Random chat',
      listingPrice: 'Anonymous conversation',
      chatType: 'random',
      createdAt: new Date().toISOString(),
      messages: [],
    }
    db.chats[id] = chat

    try {
      await persistDb()
      partner.emit('match:paired', publicChat(chat))
      socket.emit('match:paired', publicChat(chat))
      acknowledge({ ok: true, status: 'paired', chat: publicChat(chat) })
    } catch (error) {
      delete db.chats[id]
      partner.emit('match:error', 'Could not create a chat. Please try again.')
      acknowledge({ ok: false, error: 'Could not create a chat. Please try again.' })
      console.error('Could not persist random chat:', error.message)
    }
  })

  socket.on('match:cancel', (acknowledge = () => {}) => {
    waitingForRandomChat.delete(socket.id)
    socket.data.randomWaiting = false
    acknowledge({ ok: true })
  })

  socket.on('chat:join', async (payload, acknowledge = () => {}) => {
    const id = String(payload?.chatId || '')
    const chat = db.chats[id]
    if (!chat) return acknowledge({ ok: false, error: 'This chat invite is invalid or expired' })

    if (socket.data.chatId) socket.leave(socket.data.chatId)
    socket.data.chatId = id
    socket.join(id)
    acknowledge({ ok: true, chat: publicChat(chat), messages: chat.messages })
  })

  socket.on('chat:send', async (payload, acknowledge = () => {}) => {
    const chatId = String(payload?.chatId || '')
    const chat = socket.data.chatId === chatId ? db.chats[chatId] : null
    const text = String(payload?.text || '').trim()
    const senderId = String(payload?.senderId || '').trim().slice(0, 80)
    const senderName = String(payload?.senderName || 'Guest').trim().slice(0, 60)

    if (!chat) return acknowledge({ ok: false, error: 'Join this conversation before sending a message' })
    if (!senderId) return acknowledge({ ok: false, error: 'A participant ID is required' })
    if (!text || text.length > 2_000) return acknowledge({ ok: false, error: 'Messages must be between 1 and 2,000 characters' })
    if (Date.now() - (socket.data.lastMessageAt || 0) < 500) {
      return acknowledge({ ok: false, error: 'Please wait a moment before sending another message' })
    }

    socket.data.lastMessageAt = Date.now()
    const message = {
      id: randomUUID(),
      chatId,
      senderId,
      senderName: senderName || 'Guest',
      text,
      createdAt: new Date().toISOString(),
    }
    chat.messages.push(message)
    if (chat.messages.length > 500) chat.messages.splice(0, chat.messages.length - 500)

    try {
      await persistDb()
      socketServer.to(chatId).emit('chat:message', message)
      acknowledge({ ok: true, message })
    } catch (error) {
      console.error('Could not save chat message:', error.message)
      acknowledge({ ok: false, error: 'Message could not be saved. Please try again.' })
    }
  })

  socket.on('disconnect', () => {
    waitingForRandomChat.delete(socket.id)
  })
})

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`DubaiZA Full-Stack server listening on http://localhost:${port}`)
  console.log(`- REST API: http://localhost:${port}/api/health`)
  console.log(`- Listings: http://localhost:${port}/api/listings`)
  console.log(`- WebSockets: Real-time Socket.io active on :${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    socketServer.close(() => process.exit(0))
  })
}
