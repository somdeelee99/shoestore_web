<script setup lang="ts">
import type { Product } from '~/types'

const api = useApi()
const route = useRoute()
const toast = useToast()
const { currency, dateTime } = useFormat()
const asset = useAssetUrl()

const product = ref<Product & { reviews?: any[] } | null>(null)
const activeImage = ref(0)
const tab = ref<'desc' | 'specs' | 'reviews'>('desc')
const confirmOpen = ref(false)
const deleting = ref(false)

async function load() {
  const res = await api.get<any>(`/admin/products/${route.params.id}`)
  product.value = res.data
}

onMounted(load)

async function remove() {
  deleting.value = true
  try {
    await api.del(`/admin/products/${route.params.id}`)
    toast.add({ title: 'ລຶບສຳເລັດ', color: 'success' })
    navigateTo('/products')
  } finally {
    deleting.value = false
  }
}

const discount = computed(() => {
  const p = product.value
  if (!p?.comparePrice) return 0
  return Math.round(((Number(p.comparePrice) - Number(p.price)) / Number(p.comparePrice)) * 100)
})
</script>

<template>
  <div v-if="!product" class="card p-6">
    <div class="h-64 animate-pulse rounded-xl bg-slate-100" />
  </div>

  <div v-else class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <UButton to="/products" icon="i-lucide-arrow-left" color="neutral" variant="ghost" />
        <h1 class="page-title">ລາຍລະອຽດສິນຄ້າ</h1>
      </div>
      <div class="flex gap-2">
        <UButton :to="`/products/${product.id}/edit`" icon="i-lucide-pencil">ແກ້ໄຂ</UButton>
        <UButton color="error" variant="soft" icon="i-lucide-trash-2" @click="confirmOpen = true">ລຶບ</UButton>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-5">
      <!-- gallery -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="relative aspect-square bg-slate-50">
            <img v-if="product.images?.[activeImage]" :src="asset(product.images[activeImage].url)" :alt="product.name" class="h-full w-full object-cover" />
            <span v-if="discount" class="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">-{{ discount }}%</span>
          </div>
          <div class="flex gap-2 p-3">
            <button
              v-for="(img, i) in product.images"
              :key="img.id"
              class="h-16 w-16 overflow-hidden rounded-xl ring-2 transition"
              :class="i === activeImage ? 'ring-brand-500' : 'ring-transparent hover:ring-slate-200'"
              @click="activeImage = i"
            >
              <img :src="asset(img.url)" class="h-full w-full object-cover" alt="" />
            </button>
          </div>
        </div>
      </div>

      <!-- info -->
      <div class="space-y-4 lg:col-span-3">
        <div class="card p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-slate-500">{{ product.brand }} · {{ product.sku }}</p>
              <h2 class="mt-0.5 text-xl font-bold text-slate-900">{{ product.name }}</h2>
            </div>
            <StatusBadge :status="product.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'" type="active" />
          </div>

          <div class="mt-3 flex flex-wrap items-end gap-3">
            <span class="text-2xl font-bold text-brand-600">{{ currency(product.price) }}</span>
            <span v-if="product.comparePrice" class="text-sm text-slate-400 line-through">{{ currency(product.comparePrice) }}</span>
            <span v-if="discount" class="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">-{{ discount }}%</span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-[11px] text-slate-500">ຂາຍໄດ້ທັງໝົດ</p>
              <p class="mt-0.5 font-bold text-slate-800">{{ product.soldCount }} ຄູ່</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-[11px] text-slate-500">ສະຕັອກລວມ</p>
              <p class="mt-0.5 font-bold text-slate-800">{{ product.variants.reduce((s, v) => s + v.stock, 0) }} ຄູ່</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-[11px] text-slate-500">ຄະແນນ</p>
              <p class="mt-0.5 flex items-center gap-1 font-bold text-slate-800">
                <UIcon name="i-lucide-star" class="h-4 w-4 text-amber-500" />
                {{ product.rating.toFixed(1) }} <span class="text-xs font-normal text-slate-400">({{ product.reviewCount }})</span>
              </p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-[11px] text-slate-500">ອັບເດດລ່າສຸດ</p>
              <p class="mt-0.5 font-semibold text-slate-800">{{ dateTime(product.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex border-b border-slate-100">
            <button
              v-for="t in [
                { id: 'desc', label: 'ລາຍລະອຽດ' },
                { id: 'specs', label: 'ຕົວແປ / ຂະໜາດ' },
                { id: 'reviews', label: 'ຣີວິວ' },
              ]"
              :key="t.id"
              class="px-4 py-3 text-sm font-medium transition"
              :class="tab === t.id ? 'border-b-2 border-brand-600 text-brand-600' : 'text-slate-500 hover:text-slate-800'"
              @click="tab = t.id as any"
            >
              {{ t.label }}
            </button>
          </div>

          <div class="p-5 text-sm text-slate-600">
            <p v-if="tab === 'desc'" class="whitespace-pre-line leading-relaxed">{{ product.description || 'ບໍ່ມີລາຍລະອຽດ' }}</p>

            <div v-else-if="tab === 'specs'" class="table-wrap">
              <table class="table-base">
                <thead><tr><th>ຂະໜາດ</th><th>ສີ</th><th>SKU</th><th>ລາຄາ</th><th>ສະຕັອກ</th></tr></thead>
                <tbody>
                  <tr v-for="v in product.variants" :key="v.id">
                    <td>{{ v.size }}</td>
                    <td>
                      <span class="inline-flex items-center gap-1.5">
                        <span class="h-3 w-3 rounded-full ring-1 ring-slate-200" :style="{ background: v.colorHex }" />{{ v.color }}
                      </span>
                    </td>
                    <td class="text-xs text-slate-500">{{ v.sku }}</td>
                    <td>{{ currency(v.price) }}</td>
                    <td>{{ v.stock }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="space-y-3">
              <div v-for="r in product.reviews ?? []" :key="r.id" class="rounded-xl border border-slate-100 p-3">
                <div class="flex items-center gap-2">
                  <span class="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">{{ r.user?.name?.slice(0, 1) }}</span>
                  <span class="text-xs font-medium text-slate-700">{{ r.user?.name }}</span>
                  <span class="ml-auto flex text-amber-500">
                    <UIcon v-for="s in r.rating" :key="s" name="i-lucide-star" class="h-3.5 w-3.5" />
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-600">{{ r.comment }}</p>
              </div>
              <p v-if="!product.reviews?.length" class="text-center text-xs text-slate-400">ຍັງບໍ່ມີຣີວິວ</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal v-model:open="confirmOpen" danger title="ລຶບສິນຄ້າ?" description="ການລຶບບໍ່ສາມາດກູ້ຄືນໄດ້" :loading="deleting" @confirm="remove" />
  </div>
</template>
