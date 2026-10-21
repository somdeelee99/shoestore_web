<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  loading?: boolean
  danger?: boolean
}>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'confirm'): void }>()
</script>

<template>
  <UModal :open="props.open" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-5">
        <div class="flex items-start gap-3">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full" :class="danger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'">
            <UIcon :name="danger ? 'i-lucide-trash-2' : 'i-lucide-alert-triangle'" class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ title ?? 'ຢືນຢັນການດຳເນີນການ' }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ description }}</p>
          </div>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <UButton color="neutral" variant="soft" @click="emit('update:open', false)">ຍົກເລີກ</UButton>
          <UButton :color="danger ? 'error' : 'primary'" :loading="loading" @click="emit('confirm')">
            {{ confirmLabel ?? 'ຢືນຢັນ' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
