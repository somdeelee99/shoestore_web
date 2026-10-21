import { io, type Socket } from 'socket.io-client'

/**
 * Socket.IO client for the admin chat screen.
 * Namespace `/chat` (see ChatGateway in the NestJS API).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let socket: Socket | null = null

  function connect() {
    if (socket?.connected) return socket
    socket = io(`${config.public.socketUrl}/chat`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
    return socket
  }

  function join(conversationId: string) {
    connect()?.emit('chat:join', { conversationId, role: 'STAFF' })
  }

  function send(payload: { conversationId: string; senderId?: string; senderRole: 'STAFF'; body: string }) {
    connect()?.emit('chat:send', payload)
  }

  function onMessage(handler: (msg: any) => void) {
    connect()?.on('chat:message', handler)
  }

  function offMessage(handler: (msg: any) => void) {
    socket?.off('chat:message', handler)
  }

  return { provide: { socket: { connect, join, send, onMessage, offMessage } } }
})
