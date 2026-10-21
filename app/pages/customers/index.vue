<script setup lang="ts">
import type { Customer } from '~/types'

const api = useApi()
const toast = useToast()
const { currency, date } = useFormat()
const asset = useAssetUrl()

const rows = ref<Customer[]>([])
const loading = ref(true)
const search = ref('')
const status = ref('')
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })
const selected = ref<Customer | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await api.get<Customer[]>('/admin/customers', {
      page: meta.value.page,
      limit: meta.value.limit,
      search: search.value || undefined,
      status: status.value || undefined,
    })
    rows.value = res.data
    if (res.meta) meta.value = { ...meta.value, ...res.meta }
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(search, useDebounceFn(() => { meta.value.page = 1; load() }, 350))
watch([status], () => { meta.value.page = 1; load() })
watch(() => meta.value.page, load)

async function toggle(c: Customer) {
  await api.patch(`/admin/customers/${c.id}/status`, { status: c.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' })
  toast.add({ title: 'ອັບເດດສະຖານະບັນຊີແລ້ວ', color: 'success' })
  load()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ລູກຄ້າ</h1>
        <p class="page-subtitle">ຂໍ້ມູນລູກຄ້າທັງໝົດທີ່ລົງທະບຽນຜ່ານແອັບ</p>
      </div>
      <UButton icon="i-lucide-user-plus" color="neutral" variant="soft">ເພີ່ມລູກຄ້າ</UButton>
    </div>

    <div class="card">
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div class="relative min-w-[220px] flex-1">
          <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="search" placeholder="ຄົ້ນຫາຊື່, ອີເມວ, ເບີໂທ..." class="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <select v-model="status" class="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="">ທຸກສະຖານະ</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th><input type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300" /></th>
              <th>ລູກຄ້າ</th>
              <th>ເບີໂທ</th>
              <th>ອີເມວ</th>
              <th>ຄຳສັ່ງຊື້</th>
              <th>ຍອດໃຊ້ຈ່າຍ</th>
              <th>ສະຖານະ</th>
              <th>ວັນທີສະໝັກ</th>
              <th class="w-16">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 5" :key="i"><td colspan="9"><div class="h-12 animate-pulse rounded bg-slate-100" /></td></tr>
            </template>
            <tr v-for="c in rows" v-else :key="c.id">
              <td><input type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300" /></td>
              <td>
                <div class="flex items-center gap-2.5">
                  <img v-if="c.avatar" :src="asset(c.avatar)" class="h-9 w-9 rounded-full object-cover" alt="" />
                  <span v-else class="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">{{ c.name.slice(0, 1) }}</span>
                  <span class="text-xs font-medium text-slate-800">{{ c.name }}</span>
                </div>
              </td>
              <td class="text-xs text-slate-600">{{ c.phone }}</td>
              <td class="text-xs text-slate-600">{{ c.email }}</td>
              <td><span class="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{{ c.orderCount }}</span></td>
              <td class="text-xs font-semibold text-slate-800">{{ currency(c.totalSpent) }}</td>
              <td><StatusBadge :status="c.status" type="active" /></td>
              <td class="text-xs text-slate-500">{{ date(c.createdAt) }}</td>
              <td>
                <div class="flex gap-1">
                  <button class="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50" @click="selected = c"><UIcon name="i-lucide-eye" class="h-4 w-4" /></button>
                  <button class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" @click="toggle(c)"><UIcon name="i-lucide-ban" class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length"><td colspan="9"><EmptyState title="ບໍ່ພົບລູກຄ້າ" /></td></tr>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model:page="meta.page" :total-pages="meta.totalPages" :total="meta.total" :limit="meta.limit" label="ລູກຄ້າ" />
    </div>

    <UModal :open="!!selected" @update:open="selected = null">
      <template #content>
        <div v-if="selected" class="p-5">
          <div class="flex items-center gap-3">
            <img v-if="selected.avatar" :src="asset(selected.avatar)" class="h-14 w-14 rounded-full object-cover" alt="" />
            <div>
              <h3 class="text-base font-semibold text-slate-900">{{ selected.name }}</h3>
              <p class="text-xs text-slate-500">{{ selected.email }} · {{ selected.phone }}</p>
            </div>
            <StatusBadge :status="selected.status" type="active" class="ml-auto" />
          </div>
          <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl bg-slate-50 p-3"><dt class="text-[11px] text-slate-500">ຄຳສັ່ງຊື້ທັງໝົດ</dt><dd class="mt-0.5 font-bold">{{ selected.orderCount }}</dd></div>
            <div class="rounded-xl bg-slate-50 p-3"><dt class="text-[11px] text-slate-500">ຍອດໃຊ້ຈ່າຍລວມ</dt><dd class="mt-0.5 font-bold">{{ currency(selected.totalSpent) }}</dd></div>
            <div class="rounded-xl bg-slate-50 p-3"><dt class="text-[11px] text-slate-500">ວັນທີສະໝັກ</dt><dd class="mt-0.5 font-semibold">{{ date(selected.createdAt) }}</dd></div>
            <div class="rounded-xl bg-slate-50 p-3"><dt class="text-[11px] text-slate-500">ສະຖານະ</dt><dd class="mt-0.5 font-semibold">{{ selected.status }}</dd></div>
          </dl>
          <div class="mt-5 flex justify-end gap-2">
            <UButton color="neutral" variant="soft" @click="selected = null">ປິດ</UButton>
            <UButton :color="selected.status === 'ACTIVE' ? 'error' : 'primary'" @click="toggle(selected); selected = null">
              {{ selected.status === 'ACTIVE' ? 'ລະງັບບັນຊີ' : 'ປົດລະງັບ' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
