<script setup lang="ts">
const api = useApi()
const config = useRuntimeConfig()
const auth = useAuthStore()
const { currency, number, date } = useFormat()

const from = ref(new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10))
const to = ref(new Date().toISOString().slice(0, 10))
const groupBy = ref<'day' | 'month'>('day')
const loading = ref(true)
const revenue = ref<{ period: string; revenue: number; orders: number; items: number }[]>([])
const byCategory = ref<{ category: string; revenue: number }[]>([])
const dashboard = ref<any>(null)

async function load() {
  loading.value = true
  try {
    const [r, c, d] = await Promise.all([
      api.get<any[]>('/admin/reports/revenue', { from: from.value, to: to.value, groupBy: groupBy.value }),
      api.get<any[]>('/admin/reports/sales-by-category', { from: from.value, to: to.value }),
      api.get<any>('/admin/dashboard', { from: from.value, to: to.value }),
    ])
    revenue.value = r.data
    byCategory.value = c.data
    dashboard.value = d.data
  } finally {
    loading.value = false
  }
}
onMounted(load)

const totals = computed(() => ({
  revenue: revenue.value.reduce((s, r) => s + r.revenue, 0),
  orders: revenue.value.reduce((s, r) => s + r.orders, 0),
  items: revenue.value.reduce((s, r) => s + r.items, 0),
}))

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, icon: 'circle', textStyle: { fontSize: 11, color: '#64748b' } },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: byCategory.value.map((c) => ({ name: c.category, value: c.revenue })),
      color: ['#e11d2a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
    },
  ],
}))

async function exportCsv() {
  const url = `${config.public.apiBase}/admin/reports/export?from=${from.value}&to=${to.value}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${auth.token}` } })
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `revenue-${from.value}-${to.value}.csv`
  link.click()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ລາຍງານ</h1>
        <p class="page-subtitle">ວິເຄາະຍອດຂາຍ ແລະ ປະສິດທິພາບຮ້ານ</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
          <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-400" />
          <input v-model="from" type="date" class="bg-transparent outline-none" @change="load" />
          <span class="text-slate-300">—</span>
          <input v-model="to" type="date" class="bg-transparent outline-none" @change="load" />
        </div>
        <select v-model="groupBy" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs" @change="load">
          <option value="day">ລາຍວັນ</option>
          <option value="month">ລາຍເດືອນ</option>
        </select>
        <UButton icon="i-lucide-download" color="neutral" variant="soft" @click="exportCsv">CSV</UButton>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ຍອດຂາຍລວມ" :value="currency(totals.revenue)" :growth="dashboard?.kpis.revenue.growth"
        icon="i-lucide-banknote" tone="blue" />
      <StatCard label="ຄຳສັ່ງຊື້" :value="number(totals.orders)" :growth="dashboard?.kpis.orders.growth"
        icon="i-lucide-shopping-cart" tone="green" />
      <StatCard label="ສິນຄ້າທີ່ຂາຍ" :value="number(totals.items)" icon="i-lucide-package" tone="orange" hint="ຄູ່" />
      <StatCard label="ລູກຄ້າທັງໝົດ" :value="number(dashboard?.kpis.customers.value ?? 0)" icon="i-lucide-users"
        tone="purple" hint="ສະສົມ" />
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <div class="card p-5 xl:col-span-2">
        <h2 class="mb-3 text-sm font-semibold text-slate-800">ລາຍຮັບຕາມໄລຍະເວລາ</h2>
        <RevenueChart v-if="dashboard" :data="dashboard.revenueChart" class="block h-64 w-full" />
        <div v-else class="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div class="card p-5">
        <h2 class="mb-3 text-sm font-semibold text-slate-800">ຍອດຂາຍຕາມໝວດໝູ່</h2>
        <VChart v-if="byCategory.length" :option="pieOption" autoresize class="h-64 w-full" />
        <div v-else class="grid h-64 place-items-center text-xs text-slate-400">ຍັງບໍ່ມີຂໍ້ມູນ</div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 class="text-sm font-semibold text-slate-800">ຕາຕະລາງລາຍຮັບ</h2>
        <span class="text-xs text-slate-500">{{ revenue.length }} ແຖວ</span>
      </div>
      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th>ໄລຍະ</th>
              <th>ຈຳນວນຄຳສັ່ງຊື້</th>
              <th>ສິນຄ້າທີ່ຂາຍ</th>
              <th>ລາຍຮັບ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in revenue" :key="r.period">
              <td class="text-xs font-medium">{{ r.period }}</td>
              <td class="text-xs">{{ r.orders }}</td>
              <td class="text-xs">{{ r.items }}</td>
              <td class="text-xs font-semibold text-slate-800">{{ currency(r.revenue) }}</td>
            </tr>
            <tr v-if="!revenue.length">
              <td colspan="4">
                <EmptyState title="ບໍ່ມີຂໍ້ມູນໃນໄລຍະນີ້" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-sm font-semibold text-slate-800">ສິນຄ້າຂາຍດີ</h2>
      </div>
      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th>#</th>
              <th>ສິນຄ້າ</th>
              <th>ຂາຍໄດ້</th>
              <th>ລາຍຮັບ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in dashboard?.topProducts ?? []" :key="p.productId">
              <td class="text-slate-400">{{ i + 1 }}</td>
              <td>
                <div class="flex items-center gap-2.5">
                  <ProductThumb :src="p.thumbnail" :name="p.name" size="sm" />
                  <span class="text-xs font-medium">{{ p.name }}</span>
                </div>
              </td>
              <td class="text-xs">{{ p.quantity }}</td>
              <td class="text-xs font-semibold">{{ currency(p.revenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
