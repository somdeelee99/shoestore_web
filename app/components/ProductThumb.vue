<script setup lang="ts">
const props = defineProps<{ src?: string | null; name?: string; size?: 'sm' | 'md' | 'lg' }>()
const asset = useAssetUrl()
const dims = computed(() => (props.size === 'lg' ? 'h-20 w-20' : props.size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'))
</script>

<template>
  <div class="shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70" :class="dims">
    <img v-if="src" :src="asset(src)" :alt="name" class="h-full w-full object-cover" loading="lazy" />
    <div v-else class="grid h-full w-full place-items-center text-slate-400">
      <UIcon name="i-lucide-image" class="h-5 w-5" />
    </div>
  </div>
</template>
