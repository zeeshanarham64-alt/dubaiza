import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { initialListings } from '../server/seedData.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Ephemeral /tmp database path for Vercel Serverless execution
const tmpFile = resolve('/tmp', 'dubaiza-db.json')

let memoryDb = {
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
  chats: {},
}

async function loadDb() {
  try {
    const data = await readFile(tmpFile, 'utf8')
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed.listings) && parsed.listings.length > 0) {
      memoryDb = parsed
    }
  } catch {
    // If not in /tmp, memoryDb holds initialListings
  }
  return memoryDb
}

async function saveDb() {
  try {
    await writeFile(tmpFile, JSON.stringify(memoryDb, null, 2), 'utf8')
  } catch {}
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

// Health Check
app.get('/api/health', async (req, res) => {
  const db = await loadDb()
  res.json({
    ok: true,
    service: 'DubaiZA Vercel Serverless API',
    environment: 'vercel-production',
    listingsCount: db.listings.length,
    usersCount: db.users.length,
    favoritesCount: db.favorites.length,
    timestamp: new Date().toISOString(),
  })
})

// GET /api/listings
app.get('/api/listings', async (req, res) => {
  const db = await loadDb()
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
app.get('/api/listings/:id', async (req, res) => {
  const db = await loadDb()
  const id = String(req.params.id)
  const item = db.listings.find((listing) => String(listing.id) === id)
  if (!item) {
    return res.status(404).json({ success: false, error: 'Listing not found' })
  }
  res.json({ success: true, listing: item })
})

// POST /api/listings
app.post('/api/listings', async (req, res) => {
  const db = await loadDb()
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
  await saveDb()

  res.status(201).json({
    success: true,
    message: 'Listing published successfully',
    listing: newListing,
  })
})

// DELETE /api/listings/:id
app.delete('/api/listings/:id', async (req, res) => {
  const db = await loadDb()
  const id = String(req.params.id)
  const initialCount = db.listings.length
  db.listings = db.listings.filter((item) => String(item.id) !== id)

  if (db.listings.length === initialCount) {
    return res.status(404).json({ success: false, error: 'Listing not found' })
  }

  await saveDb()
  res.json({ success: true, message: 'Listing deleted', id })
})

// Favorites API
app.get('/api/favorites', async (req, res) => {
  const db = await loadDb()
  res.json({ success: true, favorites: db.favorites || [] })
})

app.post('/api/favorites/:id', async (req, res) => {
  const db = await loadDb()
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

  await saveDb()
  res.json({ success: true, isFavorited, favorites: db.favorites })
})

// Auth API
app.post('/api/auth/register', async (req, res) => {
  const db = await loadDb()
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
  await saveDb()

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: newUser,
    token: newUser.id,
  })
})

app.post('/api/auth/login', async (req, res) => {
  const db = await loadDb()
  const { email, phone, name } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()

  let user = db.users.find(
    (u) => (normalizedEmail && u.email === normalizedEmail) || (phone && u.phone === String(phone).trim())
  )

  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      name: String(name || (normalizedEmail ? normalizedEmail.split('@')[0] : 'DubaiZA Member')).trim(),
      email: normalizedEmail || `${Date.now()}@user.dubaiza.ae`,
      phone: String(phone || '').trim(),
      city: 'Dubai',
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    await saveDb()
  }

  res.json({
    success: true,
    message: 'Welcome back!',
    user,
    token: user.id,
  })
})

app.get('/api/auth/me', async (req, res) => {
  const db = await loadDb()
  const authHeader = req.headers.authorization
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null

  if (token) {
    const user = db.users.find((u) => u.id === token)
    if (user) return res.json({ success: true, user })
  }

  const defaultUser = db.users[0] || {
    id: 'user-guest',
    name: 'Guest User',
    email: 'guest@dubaiza.ae',
    city: 'Dubai',
  }

  res.json({ success: true, user: defaultUser })
})

// Chats API
app.get('/api/chats', async (req, res) => {
  const db = await loadDb()
  const list = Object.values(db.chats || {}).map(publicChat)
  res.json({ success: true, chats: list })
})

app.post('/api/chats', async (req, res) => {
  try {
    const db = await loadDb()
    const { listingId, listingTitle, listingPrice } = req.body
    const cleanId = String(listingId || '').slice(0, 100)
    const cleanTitle = String(listingTitle || '').trim().slice(0, 120)
    const cleanPrice = String(listingPrice || '').trim().slice(0, 50)

    if (!cleanId || !cleanTitle) {
      return res.status(400).json({ error: 'A listing is required' })
    }

    if (!db.chats) db.chats = {}

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
    await saveDb()

    res.status(201).json({ success: true, chat: publicChat(chat) })
  } catch {
    res.status(500).json({ error: 'Could not create chat' })
  }
})

app.get('/api/chats/:id', async (req, res) => {
  const db = await loadDb()
  const id = req.params.id
  const chat = db.chats?.[id]
  if (!chat) {
    return res.status(404).json({ error: 'Chat invite not found' })
  }
  res.json({ success: true, chat: publicChat(chat) })
})

export default app
