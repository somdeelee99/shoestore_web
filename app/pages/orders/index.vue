<script setup lang="ts">
import type { Order, OrderStatus } from '~/types'

const api = useApi()
const toast = useToast()
const { currency, date } = useFormat()
const { paymentMethod } = useStatus()

const loading = ref(true)
const rows = ref<Order[]>([])
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 1, statusCounts: {} as Record<string, number> })
const activeTab = ref<'' | OrderStatus>('')
const search = ref('')
const from = ref('')
const to = ref('')

const tabs = computed(() => [
  { id: '', label: 'ທັງໝົດ', count: Object.values(meta.value.statusCounts ?? {}).reduce((s, n) => s + n, 0) },
  { id: 'PENDING', label: 'ລໍຖ້າຢືນຢັນ', count: meta.value.statusCounts?.PENDING ?? 0 },
  { id: 'CONFIRMED', label: 'ຢືນຢັນແລ້ວ', count: meta.value.statusCounts?.CONFIRMED ?? 0 },
  { id: 'PACKING', label: 'ກຳລັງກຽມສົ່ງ', count: meta.value.statusCounts?.PACKING ?? 0 },
  { id: 'SHIPPING', label: 'ກຳລັງຂົນສົ່ງ', count: meta.value.statusCounts?.SHIPPING ?? 0 },
  { id: 'DELIVERED', label: 'ສຳເລັດ', count: meta.value.statusCounts?.DELIVERED ?? 0 },
  { id: 'CANCELLED', label: 'ຍົກເລີກ', count: meta.value.statusCounts?.CANCELLED ?? 0 },
])

async function load() {
  loading.value = true
  try {
    const res = await api.get<Order[]>('/admin/orders', {
      page: meta.value.page,
      limit: meta.value.limit,
      status: activeTab.value || undefined,
      search: search.value || undefined,
      from: from.value || undefined,
      to: to.value || undefined,
    })
    rows.value = res.data
    if (res.meta) meta.value = { ...meta.value, ...(res.meta as any) }
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(activeTab, () => { meta.value.page = 1; load() })
watch([from, to], () => { meta.value.page = 1; load() })
watch(search, useDebounceFn(() => { meta.value.page = 1; load() }, 400))
watch(() => meta.value.page, load)

async function quickStatus(o: Order, status: OrderStatus) {
  await api.patch(`/admin/orders/${o.id}/status`, { status })
  toast.add({ title: 'ອັບເດດສະຖານະແລ້ວ', color: 'success' })
  load()
}

const statusActions = [
  { label: 'ຢືນຢັນຄຳສັ່ງຊື້', status: 'CONFIRMED' },
  { label: 'ກຳລັງກຽມສົ່ງ', status: 'PACKING' },
  { label: 'ສົ່ງໃຫ້ຂົນສົ່ງ', status: 'SHIPPING' },
  { label: 'ສົ່ງສຳເລັດ', status: 'DELIVERED' },
  { label: 'ຍົກເລີກ', status: 'CANCELLED' },
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ຄຳສັ່ງຊື້</h1>
        <p class="page-subtitle">ຈັດການ ແລະ ຕິດຕາມຄຳສັ່ງຊື້ທັງໝົດ</p>
      </div>
      <UButton icon="i-lucide-printer" color="neutral" variant="soft">ພິມໃບສົ່ງສິນຄ້າ</UButton>
    </div>

    <div class="card">
      <div class="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-medium transition"
          :class="activeTab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          @click="activeTab = t.id as any"
        >
          {{ t.label }}
          <span class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{{ t.count }}</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div class="relative min-w-[200px] flex-1">
          <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="search" placeholder="ຄົ້ນຫາເລກທີ, ຊື່ລູກຄ້າ, ເບີໂທ..." class="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <div class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
          <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-400" />
          <input v-model="from" type="date" class="bg-transparent outline-none" />
          <span class="text-slate-300">—</span>
          <input v-model="to" type="date" class="bg-transparent outline-none" />
        </div>
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" @click="load">ໂຫລດໃໝ່</UButton>
      </div>

      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th class="w-10"><input type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300" /></th>
              <th>ເລກທີ</th>
              <th>ລູກຄ້າ</th>
              <th>ສິນຄ້າ</th>
              <th>ຍອດລວມ</th>
              <th>ຊຳລະ</th>
              <th>ສະຖານະ</th>
              <th>ວັນທີ</th>
              <th class="w-20">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 6" :key="i"><td colspan="9"><div class="h-12 animate-pulse rounded bg-slate-100" /></td></tr>
            </template>
            <tr v-for="o in rows" v-else :key="o.id">
              <td><input type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300" /></td>
              <td>
                <NuxtLink :to="`/orders/${o.id}`" class="font-semibold text-brand-600 hover:underline">#{{ o.code }}</NuxtLink>
              </td>
              <td>
                <p class="text-xs font-medium text-slate-800">{{ o.customer?.name ?? o.recipient }}</p>
                <p class="text-[11px] text-slate-400">{{ o.phone }}</p>
              </td>
              <td class="text-xs text-slate-600">{{ o.itemCount ?? o.items?.length ?? 0 }} ລາຍການ</td>
              <td class="font-semibold text-slate-800">{{ currency(o.total) }}</td>
              <td class="text-xs text-slate-600">{{ paymentMethod(o.paymentMethod) }}</td>
              <td><StatusBadge :status="o.status" /></td>
              <td class="whitespace-nowrap text-xs text-slate-500">{{ date(o.createdAt) }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <UDropdownMenu :items="[statusActions.map((a) => ({ label: a.label, onSelect: () => quickStatus(o, a.status as OrderStatus) }))]">
                    <button class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><UIcon name="i-lucide-more-horizontal" class="h-4 w-4" /></button>
                  </UDropdownMenu>
                  <NuxtLink :to="`/orders/${o.id}`" class="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50"><UIcon name="i-lucide-eye" class="h-4 w-4" /></NuxtLink>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length"><td colspan="9"><EmptyState title="ບໍ່ພົບຄຳສັ່ງຊື້" /></td></tr>
          </tbody>
        </table>
      </div>

      <PaginationBar v-model:page="meta.page" :total-pages="meta.totalPages" :total="meta.total" :limit="meta.limit" label="ຄຳສັ່ງຊື້" />
    </div>
  </div>
</template>
