<script setup lang="ts">
import type { DashboardData } from '~/types'

const api = useApi()
const { currency, number, date } = useFormat()
const { orderMeta } = useStatus()
const asset = useAssetUrl()

const range = ref({ from: '', to: '' })
const preset = ref<'today' | '7d' | '30d' | 'custom'>('30d')
const data = ref<DashboardData | null>(null)
const loading = ref(true)

function applyPreset(p: typeof preset.value) {
  preset.value = p
  const now = new Date()
  const to = now.toISOString().slice(0, 10)
  const from = new Date(now)
  if (p === 'today') from.setTime(now.getTime())
  else if (p === '7d') from.setDate(now.getDate() - 6)
  else from.setDate(now.getDate() - 29)
  range.value = { from: from.toISOString().slice(0, 10), to }
  load()
}

async function load() {
  loading.value = true
  try {
    const res = await api.get<DashboardData>('/admin/dashboard', range.value)
    data.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => applyPreset('30d'))

const kpis = computed(() => [
  {
    label: 'ຍອດຂາຍລວມ',
    value: data.value ? currency(data.value.kpis.revenue.value) : '-',
    growth: data.value?.kpis.revenue.growth,
    icon: 'i-lucide-banknote',
    tone: 'blue' as const,
  },
  {
    label: 'ຄຳສັ່ງຊື້',
    value: data.value ? number(data.value.kpis.orders.value) : '-',
    growth: data.value?.kpis.orders.growth,
    icon: 'i-lucide-shopping-cart',
    tone: 'green' as const,
  },
  {
    label: 'ລໍຖ້າຢືນຢັນ',
    value: data.value ? number(data.value.kpis.pendingOrders) : '-',
    hint: 'ຕ້ອງດຳເນີນການ',
    icon: 'i-lucide-clock',
    tone: 'orange' as const,
  },
  {
    label: 'ສິນຄ້າທັງໝົດ',
    value: data.value ? number(data.value.kpis.products.value) : '-',
    hint: 'ລາຍການສິນຄ້າ',
    icon: 'i-lucide-package',
    tone: 'purple' as const,
  },
])
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ແດຊະບອດ</h1>
        <p class="page-subtitle">ພາບລວມການດຳເນີນງານຂອງຮ້ານ</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            v-for="p in [
              { id: 'today', label: 'ມື້ນີ້' },
              { id: '7d', label: '7 ວັນ' },
              { id: '30d', label: '30 ວັນ' },
            ]"
            :key="p.id"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
            :class="preset === p.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
            @click="applyPreset(p.id as any)"
          >
            {{ p.label }}
          </button>
        </div>
        <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-400" />
          <input v-model="range.from" type="date" class="bg-transparent outline-none" @change="load" />
          <span class="text-slate-300">—</span>
          <input v-model="range.to" type="date" class="bg-transparent outline-none" @change="load" />
        </div>
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" :loading="loading" @click="load">ໂຫລດໃໝ່</UButton>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="loading && !data">
        <div v-for="i in 4" :key="i" class="stat-card animate-pulse">
          <div class="h-12 w-12 rounded-xl bg-slate-200" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-24 rounded bg-slate-200" />
            <div class="h-5 w-32 rounded bg-slate-200" />
          </div>
        </div>
      </template>
      <StatCard v-for="k in kpis" v-else :key="k.label" v-bind="k" />
    </div>

    <!-- Charts -->
    <div class="grid gap-4 xl:grid-cols-3">
      <div class="card p-5 xl:col-span-2">
        <div class="mb-2 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-slate-800">ຍອດຂາຍລາຍວັນ</h2>
            <p class="text-xs text-slate-500">{{ range.from }} ຫາ {{ range.to }}</p>
          </div>
          <span class="rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-500">LAK</span>
        </div>
        <RevenueChart v-if="data" :data="data.revenueChart" />
        <div v-else class="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div class="card p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-slate-800">ສັດສ່ວນຄຳສັ່ງຊື້</h2>
            <p class="text-xs text-slate-500">ແຍກຕາມສະຖານະ</p>
          </div>
          <NuxtLink to="/orders" class="text-[11px] font-medium text-brand-600 hover:underline">ເບິ່ງທັງໝົດ</NuxtLink>
        </div>
        <StatusDonut v-if="data" :data="data.orderStatusDistribution" />
        <div v-else class="h-[150px] animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>

    <!-- Bottom -->
    <div class="grid gap-4 xl:grid-cols-2">
      <div class="card">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 class="text-sm font-semibold text-slate-800">ສິນຄ້າຂາຍດີ</h2>
            <p class="text-xs text-slate-500">5 ອັນດັບທຳອິດໃນໄລຍະນີ້</p>
          </div>
          <UIcon name="i-lucide-flame" class="h-5 w-5 text-orange-500" />
        </div>
        <ul class="divide-y divide-slate-100">
          <li v-for="(p, i) in data?.topProducts ?? []" :key="p.productId" class="flex items-center gap-3 px-5 py-3">
            <span class="w-4 text-xs font-bold text-slate-400">{{ i + 1 }}</span>
            <ProductThumb :src="p.thumbnail" :name="p.name" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-slate-800">{{ p.name }}</p>
              <p class="text-[11px] text-slate-500">ຂາຍໄດ້ {{ p.quantity }} ຄູ່</p>
            </div>
            <span class="text-sm font-semibold text-slate-700">{{ currency(p.revenue) }}</span>
          </li>
          <li v-if="data && !data.topProducts.length" class="px-5 py-10 text-center text-sm text-slate-400">ຍັງບໍ່ມີຂໍ້ມູນ</li>
        </ul>
      </div>

      <div class="card">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 class="text-sm font-semibold text-slate-800">ຄຳສັ່ງຊື້ຫຼ້າສຸດ</h2>
            <p class="text-xs text-slate-500">ອັບເດດລ່າສຸດ</p>
          </div>
          <NuxtLink to="/orders" class="text-[11px] font-medium text-brand-600 hover:underline">ເບິ່ງທັງໝົດ</NuxtLink>
        </div>
        <div class="table-wrap">
          <table class="table-base">
            <thead>
              <tr>
                <th>ເລກທີ</th>
                <th>ລູກຄ້າ</th>
                <th>ຍອດລວມ</th>
                <th>ສະຖານະ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in data?.recentOrders ?? []" :key="o.id">
                <td>
                  <NuxtLink :to="`/orders/${o.id}`" class="font-medium text-brand-600 hover:underline">#{{ o.code.slice(-6) }}</NuxtLink>
                  <p class="text-[11px] text-slate-400">{{ date(o.createdAt) }}</p>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <img v-if="o.customer?.avatar" :src="asset(o.customer.avatar)" class="h-7 w-7 rounded-full object-cover" alt="" />
                    <span v-else class="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                      {{ o.customer?.name?.slice(0, 1) ?? '?' }}
                    </span>
                    <span class="text-xs">{{ o.customer?.name ?? o.recipient }}</span>
                  </div>
                </td>
                <td class="font-semibold">{{ currency(o.total) }}</td>
                <td><StatusBadge :status="o.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- category distribution -->
    <div class="card p-5">
      <h2 class="mb-4 text-sm font-semibold text-slate-800">ສິນຄ້າແຍກຕາມໝວດໝູ່</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="c in data?.categoryDistribution ?? []" :key="c.category" class="rounded-xl border border-slate-100 p-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-slate-700">{{ c.category }}</span>
            <span class="text-slate-500">{{ c.count }}</span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-brand-500"
              :style="{
                width: `${Math.min(100, (c.count / Math.max(...(data?.categoryDistribution.map((x) => x.count) ?? [1]))) * 100)}%`,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
