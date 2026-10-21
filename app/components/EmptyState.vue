<script setup lang="ts">
defineProps<{ icon?: string; title: string; description?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-14 text-center">
    <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
      <UIcon :name="icon ?? 'i-lucide-package-open'" class="h-7 w-7" />
    </div>
    <p class="text-sm font-semibold text-slate-700">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-xs text-slate-500">{{ description }}</p>
    <slot />
  </div>
</template>
