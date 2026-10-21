<script setup lang="ts">
const app = useAppStore()
const auth = useAuthStore()
const api = useApi()
const search = ref('')
const router = useRouter()

const avatarUrl = useAssetUrl()

async function loadNotifications() {
  try {
    const res = await api.get<any[]>('/admin/chat/conversations', undefined, true)
    app.setNotifications(res.data ?? [], 0)
  } catch {
    /* ignore */
  }
}

function onSearch() {
  if (!search.value.trim()) return
  router.push({ path: '/products', query: { search: search.value } })
}

onMounted(loadNotifications)

const userItems = [
  [{ label: 'ໂປຣໄຟລ໌', icon: 'i-lucide-user', to: '/settings' }],
  [{ label: 'ອອກຈາກລະບົບ', icon: 'i-lucide-log-out', onSelect: () => { auth.logout(); router.push('/login') } }],
]
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-6">
    <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" @click="app.mobileSidebar = true">
      <UIcon name="i-lucide-menu" class="h-5 w-5" />
    </button>

    <div class="relative hidden max-w-md flex-1 md:block">
      <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="search"
        placeholder="ຄົ້ນຫາສິນຄ້າ, ຄຳສັ່ງຊື້, ລູກຄ້າ..."
        class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
        @keyup.enter="onSearch"
      />
    </div>

    <div class="ml-auto flex items-center gap-2">
      <NuxtLink to="/chat" class="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="ແຊັດ">
        <UIcon name="i-lucide-message-circle" class="h-5 w-5" />
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
      </NuxtLink>
      <NuxtLink to="/settings" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="ການຕັ້ງຄ່າ">
        <UIcon name="i-lucide-settings" class="h-5 w-5" />
      </NuxtLink>

      <UDropdownMenu :items="userItems" :popper="{ placement: 'bottom-end' }">
        <button class="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 hover:bg-slate-50">
          <img
            v-if="auth.user?.avatar"
            :src="avatarUrl(auth.user.avatar)"
            class="h-8 w-8 rounded-full object-cover"
            alt=""
          />
          <span v-else class="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {{ auth.initials }}
          </span>
          <span class="hidden text-left leading-tight sm:block">
            <span class="block text-sm font-semibold text-slate-800">{{ auth.user?.name }}</span>
            <span class="block text-[11px] text-slate-500">{{ auth.user?.email }}</span>
          </span>
          <UIcon name="i-lucide-chevron-down" class="h-4 w-4 text-slate-400" />
        </button>
      </UDropdownMenu>
    </div>
  </header>
</template>
