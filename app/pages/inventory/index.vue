<script setup lang="ts">
import type { InventoryRow } from '~/types'

const api = useApi()
const toast = useToast()
const { currency } = useFormat()

const rows = ref<InventoryRow[]>([])
const loading = ref(true)
const search = ref('')
const lowOnly = ref(false)
const summary = ref<any>(null)
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

const adjustOpen = ref(false)
const target = ref<InventoryRow | null>(null)
const adjustForm = reactive({ type: 'IN' as 'IN' | 'OUT' | 'ADJUST', quantity: 1, note: '' })

async function load() {
  loading.value = true
  try {
    const [list, sum] = await Promise.all([
      api.get<InventoryRow[]>('/admin/inventory', {
        page: meta.value.page,
        limit: meta.value.limit,
        search: search.value || undefined,
        lowOnly: lowOnly.value ? 'true' : undefined,
      }),
      api.get<any>('/admin/inventory/summary'),
    ])
    rows.value = list.data
    summary.value = sum.data
    if (list.meta) meta.value = { ...meta.value, ...list.meta }
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(search, useDebounceFn(() => { meta.value.page = 1; load() }, 350))
watch(lowOnly, () => { meta.value.page = 1; load() })
watch(() => meta.value.page, load)

function openAdjust(row: InventoryRow) {
  target.value = row
  Object.assign(adjustForm, { type: 'IN', quantity: 1, note: '' })
  adjustOpen.value = true
}

async function doAdjust() {
  if (!target.value) return
  await api.post(`/admin/inventory/${target.value.id}/adjust`, adjustForm)
  toast.add({ title: 'ປັບປຸງສະຕັອກສຳເລັດ', color: 'success' })
  adjustOpen.value = false
  load()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ສະຕັ້ອກສິນຄ້າ</h1>
        <p class="page-subtitle">ຕິດຕາມ ແລະ ປັບປຸງຈຳນວນສິນຄ້າໃນສາງ</p>
      </div>
      <UButton icon="i-lucide-history" color="neutral" variant="soft" @click="navigateTo('/inventory')">ປະຫວັດການເຄື່ອນໄຫວ</UButton>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ຈຳນວນລວມໃນສາງ" :value="summary?.totalUnits ?? '-'" icon="i-lucide-boxes" tone="blue" hint="ຄູ່ທັງໝົດ" />
      <StatCard label="ມີສິນຄ້າ" :value="summary?.inStock ?? '-'" icon="i-lucide-package-check" tone="green" hint="ຕົວແປ" />
      <StatCard label="ໃກ້ໝົດ" :value="summary?.lowStock ?? '-'" icon="i-lucide-triangle-alert" tone="orange" hint="ເຫຼືອ ≤ 5" />
      <StatCard label="ໝົດສະຕັອກ" :value="summary?.outOfStock ?? '-'" icon="i-lucide-package-x" tone="purple" hint="ຕ້ອງເຕີມ" />
    </div>

    <div class="card">
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div class="relative min-w-[220px] flex-1">
          <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="search" placeholder="ຄົ້ນຫາສິນຄ້າ ຫຼື SKU..." class="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <label class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
          <input v-model="lowOnly" type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300 text-brand-600" />
          ສະເພາະໃກ້ໝົດ
        </label>
      </div>

      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th>ສິນຄ້າ</th>
              <th>ຂະໜາດ</th>
              <th>ສີ</th>
              <th>SKU</th>
              <th>ຈຳນວນ</th>
              <th>ລາຄາ</th>
              <th>ສະຖານະ</th>
              <th class="w-16">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 5" :key="i"><td colspan="8"><div class="h-12 animate-pulse rounded bg-slate-100" /></td></tr>
            </template>
            <tr v-for="v in rows" v-else :key="v.id">
              <td>
                <div class="flex items-center gap-3">
                  <ProductThumb :src="v.product.thumbnail" :name="v.product.name" />
                  <span class="text-xs font-medium text-slate-800">{{ v.product.name }}</span>
                </div>
              </td>
              <td class="text-xs">{{ v.size }}</td>
              <td>
                <span class="inline-flex items-center gap-1.5 text-xs">
                  <span class="h-3 w-3 rounded-full ring-1 ring-slate-200" :style="{ background: v.colorHex }" />{{ v.color }}
                </span>
              </td>
              <td class="text-[11px] text-slate-500">{{ v.sku }}</td>
              <td>
                <span class="rounded-lg px-2 py-0.5 text-xs font-bold" :class="v.stock === 0 ? 'bg-rose-50 text-rose-700' : v.stock <= 5 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'">{{ v.stock }}</span>
              </td>
              <td class="text-xs">{{ currency(v.price) }}</td>
              <td><StatusBadge :status="v.status" type="stock" /></td>
              <td>
                <button class="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50" title="ປັບປຸງ" @click="openAdjust(v)"><UIcon name="i-lucide-sliders-horizontal" class="h-4 w-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model:page="meta.page" :total-pages="meta.totalPages" :total="meta.total" :limit="meta.limit" label="ຕົວແປ" />
    </div>

    <UModal v-model:open="adjustOpen">
      <template #content>
        <div class="space-y-4 p-5">
          <h3 class="text-base font-semibold text-slate-900">ປັບປຸງສະຕັອກ</h3>
          <div v-if="target" class="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <ProductThumb :src="target.product.thumbnail" :name="target.product.name" />
            <div>
              <p class="text-sm font-medium text-slate-800">{{ target.product.name }}</p>
              <p class="text-[11px] text-slate-500">ເບີ {{ target.size }} · {{ target.color }} · ປັດຈຸບັນ {{ target.stock }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ປະເພດ</label>
              <select v-model="adjustForm.type" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                <option value="IN">ເພີ່ມເຂົ້າ (IN)</option>
                <option value="OUT">ຕັດອອກ (OUT)</option>
                <option value="ADJUST">ກຳນົດໃໝ່ (ADJUST)</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ຈຳນວນ</label>
              <UInput v-model.number="adjustForm.quantity" type="number" min="1" :ui="{ base: 'w-full' }" />
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ໝາຍເຫດ</label>
            <UInput v-model="adjustForm.note" placeholder="ເຫດຜົນການປັບປຸງ" :ui="{ base: 'w-full' }" />
          </div>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="soft" @click="adjustOpen = false">ຍົກເລີກ</UButton>
            <UButton @click="doAdjust">ບັນທຶກ</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
