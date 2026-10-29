# Realtime chat

## Start the site

```sh
npm install
npm run dev:full
```

Open `http://localhost:5173`. This runs Vite and the Socket.IO chat server; Vite proxies the REST API and WebSocket connection to port 3001.

## Invite a participant

Choose **Message seller** on a listing, then copy the invite link from Messages and send it to the other participant. Opening that link joins the same live conversation. Messages are saved in `server-data/chats.json` and survive server restarts.

## Access model

This chat uses private-by-link access, not user authentication. Anyone with an invite link can read and send messages in that conversation. Before public deployment, add verified accounts and participant authorization, use HTTPS, and set `CHAT_ALLOWED_ORIGINS` to the deployed website origin.
