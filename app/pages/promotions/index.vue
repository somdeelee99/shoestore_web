<script setup lang="ts">
import type { Coupon } from '~/types'

const api = useApi()
const toast = useToast()
const { currency, date } = useFormat()

const rows = ref<Coupon[]>([])
const loading = ref(true)
const modal = ref(false)
const saving = ref(false)
const editing = ref<Coupon | null>(null)
const tab = ref<'active' | 'all' | 'expired'>('all')

const form = reactive({
  code: '',
  name: '',
  type: 'PERCENT' as 'PERCENT' | 'FIXED',
  value: 10,
  minSpend: 0,
  maxDiscount: 0,
  usageLimit: 100,
  startAt: new Date().toISOString().slice(0, 10),
  endAt: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  status: true,
})

async function load() {
  loading.value = true
  try {
    const res = await api.get<Coupon[]>('/admin/coupons', { status: tab.value === 'all' ? undefined : tab.value, limit: 50 })
    rows.value = res.data
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(tab, load)

function openCreate() {
  editing.value = null
  Object.assign(form, {
    code: '',
    name: '',
    type: 'PERCENT',
    value: 10,
    minSpend: 0,
    maxDiscount: 0,
    usageLimit: 100,
    startAt: new Date().toISOString().slice(0, 10),
    endAt: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    status: true,
  })
  modal.value = true
}

function openEdit(c: Coupon) {
  editing.value = c
  Object.assign(form, {
    code: c.code,
    name: c.name,
    type: c.type,
    value: Number(c.value),
    minSpend: Number(c.minSpend),
    maxDiscount: Number(c.maxDiscount ?? 0),
    usageLimit: c.usageLimit ?? 0,
    startAt: c.startAt.slice(0, 10),
    endAt: c.endAt.slice(0, 10),
    status: c.status,
  })
  modal.value = true
}

async function save() {
  if (!form.code || !form.name) return toast.add({ title: 'ກະລຸນາປ້ອນລະຫັດ ແລະ ຊື່ໂປຣໂມຊັ່ນ', color: 'error' })
  saving.value = true
  try {
    const payload = {
      ...form,
      maxDiscount: form.maxDiscount || null,
      usageLimit: form.usageLimit || null,
    }
    if (editing.value) await api.patch(`/admin/coupons/${editing.value.id}`, payload)
    else await api.post('/admin/coupons', payload)
    toast.add({ title: 'ບັນທຶກສຳເລັດ', color: 'success' })
    modal.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(c: Coupon) {
  await api.del(`/admin/coupons/${c.id}`)
  toast.add({ title: 'ລຶບຄູປອງສຳເລັດ', color: 'success' })
  load()
}

const isExpired = (c: Coupon) => new Date(c.endAt) < new Date() || !c.status
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ໂປຣໂມຊັ່ນ ແລະ ຄູປອງ</h1>
        <p class="page-subtitle">ສ້າງສ່ວນຫຼຸດສຳລັບລູກຄ້າໃນແອັບ</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreate">ສ້າງໂປຣໂມຊັ່ນ</UButton>
    </div>

    <div class="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm sm:w-fit">
      <button
        v-for="t in [
          { id: 'all', label: 'ທັງໝົດ' },
          { id: 'active', label: 'ກຳລັງໃຊ້ງານ' },
          { id: 'expired', label: 'ໝົດອາຍຸ' },
        ]"
        :key="t.id"
        class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition"
        :class="tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
        @click="tab = t.id as any"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="card h-40 animate-pulse" />
      </template>
      <div v-for="c in rows" v-else :key="c.id" class="card overflow-hidden">
        <div class="flex items-start justify-between bg-gradient-to-r from-brand-600 to-rose-500 p-4 text-white">
          <div>
            <p class="text-lg font-black tracking-wide">{{ c.code }}</p>
            <p class="text-[11px] text-white/80">{{ c.name }}</p>
          </div>
          <span class="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
            {{ c.type === 'PERCENT' ? `-${c.value}%` : `-${currency(c.value)}` }}
          </span>
        </div>
        <div class="space-y-2 p-4 text-xs">
          <div class="flex justify-between"><span class="text-slate-500">ຍອດຊື້ຂັ້ນຕ່ຳ</span><span class="font-medium">{{ currency(c.minSpend) }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">ໃຊ້ແລ້ວ</span><span class="font-medium">{{ c.usedCount }}/{{ c.usageLimit ?? '∞' }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">ວັນໝົດອາຍຸ</span><span class="font-medium">{{ date(c.endAt) }}</span></div>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-brand-500" :style="{ width: `${Math.min(100, c.usageLimit ? (c.usedCount / c.usageLimit) * 100 : 0)}%` }" />
          </div>
          <div class="flex items-center justify-between pt-1">
            <StatusBadge :status="!isExpired(c)" type="coupon" />
            <div class="flex gap-1">
              <button class="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50" @click="openEdit(c)"><UIcon name="i-lucide-pencil" class="h-4 w-4" /></button>
              <button class="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" @click="remove(c)"><UIcon name="i-lucide-trash-2" class="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-if="!loading && !rows.length" class="card" title="ຍັງບໍ່ມີໂປຣໂມຊັ່ນ" description="ສ້າງໂປຣໂມຊັ່ນເພື່ອດຶງດູດລູກຄ້າ" />
    </div>

    <UModal v-model:open="modal">
      <template #content>
        <div class="space-y-4 p-5">
          <h3 class="text-base font-semibold text-slate-900">{{ editing ? 'ແກ້ໄຂໂປຣໂມຊັ່ນ' : 'ສ້າງໂປຣໂມຊັ່ນໃໝ່' }}</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ລະຫັດຄູປອງ</label>
              <UInput v-model="form.code" placeholder="WELCOME10" :ui="{ base: 'w-full uppercase' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ປະເພດ</label>
              <select v-model="form.type" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                <option value="PERCENT">ເປີເຊັນ (%)</option>
                <option value="FIXED">ຈຳນວນເງິນ (₭)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ຊື່ໂປຣໂມຊັ່ນ</label>
            <UInput v-model="form.name" placeholder="ສ່ວນຫຼຸດສະມາຊິກໃໝ່" :ui="{ base: 'w-full' }" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ມູນຄ່າ</label>
              <UInput v-model.number="form.value" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ຫຼຸດສູງສຸດ (₭)</label>
              <UInput v-model.number="form.maxDiscount" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ຍອດຊື້ຂັ້ນຕ່ຳ (₭)</label>
              <UInput v-model.number="form.minSpend" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ຈຳກັດການໃຊ້</label>
              <UInput v-model.number="form.usageLimit" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ເລີ່ມ</label>
              <UInput v-model="form.startAt" type="date" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ສິ້ນສຸດ</label>
              <UInput v-model="form.endAt" type="date" :ui="{ base: 'w-full' }" />
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700"><USwitch v-model="form.status" /> ເປີດໃຊ້ງານ</label>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="soft" @click="modal = false">ຍົກເລີກ</UButton>
            <UButton :loading="saving" @click="save">ບັນທຶກ</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
