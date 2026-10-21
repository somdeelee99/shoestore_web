<script setup lang="ts">
import type { Category, Product } from '~/types'

const api = useApi()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { currency, date } = useFormat()

const loading = ref(true)
const rows = ref<Product[]>([])
const categories = ref<Category[]>([])
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })
const confirmOpen = ref(false)
const target = ref<Product | null>(null)
const deleting = ref(false)

const filters = reactive({
  search: (route.query.search as string) ?? '',
  categoryId: '',
  status: '',
  sort: 'createdAt',
  order: 'desc',
})

async function load() {
  loading.value = true
  try {
    const res = await api.get<Product[]>('/admin/products', { ...filters, page: meta.value.page, limit: meta.value.limit })
    rows.value = res.data
    if (res.meta) meta.value = { ...meta.value, ...res.meta }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const c = await api.get<Category[]>('/admin/categories')
  categories.value = c.data
  load()
})

watch(() => filters.search, useDebounceFn(() => { meta.value.page = 1; load() }, 350))
watch(
  () => [filters.categoryId, filters.status, filters.sort],
  () => { meta.value.page = 1; load() },
)
watch(() => meta.value.page, load)

function askDelete(p: Product) {
  target.value = p
  confirmOpen.value = true
}

async function doDelete() {
  if (!target.value) return
  deleting.value = true
  try {
    await api.del(`/admin/products/${target.value.id}`)
    toast.add({ title: 'ລຶບສິນຄ້າສຳເລັດ', color: 'success' })
    confirmOpen.value = false
    load()
  } finally {
    deleting.value = false
  }
}

async function toggleStatus(p: Product) {
  await api.patch(`/admin/products/${p.id}`, { status: p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' })
  toast.add({ title: 'ອັບເດດສະຖານະແລ້ວ', color: 'success' })
  load()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ສິນຄ້າ</h1>
        <p class="page-subtitle">ຈັດການລາຍການສິນຄ້າ ແລະ ຕົວແປທັງໝົດ</p>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-lucide-download" color="neutral" variant="soft" @click="navigateTo('/reports')">ສົ່ງອອກ</UButton>
        <UButton icon="i-lucide-plus" to="/products/create">ເພີ່ມສິນຄ້າ</UButton>
      </div>
    </div>

    <div class="card">
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div class="relative min-w-[220px] flex-1">
          <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="filters.search" placeholder="ຄົ້ນຫາຊື່ ຫຼື SKU..." class="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <select v-model="filters.categoryId" class="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="">ໝວດໝູ່ທັງໝົດ</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filters.status" class="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="">ສະຖານະທັງໝົດ</option>
          <option value="ACTIVE">ເປີດຂາຍ</option>
          <option value="DRAFT">ຮ່າງ</option>
        </select>
        <select v-model="filters.sort" class="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="createdAt">ໃໝ່ສຸດ</option>
          <option value="price">ລາຄາ</option>
          <option value="name">ຊື່</option>
        </select>
      </div>

      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th class="w-10">#</th>
              <th>ສິນຄ້າ</th>
              <th>ໝວດໝູ່</th>
              <th>ລາຄາ</th>
              <th>ສະຕັອກ</th>
              <th>ສະຖານະ</th>
              <th class="w-24">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 5" :key="i">
                <td colspan="7"><div class="h-12 animate-pulse rounded-lg bg-slate-100" /></td>
              </tr>
            </template>
            <tr v-for="(p, i) in rows" v-else :key="p.id">
              <td class="text-slate-400">{{ (meta.page - 1) * meta.limit + i + 1 }}</td>
              <td>
                <div class="flex items-center gap-3">
                  <ProductThumb :src="p.thumbnail" :name="p.name" />
                  <div class="min-w-0">
                    <NuxtLink :to="`/products/${p.id}`" class="block truncate font-medium text-slate-800 hover:text-brand-600">{{ p.name }}</NuxtLink>
                    <p class="text-[11px] text-slate-400">{{ p.sku }} · {{ p.brand }}</p>
                  </div>
                </div>
              </td>
              <td class="text-xs text-slate-600">{{ p.category?.name }}</td>
              <td>
                <p class="font-semibold text-slate-800">{{ currency(p.price) }}</p>
                <p v-if="p.comparePrice" class="text-[11px] text-slate-400 line-through">{{ currency(p.comparePrice) }}</p>
              </td>
              <td>
                <span class="rounded-lg px-2 py-1 text-xs font-semibold" :class="(p.stock ?? 0) > 5 ? 'bg-emerald-50 text-emerald-700' : (p.stock ?? 0) > 0 ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700'">
                  {{ p.stock ?? 0 }}
                </span>
              </td>
              <td>
                <button @click="toggleStatus(p)">
                  <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset" :class="p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'">
                    <span class="h-1.5 w-1.5 rounded-full" :class="p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'" />
                    {{ p.status === 'ACTIVE' ? 'ເປີດຂາຍ' : 'ຮ່າງ' }}
                  </span>
                </button>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <NuxtLink :to="`/products/${p.id}/edit`" class="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50" title="ແກ້ໄຂ">
                    <UIcon name="i-lucide-pencil" class="h-4 w-4" />
                  </NuxtLink>
                  <button class="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" title="ລຶບ" @click="askDelete(p)">
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="7">
                <EmptyState title="ບໍ່ພົບສິນຄ້າ" description="ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເພີ່ມສິນຄ້າໃໝ່">
                  <UButton to="/products/create" icon="i-lucide-plus" class="mt-2">ເພີ່ມສິນຄ້າ</UButton>
                </EmptyState>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <PaginationBar
        v-model:page="meta.page"
        :total-pages="meta.totalPages"
        :total="meta.total"
        :limit="meta.limit"
        label="ສິນຄ້າ"
      />
    </div>

    <ConfirmModal
      v-model:open="confirmOpen"
      danger
      title="ລຶບສິນຄ້າ?"
      :description="`ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບ “${target?.name}” ອອກຈາກລະບົບ?`"
      :loading="deleting"
      confirm-label="ລຶບ"
      @confirm="doDelete"
    />
  </div>
</template>
