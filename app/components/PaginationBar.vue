<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
  total: number
  limit: number
  label?: string
}>()
const emit = defineEmits<{ (e: 'update:page', value: number): void }>()

const pages = computed(() => {
  const out: (number | string)[] = []
  const { page, totalPages } = props
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  out.push(1)
  if (page > 3) out.push('...')
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) out.push(i)
  if (page < totalPages - 2) out.push('...')
  out.push(totalPages)
  return out
})

const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1))
const to = computed(() => Math.min(props.page * props.limit, props.total))
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
    <p class="text-xs text-slate-500">
      ສະແດງ {{ from }}-{{ to }} ຈາກ {{ total }} {{ label ?? 'ລາຍການ' }}
    </p>
    <div class="flex items-center gap-1">
      <button
        class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        <UIcon name="i-lucide-chevron-left" class="h-4 w-4" />
      </button>
      <button
        v-for="(p, i) in pages"
        :key="i"
        class="grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-medium transition"
        :class="[
          p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          p === '...' ? 'pointer-events-none border-transparent' : '',
        ]"
        @click="typeof p === 'number' && emit('update:page', p)"
      >
        {{ p }}
      </button>
      <button
        class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
