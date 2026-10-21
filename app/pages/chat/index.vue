<script setup lang="ts">
import type { ChatConversation, ChatMessage } from '~/types'

const api = useApi()
const auth = useAuthStore()
const { socket } = useNuxtApp() as any
const { timeAgo } = useFormat()
const asset = useAssetUrl()

const conversations = ref<ChatConversation[]>([])
const messages = ref<ChatMessage[]>([])
const activeId = ref<string | null>(null)
const draft = ref('')
const sending = ref(false)
const typing = ref(false)

const active = computed(() => conversations.value.find((c) => c.id === activeId.value) ?? null)

async function loadConversations() {
  const res = await api.get<ChatConversation[]>('/admin/chat/conversations')
  conversations.value = res.data
  if (!activeId.value && res.data.length) select(res.data[0].id)
}

async function select(id: string) {
  activeId.value = id
  const res = await api.get<ChatMessage[]>(`/admin/chat/conversations/${id}/messages`)
  messages.value = res.data
  socket?.join(id)
  scrollToBottom()
  const conv = conversations.value.find((c) => c.id === id)
  if (conv) conv.unread = 0
}

function scrollToBottom() {
  nextTick(() => {
    const el = document.getElementById('chat-scroll')
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function send() {
  const body = draft.value.trim()
  if (!body || !activeId.value) return
  sending.value = true
  draft.value = ''
  try {
    // REST keeps the message durable; the gateway broadcasts it to both sides
    const res = await api.post<ChatMessage>(`/admin/chat/conversations/${activeId.value}/messages`, { body })
    if (!messages.value.some((m) => m.id === res.data.id)) messages.value.push(res.data)
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await loadConversations()
  socket?.connect()
  socket?.onMessage((msg: any) => {
    if (msg.conversationId === activeId.value || messages.value.length === 0) {
      if (!messages.value.some((m) => m.id === msg.id)) messages.value.push(msg)
      scrollToBottom()
    }
    loadConversations()
  })
})

onBeforeUnmount(() => socket?.offMessage?.())
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="page-title">ແຊັດສະພອດ</h1>
      <p class="page-subtitle">ຕອບຄຳຖາມລູກຄ້າແບບ real-time</p>
    </div>

    <div class="card grid h-[calc(100vh-220px)] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
      <!-- conversations -->
      <div class="flex flex-col border-r border-slate-100">
        <div class="border-b border-slate-100 p-3">
          <div class="relative">
            <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input placeholder="ຄົ້ນຫາລູກຄ້າ..." class="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-brand-500" />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="c in conversations"
            :key="c.id"
            class="flex w-full items-start gap-2.5 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50"
            :class="activeId === c.id ? 'bg-brand-50/60' : ''"
            @click="select(c.id)"
          >
            <img v-if="c.customer.avatar" :src="asset(c.customer.avatar)" class="h-10 w-10 rounded-full object-cover" alt="" />
            <span v-else class="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">{{ c.customer.name.slice(0, 1) }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-xs font-semibold text-slate-800">{{ c.customer.name }}</p>
                <span class="shrink-0 text-[10px] text-slate-400">{{ timeAgo(c.lastMessageAt) }}</span>
              </div>
              <p class="truncate text-[11px] text-slate-500">{{ c.lastMessage }}</p>
            </div>
            <span v-if="c.unread" class="mt-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{{ c.unread }}</span>
          </button>
          <EmptyState v-if="!conversations.length" icon="i-lucide-messages-square" title="ຍັງບໍ່ມີການສົນທະນາ" />
        </div>
      </div>

      <!-- thread -->
      <div class="flex min-w-0 flex-col">
        <template v-if="active">
          <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <img v-if="active.customer.avatar" :src="asset(active.customer.avatar)" class="h-9 w-9 rounded-full object-cover" alt="" />
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ active.customer.name }}</p>
              <p class="flex items-center gap-1 text-[11px] text-emerald-600"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500" /> ອອນລາຍ · {{ active.customer.phone }}</p>
            </div>
            <div class="ml-auto flex gap-1">
              <UButton icon="i-lucide-phone" size="xs" color="neutral" variant="ghost" />
              <UButton icon="i-lucide-more-vertical" size="xs" color="neutral" variant="ghost" />
            </div>
          </div>

          <div id="chat-scroll" class="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
            <div
              v-for="m in messages"
              :key="m.id"
              class="flex"
              :class="m.senderRole === 'STAFF' ? 'justify-end' : 'justify-start'"
            >
              <div class="max-w-[75%]">
                <div
                  class="rounded-2xl px-3.5 py-2 text-sm shadow-sm"
                  :class="m.senderRole === 'STAFF' ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-white text-slate-700'"
                >
                  {{ m.body }}
                </div>
                <p class="mt-0.5 px-1 text-[10px] text-slate-400" :class="m.senderRole === 'STAFF' ? 'text-right' : ''">
                  {{ new Date(m.createdAt).toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' }) }}
                </p>
              </div>
            </div>
            <p v-if="typing" class="text-[11px] text-slate-400">ລູກຄ້າກຳລັງພິມ...</p>
          </div>

          <div class="border-t border-slate-100 p-3">
            <form class="flex items-end gap-2" @submit.prevent="send">
              <div class="flex gap-1">
                <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><UIcon name="i-lucide-paperclip" class="h-4 w-4" /></button>
                <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><UIcon name="i-lucide-smile" class="h-4 w-4" /></button>
              </div>
              <input
                v-model="draft"
                placeholder="ພິມຂໍ້ຄວາມ..."
                class="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
              />
              <UButton type="submit" icon="i-lucide-send" :loading="sending" :disabled="!draft.trim()" />
            </form>
            <p class="mt-2 text-center text-[10px] text-slate-400">ກົດ Enter ເພື່ອສົ່ງ · ຂໍ້ຄວາມຈະຖືກສົ່ງຫາລູກຄ້າໃນແອັບທັນທີ</p>
          </div>
        </template>
        <div v-else class="grid flex-1 place-items-center">
          <EmptyState icon="i-lucide-message-circle" title="ເລືອກການສົນທະນາ" description="ເລືອກລູກຄ້າຈາກລາຍການເພື່ອເລີ່ມຕອບ" />
        </div>
      </div>
    </div>
  </div>
</template>
