<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  growth?: number
  icon: string
  tone?: 'blue' | 'green' | 'orange' | 'purple'
  hint?: string
}>()

const tones: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-violet-50 text-violet-600',
}
</script>

<template>
  <div class="stat-card">
    <div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl" :class="tones[props.tone ?? 'blue']">
      <UIcon :name="props.icon" class="h-6 w-6" />
    </div>
    <div class="min-w-0">
      <p class="text-xs font-medium text-slate-500">{{ props.label }}</p>
      <p class="mt-0.5 truncate text-xl font-bold text-slate-900">{{ props.value }}</p>
      <p v-if="props.growth !== undefined" class="mt-0.5 flex items-center gap-1 text-[11px]">
        <UIcon
          :name="props.growth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          class="h-3 w-3"
          :class="props.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'"
        />
        <span :class="props.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{ Math.abs(props.growth) }}%</span>
        <span class="text-slate-400">{{ props.hint ?? 'ທຽບເດືອນກ່ອນ' }}</span>
      </p>
    </div>
  </div>
</template>
