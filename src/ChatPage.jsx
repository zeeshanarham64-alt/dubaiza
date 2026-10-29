import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

function getParticipantId() {
  const storageKey = 'dubaiza-chat-participant-v1'
  try {
    const existingId = window.localStorage.getItem(storageKey)
    if (existingId) return existingId
    const id = window.crypto.randomUUID()
    window.localStorage.setItem(storageKey, id)
    return id
  } catch {
    return window.crypto.randomUUID()
  }
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export default function ChatPage({ conversations, setConversations, activeId, setActiveId, senderName, serviceError }) {
  const [reply, setReply] = useState('')
  const [connectionStatus, setConnectionStatus] = useState({ chatId: null, state: 'idle' })
  const [connectionErrorStatus, setConnectionErrorStatus] = useState({ chatId: null, message: '' })
  const [copyMessage, setCopyMessage] = useState('')
  const [randomStatus, setRandomStatus] = useState('idle')
  const [randomError, setRandomError] = useState('')
  const socketRef = useRef(null)
  const matchSocketRef = useRef(null)
  const [participantId] = useState(getParticipantId)
  const selectedId = activeId || conversations[0]?.id
  const selected = conversations.find((conversation) => conversation.id === selectedId)
  const inviteUrl = selected ? `${window.location.origin}/?chat=${encodeURIComponent(selected.id)}` : ''
  const connection = selectedId === connectionStatus.chatId
    ? connectionStatus.state
    : selectedId ? 'connecting' : 'idle'
  const connectionError = selectedId === connectionErrorStatus.chatId ? connectionErrorStatus.message : ''

  useEffect(() => {
    if (!selectedId) return undefined

    let mounted = true
    const socket = io({ path: '/socket.io', reconnectionAttempts: 5, timeout: 5000 })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('chat:join', { chatId: selectedId }, (result) => {
        if (!mounted) return
        if (!result?.ok) {
          setConnectionStatus({ chatId: selectedId, state: 'error' })
          setConnectionErrorStatus({ chatId: selectedId, message: result?.error || 'Could not join this conversation.' })
          return
        }

        const messages = result.messages || []
        const lastMessage = messages.at(-1)
        setConnectionStatus({ chatId: selectedId, state: 'connected' })
        setConnectionErrorStatus({ chatId: selectedId, message: '' })
        setConversations((current) => {
          const existing = current.find((conversation) => conversation.id === selectedId)
          const conversation = {
            ...existing,
            ...result.chat,
            name: result.chat.listingTitle,
            listing: result.chat.listingTitle,
            message: lastMessage?.text || 'No messages yet',
            time: lastMessage?.createdAt || result.chat.createdAt,
            messages,
          }
          return [conversation, ...current.filter((item) => item.id !== selectedId)]
        })
      })
    })

    socket.on('chat:message', (message) => {
      if (!mounted || message.chatId !== selectedId) return
      setConversations((current) => current.map((conversation) => conversation.id === selectedId
        ? {
            ...conversation,
            message: message.text,
            time: message.createdAt,
            messages: [...conversation.messages, message],
          }
        : conversation))
    })

    socket.on('connect_error', () => {
      if (!mounted) return
      setConnectionStatus({ chatId: selectedId, state: 'error' })
      setConnectionErrorStatus({ chatId: selectedId, message: 'Could not connect to the chat server. Start the app with npm run dev:full.' })
    })

    return () => {
      mounted = false
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [selectedId, setConversations])

  useEffect(() => () => {
    matchSocketRef.current?.emit('match:cancel')
    matchSocketRef.current?.disconnect()
  }, [])

  function joinRandomMatch(chat) {
    const conversation = {
      ...chat,
      name: 'Random person',
      listing: chat.listingTitle,
      message: 'You are connected. Say hello.',
      time: chat.createdAt,
      messages: [],
    }
    setConversations((current) => [conversation, ...current.filter((item) => item.id !== chat.id)])
    setActiveId(chat.id)
    setRandomStatus('idle')
    setRandomError('')
    matchSocketRef.current?.disconnect()
    matchSocketRef.current = null
  }

  function findRandomPerson() {
    if (randomStatus !== 'idle') return
    setRandomStatus('connecting')
    setRandomError('')
    const socket = io({ path: '/socket.io', reconnectionAttempts: 3, timeout: 5000 })
    matchSocketRef.current = socket

    socket.on('connect', () => {
      socket.emit('match:find', { senderName }, (result) => {
        if (!result?.ok) {
          setRandomStatus('idle')
          setRandomError(result?.error || 'Could not find a chat partner.')
          socket.disconnect()
          return
        }
        if (result.status === 'searching') setRandomStatus('searching')
        if (result.status === 'paired' && result.chat) joinRandomMatch(result.chat)
      })
    })

    socket.on('match:paired', joinRandomMatch)
    socket.on('match:error', (message) => {
      setRandomStatus('idle')
      setRandomError(message)
      socket.disconnect()
    })
    socket.on('connect_error', () => {
      setRandomStatus('idle')
      setRandomError('Random chat is unavailable. Check the chat server and try again.')
      socket.disconnect()
    })
  }

  function cancelRandomSearch() {
    matchSocketRef.current?.emit('match:cancel')
    matchSocketRef.current?.disconnect()
    matchSocketRef.current = null
    setRandomStatus('idle')
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = reply.trim()
    if (!text || !selected || connection !== 'connected') return

    socketRef.current?.emit('chat:send', {
      chatId: selected.id,
      senderId: participantId,
      senderName: senderName || 'Guest',
      text,
    }, (result) => {
      if (result?.ok) {
        setReply('')
        setConnectionErrorStatus({ chatId: selected.id, message: '' })
      } else {
        setConnectionErrorStatus({ chatId: selected.id, message: result?.error || 'Message could not be sent.' })
      }
    })
  }

  async function copyInvite() {
    try {
      await window.navigator.clipboard.writeText(inviteUrl)
      setCopyMessage('Invite link copied. Share it with the other participant.')
    } catch {
      setCopyMessage('Copy the invite link below and share it with the other participant.')
    }
  }

  return (
    <section className="app-page" aria-labelledby="chat-title">
      <div className="page-heading">
        <p className="page-eyebrow">Private invite chat</p>
        <h1 id="chat-title">Messages</h1>
        <p>Messages sync live and are saved on the chat server.</p>
      </div>
      {serviceError && <p className="form-error" role="alert">{serviceError}</p>}
      <div className="chat-layout">
        <aside className="conversation-list" aria-label="Conversations">
          <div className="random-match-panel">
            <strong>Meet someone new</strong>
            <p>Pair with another person who is looking to chat.</p>
            {randomStatus === 'idle' ? (
              <button className="search-button" type="button" onClick={findRandomPerson}>Chat with a random person</button>
            ) : (
              <div className="match-waiting" role="status">
                <span>{randomStatus === 'connecting' ? 'Connecting to chat…' : 'Finding someone to chat with…'}</span>
                <button type="button" className="text-action" onClick={cancelRandomSearch}>Cancel</button>
              </div>
            )}
            {randomError && <p className="form-error" role="alert">{randomError}</p>}
          </div>
          {conversations.map((conversation) => (
            <button
              className={`conversation ${selectedId === conversation.id ? 'selected' : ''}`}
              key={conversation.id}
              type="button"
              onClick={() => setActiveId(conversation.id)}
            >
              <span className="avatar" aria-hidden="true">{conversation.chatType === 'random' ? 'R' : conversation.listingTitle?.[0] || conversation.listing?.[0] || 'L'}</span>
              <span className="conversation-copy">
                <strong>{conversation.chatType === 'random' ? 'Random person' : conversation.listingTitle || conversation.listing}</strong>
                <small>{conversation.listingPrice || 'Listing inquiry'}</small>
                <span>{conversation.message}</span>
              </span>
              <time>{formatTime(conversation.time)}</time>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="chat-empty">No conversations yet. Open a listing and choose “Message seller” to start one.</p>
          )}
        </aside>

        {selected ? (
          <section className="chat-thread" aria-label={`Conversation about ${selected.listingTitle || selected.listing}`}>
            <div className="thread-heading">
              <strong>{selected.chatType === 'random' ? 'Random person' : selected.listingTitle || selected.listing}</strong>
              <span>{selected.listingPrice || 'Listing conversation'}</span>
            </div>
            {selected.chatType === 'random' ? (
              <div className="chat-invite random-chat-note">
                <span>This is an anonymous one-to-one chat.</span>
              </div>
            ) : (
            <div className="chat-invite">
              <div className="chat-connection" role="status">
                <span className={`connection-indicator ${connection}`} />
                {connection === 'connected' ? 'Live' : connection === 'connecting' ? 'Connecting' : connection === 'error' ? 'Offline' : 'Waiting'}
              </div>
              <label className="invite-field">
                Invite link
                <input aria-label="Chat invite link" readOnly value={inviteUrl} />
              </label>
              <button type="button" className="text-action" onClick={copyInvite}>Copy invite</button>
              {copyMessage && <span className="invite-status" role="status">{copyMessage}</span>}
              {connectionError && <span className="form-error" role="alert">{connectionError}</span>}
            </div>
            )}
            <div className="thread-messages" aria-live="polite">
              {selected.messages?.length ? selected.messages.map((message) => (
                <article className={`message ${message.senderId === participantId ? 'sent' : 'received'}`} key={message.id}>
                  <strong>{message.senderName}</strong>
                  <p>{message.text}</p>
                  <time>{formatTime(message.createdAt)}</time>
                </article>
              )) : <p className="chat-empty">No messages yet. Share the invite link to start the conversation.</p>}
            </div>
            <form className="message-form" onSubmit={sendMessage}>
              <input
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={connection === 'connected' ? 'Write a message...' : 'Connect to send a message'}
                aria-label="Write a message"
                maxLength={2000}
                disabled={connection !== 'connected'}
              />
              <button className="search-button" type="submit" disabled={connection !== 'connected' || !reply.trim()}>Send</button>
            </form>
          </section>
        ) : (
          <div className="chat-thread chat-placeholder">
            <h2>Start a conversation from a listing</h2>
            <p>Each listing has its own private invite link. Share the link with the other participant to chat in real time.</p>
          </div>
        )}
      </div>
    </section>
  )
}
