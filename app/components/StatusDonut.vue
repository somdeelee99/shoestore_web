<script setup lang="ts">
const props = defineProps<{ data: { status: string; count: number }[] }>()

const COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#0ea5e9',
  PACKING: '#6366f1',
  SHIPPING: '#f97316',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
}

const total = computed(() => props.data.reduce((s, d) => s + d.count, 0))

const option = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['62%', '86%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
      label: { show: false },
      data: props.data.map((d) => ({
        name: ORDER_LABEL[d.status] ?? d.status,
        value: d.count,
        itemStyle: { color: COLORS[d.status] },
      })),
    },
  ],
}))

const ORDER_LABEL = useStatus().orderMeta
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="relative h-[150px] w-[150px]">
      <VChart :option="option" autoresize class="h-full w-full" />
      <div class="pointer-events-none absolute inset-0 grid place-items-center">
        <div class="text-center">
          <p class="text-2xl font-bold text-slate-900">{{ total }}</p>
          <p class="text-[10px] text-slate-500">ຄຳສັ່ງຊື້ທັງໝົດ</p>
        </div>
      </div>
    </div>
    <ul class="flex-1 space-y-1.5">
      <li v-for="d in data" :key="d.status" class="flex items-center gap-2 text-[11px]">
        <span class="h-2 w-2 rounded-full" :style="{ background: COLORS[d.status] }" />
        <span class="flex-1 text-slate-600">{{ ORDER_LABEL(d.status as any).label }}</span>
        <span class="font-semibold text-slate-700">{{ total ? Math.round((d.count / total) * 100) : 0 }}%</span>
      </li>
    </ul>
  </div>
</template>
