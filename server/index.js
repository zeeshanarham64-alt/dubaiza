import { createServer } from 'node:http'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { Server } from 'socket.io'

const port = Number(process.env.CHAT_PORT || 3001)
const dataFile = resolve(process.cwd(), 'server-data', 'chats.json')
const validId = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
const allowedOrigins = new Set(
  (process.env.CHAT_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim()),
)

await mkdir(dirname(dataFile), { recursive: true })
let store
try {
  store = JSON.parse(await readFile(dataFile, 'utf8'))
  if (!store || typeof store.chats !== 'object') throw new Error('Invalid chat store')
} catch (error) {
  if (error.code !== 'ENOENT') console.error('Could not read chat store:', error.message)
  store = { chats: {} }
}

let writeQueue = Promise.resolve()
const waitingForRandomChat = new Map()

function persistStore() {
  const serialized = JSON.stringify(store, null, 2)
  writeQueue = writeQueue.then(async () => {
    const temporaryFile = `${dataFile}.tmp`
    await writeFile(temporaryFile, serialized, 'utf8')
    await rename(temporaryFile, dataFile)
  })
  return writeQueue
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(value))
}

async function readJson(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > 16_384) {
      const error = new Error('Request body is too large')
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('Request body must be valid JSON')
    error.status = 400
    throw error
  }
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

const httpServer = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(response, 200, { ok: true, service: 'dubaiza-chat' })
  }

  if (request.method === 'POST' && url.pathname === '/api/chats') {
    try {
      const body = await readJson(request)
      const listingId = String(body.listingId || '').slice(0, 100)
      const listingTitle = String(body.listingTitle || '').trim().slice(0, 120)
      const listingPrice = String(body.listingPrice || '').trim().slice(0, 50)
      if (!listingId || !listingTitle) return sendJson(response, 400, { error: 'A listing is required' })

      const id = randomUUID()
      const chat = { id, listingId, listingTitle, listingPrice, createdAt: new Date().toISOString(), messages: [] }
      store.chats[id] = chat
      await persistStore()
      return sendJson(response, 201, { chat: publicChat(chat) })
    } catch (error) {
      return sendJson(response, error.status || 500, { error: error.status ? error.message : 'Could not create chat' })
    }
  }

  const chatMatch = url.pathname.match(/^\/api\/chats\/([\da-f-]+)$/i)
  if (request.method === 'GET' && chatMatch) {
    const id = chatMatch[1]
    const chat = validId.test(id) ? store.chats[id] : null
    if (!chat) return sendJson(response, 404, { error: 'Chat invite not found' })
    return sendJson(response, 200, { chat: publicChat(chat) })
  }

  return sendJson(response, 404, { error: 'Not found' })
})

const socketServer = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true)
      return callback(new Error('Origin is not allowed'))
    },
  },
  maxHttpBufferSize: 16_384,
})

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
    store.chats[id] = chat

    try {
      await persistStore()
      partner.emit('match:paired', publicChat(chat))
      socket.emit('match:paired', publicChat(chat))
      acknowledge({ ok: true, status: 'paired', chat: publicChat(chat) })
    } catch (error) {
      delete store.chats[id]
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
    const chat = validId.test(id) ? store.chats[id] : null
    if (!chat) return acknowledge({ ok: false, error: 'This chat invite is invalid or expired' })

    if (socket.data.chatId) socket.leave(socket.data.chatId)
    socket.data.chatId = id
    socket.join(id)
    acknowledge({ ok: true, chat: publicChat(chat), messages: chat.messages })
  })

  socket.on('chat:send', async (payload, acknowledge = () => {}) => {
    const chatId = String(payload?.chatId || '')
    const chat = socket.data.chatId === chatId ? store.chats[chatId] : null
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
      await persistStore()
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
  console.log(`DubaiZA realtime chat listening on http://localhost:${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    socketServer.close(() => process.exit(0))
  })
}
