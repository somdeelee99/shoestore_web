<script setup lang="ts">
import type { Product } from '~/types'

const api = useApi()
const toast = useToast()
const router = useRouter()
const route = useRoute()
const product = ref<Product | null>(null)
const submitting = ref(false)

onMounted(async () => {
  const res = await api.get<Product>(`/admin/products/${route.params.id}`)
  product.value = res.data
})

async function onSubmit(payload: any) {
  submitting.value = true
  try {
    await api.patch(`/admin/products/${route.params.id}`, payload)
    toast.add({ title: 'ບັນທຶກການແກ້ໄຂສຳເລັດ', color: 'success' })
    router.push(`/products/${route.params.id}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="!product" class="card space-y-3 p-6">
    <div class="h-6 w-48 animate-pulse rounded bg-slate-100" />
    <div class="h-40 animate-pulse rounded-xl bg-slate-100" />
  </div>
  <ProductForm v-else :product="product" :submitting="submitting" @submit="onSubmit" />
</template>
