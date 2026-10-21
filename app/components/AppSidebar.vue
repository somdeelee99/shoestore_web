<script setup lang="ts">
const route = useRoute()
const app = useAppStore()

const items = [
  { label: 'ໜ້າຫຼັກ', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'ສິນຄ້າ', icon: 'i-lucide-footprints', to: '/products' },
  { label: 'ປະເພດສິນຄ້າ', icon: 'i-lucide-tags', to: '/categories' },
  { label: 'ຄຳສັ່ງຊື້', icon: 'i-lucide-shopping-bag', to: '/orders' },
  { label: 'ລູກຄ້າ', icon: 'i-lucide-users', to: '/customers' },
  { label: 'ສະຕັ້ອກສິນຄ້າ', icon: 'i-lucide-warehouse', to: '/inventory' },
  { label: 'ໂປຣໂມຊັ່ນ', icon: 'i-lucide-badge-percent', to: '/promotions' },
  { label: 'ລາຍງານ', icon: 'i-lucide-bar-chart-3', to: '/reports' },
  { label: 'ແຊັດສະພອດ', icon: 'i-lucide-messages-square', to: '/chat' },
  { label: 'ຕັ້ງຄ່າ', icon: 'i-lucide-settings', to: '/settings' },
]

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const auth = useAuthStore()
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#111827] transition-transform duration-300 lg:static lg:translate-x-0"
    :class="[
      app.mobileSidebar ? 'translate-x-0' : '-translate-x-full',
      app.sidebarOpen ? 'lg:w-64' : 'lg:w-64',
    ]"
  >
    <div class="flex h-16 items-center justify-between px-5">
      <AppLogo />
      <button class="text-slate-400 lg:hidden" @click="app.mobileSidebar = false">
        <UIcon name="i-lucide-x" class="h-5 w-5" />
      </button>
    </div>

    <nav class="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-6">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition"
        :class="isActive(item.to) ? 'bg-brand-600 text-white shadow-lg shadow-red-900/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'"
        @click="app.mobileSidebar = false"
      >
        <UIcon :name="item.icon" class="h-[18px] w-[18px]" />
        <span>{{ item.label }}</span>
        <span v-if="item.to === '/chat'" class="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
      </NuxtLink>
    </nav>

    <div class="mx-3 mb-4 rounded-xl bg-white/5 p-3">
      <div class="flex items-center gap-2.5">
        <div class="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {{ auth.initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-white">{{ auth.user?.name ?? 'Admin' }}</p>
          <p class="truncate text-[11px] text-slate-400">{{ auth.user?.role === 'ADMIN' ? 'ຜູ້ດູແລລະບົບ' : 'ພະນັກງານ' }}</p>
        </div>
        <button class="text-slate-400 hover:text-white" title="ອອກຈາກລະບົບ" @click="auth.logout(); navigateTo('/login')">
          <UIcon name="i-lucide-log-out" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
