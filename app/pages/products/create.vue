<script setup lang="ts">
const api = useApi()
const toast = useToast()
const router = useRouter()
const submitting = ref(false)

async function onSubmit(payload: any) {
  submitting.value = true
  try {
    const res = await api.post<{ id: string }>('/admin/products', payload)
    toast.add({ title: 'ເພີ່ມສິນຄ້າສຳເລັດ', color: 'success', icon: 'i-lucide-check-circle' })
    router.push(`/products/${res.data.id}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ProductForm :submitting="submitting" @submit="onSubmit" @cancel="router.push('/products')" />
</template>
