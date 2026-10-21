<script setup lang="ts">
import type { OrderStatus } from '~/types'

const props = defineProps<{ status: OrderStatus | string; type?: 'order' | 'payment' | 'active' | 'stock' | 'coupon' }>()

const style = computed(() => {
  const { orderMeta, paymentMeta } = useStatus()
  if (props.type === 'payment') {
    const m = paymentMeta(props.status)
    const map: Record<string, string> = {
      success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      warning: 'bg-amber-50 text-amber-700 ring-amber-200',
      error: 'bg-rose-50 text-rose-700 ring-rose-200',
      neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
    }
    return { label: m.label, cls: map[m.color] ?? map.neutral }
  }
  if (props.type === 'active') {
    return props.status === 'ACTIVE' || props.status === 'true'
      ? { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
      : { label: 'Blocked', cls: 'bg-rose-50 text-rose-700 ring-rose-200' }
  }
  if (props.type === 'stock') {
    const map: Record<string, { label: string; cls: string }> = {
      IN_STOCK: { label: 'ມີສິນຄ້າ', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
      LOW_STOCK: { label: 'ໃກ້ໝົດ', cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
      OUT_OF_STOCK: { label: 'ໝົດ', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
    }
    return map[props.status] ?? { label: props.status, cls: 'bg-slate-100 text-slate-600 ring-slate-200' }
  }
  if (props.type === 'coupon') {
    return props.status
      ? { label: 'ໃຊ້ງານໄດ້', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
      : { label: 'ໝົດອາຍຸ', cls: 'bg-slate-100 text-slate-500 ring-slate-200' }
  }
  const m = orderMeta(props.status as OrderStatus)
  const map: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
    primary: 'bg-orange-50 text-orange-700 ring-orange-200',
    error: 'bg-rose-50 text-rose-700 ring-rose-200',
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  }
  return { label: m.label, cls: map[m.color] ?? map.neutral }
})
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset" :class="style.cls">
    {{ style.label }}
  </span>
</template>
