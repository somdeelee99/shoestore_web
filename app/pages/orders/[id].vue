<script setup lang="ts">
import type { Order, OrderStatus } from '~/types'

const api = useApi()
const route = useRoute()
const toast = useToast()
const { currency, dateTime } = useFormat()
const { paymentMethod, shippingMethod } = useStatus()
const asset = useAssetUrl()

const order = ref<Order | null>(null)
const saving = ref(false)
const trackingInput = ref('')

async function load() {
  const res = await api.get<Order>(`/admin/orders/${route.params.id}`)
  order.value = res.data
  trackingInput.value = res.data.trackingNumber ?? ''
}
onMounted(load)

async function setStatus(status: OrderStatus) {
  if (!order.value) return
  saving.value = true
  try {
    await api.patch(`/admin/orders/${order.value.id}/status`, { status })
    toast.add({ title: 'ອັບເດດສະຖານະສຳເລັດ', color: 'success' })
    load()
  } finally {
    saving.value = false
  }
}

async function setPayment(status: 'UNPAID' | 'PAID' | 'REFUNDED') {
  if (!order.value) return
  await api.patch(`/admin/orders/${order.value.id}/payment`, { paymentStatus: status })
  toast.add({ title: 'ອັບເດດການຊຳລະແລ້ວ', color: 'success' })
  load()
}

async function saveTracking() {
  if (!order.value || !trackingInput.value) return
  await api.patch(`/admin/orders/${order.value.id}/tracking`, { trackingNumber: trackingInput.value })
  toast.add({ title: 'ບັນທຶກເລກພັດສະດຸສຳເລັດ', color: 'success' })
}

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'ສ້າງຄຳສັ່ງຊື້' },
  { status: 'CONFIRMED', label: 'ຢືນຢັນແລ້ວ' },
  { status: 'PACKING', label: 'ກຽມສົ່ງ' },
  { status: 'SHIPPING', label: 'ກຳລັງຂົນສົ່ງ' },
  { status: 'DELIVERED', label: 'ສົ່ງສຳເລັດ' },
]

const currentIndex = computed(() => (order.value ? steps.findIndex((s) => s.status === order.value!.status) : 0))
</script>

<template>
  <div v-if="!order" class="card p-6"><div class="h-64 animate-pulse rounded-xl bg-slate-100" /></div>

  <div v-else class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <UButton to="/orders" icon="i-lucide-arrow-left" color="neutral" variant="ghost" />
        <div>
          <h1 class="page-title">ຄຳສັ່ງຊື້ #{{ order.code }}</h1>
          <p class="page-subtitle">{{ dateTime(order.createdAt) }}</p>
        </div>
        <StatusBadge :status="order.status" class="ml-2" />
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton v-if="['PENDING'].includes(order.status)" icon="i-lucide-check" :loading="saving" @click="setStatus('CONFIRMED')">ຢືນຢັນ</UButton>
        <UButton v-if="['CONFIRMED'].includes(order.status)" icon="i-lucide-package" :loading="saving" @click="setStatus('PACKING')">ກຽມສົ່ງ</UButton>
        <UButton v-if="['PACKING'].includes(order.status)" icon="i-lucide-truck" :loading="saving" @click="setStatus('SHIPPING')">ສົ່ງສິນຄ້າ</UButton>
        <UButton v-if="['SHIPPING'].includes(order.status)" icon="i-lucide-circle-check" :loading="saving" @click="setStatus('DELIVERED')">ສຳເລັດ</UButton>
        <UButton v-if="!['DELIVERED', 'CANCELLED'].includes(order.status)" color="error" variant="soft" icon="i-lucide-x" @click="setStatus('CANCELLED')">ຍົກເລີກ</UButton>
        <UButton color="neutral" variant="soft" icon="i-lucide-printer">ພິມ</UButton>
      </div>
    </div>

    <!-- timeline -->
    <div class="card p-5">
      <h2 class="mb-5 text-sm font-semibold text-slate-800">ຄວາມຄືບໜ້າການສົ່ງ</h2>
      <ol class="flex items-start justify-between gap-2">
        <li v-for="(s, i) in steps" :key="s.status" class="relative flex flex-1 flex-col items-center text-center">
          <div class="flex w-full items-center">
            <span class="h-0.5 flex-1" :class="i === 0 ? 'bg-transparent' : i <= currentIndex ? 'bg-emerald-400' : 'bg-slate-200'" />
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white"
              :class="i <= currentIndex && order.status !== 'CANCELLED' ? 'bg-emerald-500' : 'bg-slate-200 text-slate-400'"
            >
              <UIcon :name="i <= currentIndex ? 'i-lucide-check' : 'i-lucide-dot'" class="h-4 w-4" />
            </span>
            <span class="h-0.5 flex-1" :class="i === steps.length - 1 ? 'bg-transparent' : i < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'" />
          </div>
          <p class="mt-2 text-[11px] font-medium" :class="i <= currentIndex ? 'text-slate-800' : 'text-slate-400'">{{ s.label }}</p>
        </li>
      </ol>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <div class="space-y-5 lg:col-span-2">
        <div class="card">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 class="text-sm font-semibold text-slate-800">ລາຍການສິນຄ້າ</h2>
            <span class="text-xs text-slate-500">{{ order.items.length }} ລາຍການ</span>
          </div>
          <div class="table-wrap">
            <table class="table-base">
              <thead><tr><th>ສິນຄ້າ</th><th>ຂະໜາດ/ສີ</th><th>ລາຄາ</th><th>ຈຳນວນ</th><th>ລວມ</th></tr></thead>
              <tbody>
                <tr v-for="it in order.items" :key="it.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <ProductThumb :src="it.image" :name="it.name" />
                      <span class="text-xs font-medium text-slate-800">{{ it.name }}</span>
                    </div>
                  </td>
                  <td class="text-xs text-slate-500">{{ it.size }} · {{ it.color }}</td>
                  <td class="text-xs">{{ currency(it.price) }}</td>
                  <td class="text-xs">×{{ it.quantity }}</td>
                  <td class="text-xs font-semibold">{{ currency(it.price * it.quantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="space-y-2 border-t border-slate-100 p-5 text-sm">
            <div class="flex justify-between text-slate-600"><span>ລວມຄ່າສິນຄ້າ</span><span>{{ currency(order.subtotal) }}</span></div>
            <div class="flex justify-between text-slate-600"><span>ຄ່າຂົນສົ່ງ</span><span>{{ currency(order.shippingFee) }}</span></div>
            <div v-if="order.discount" class="flex justify-between text-emerald-600"><span>ສ່ວນຫຼຸດ</span><span>-{{ currency(order.discount) }}</span></div>
            <div class="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900"><span>ຍອດລວມທັງໝົດ</span><span class="text-brand-600">{{ currency(order.total) }}</span></div>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="mb-3 text-sm font-semibold text-slate-800">ປະຫວັດຄຳສັ່ງຊື້</h2>
          <ul class="space-y-3">
            <li v-for="h in order.history ?? []" :key="h.id" class="flex gap-3">
              <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
              <div>
                <p class="text-xs font-medium text-slate-700">{{ h.note || h.status }}</p>
                <p class="text-[11px] text-slate-400">{{ dateTime(h.createdAt) }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-5">
        <div class="card p-5">
          <h2 class="mb-3 text-sm font-semibold text-slate-800">ຂໍ້ມູນລູກຄ້າ</h2>
          <div class="flex items-center gap-3">
            <img v-if="order.customer?.avatar" :src="asset(order.customer.avatar)" class="h-10 w-10 rounded-full object-cover" alt="" />
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ order.customer?.name ?? order.recipient }}</p>
              <p class="text-xs text-slate-500">{{ order.phone }}</p>
            </div>
          </div>
          <dl class="mt-4 space-y-2 text-xs">
            <div class="flex items-start justify-between gap-3"><dt class="text-slate-500">ທີ່ຢູ່ຈັດສົ່ງ</dt><dd class="text-right text-slate-700">{{ order.shippingAddress }}</dd></div>
            <div class="flex items-center justify-between"><dt class="text-slate-500">ວິທີຊຳລະ</dt><dd class="text-slate-700">{{ paymentMethod(order.paymentMethod) }}</dd></div>
            <div class="flex items-center justify-between"><dt class="text-slate-500">ການຊຳລະ</dt><dd><StatusBadge :status="order.paymentStatus" type="payment" /></dd></div>
            <div class="flex items-center justify-between"><dt class="text-slate-500">ການຂົນສົ່ງ</dt><dd class="text-slate-700">{{ shippingMethod(order.shippingMethod) }}</dd></div>
          </dl>
          <div class="mt-3 flex gap-2">
            <UButton
              v-for="s in [{ id: 'UNPAID', label: 'ຍັງບໍ່ຊຳລະ' }, { id: 'PAID', label: 'ຊຳລະແລ້ວ' }, { id: 'REFUNDED', label: 'ຄືນເງິນ' }]"
              :key="s.id"
              size="xs"
              color="neutral"
              variant="soft"
              @click="setPayment(s.id as any)"
            >
              {{ s.label }}
            </UButton>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="mb-3 text-sm font-semibold text-slate-800">ເລກພັດສະດຸ</h2>
          <div class="flex gap-2">
            <UInput v-model="trackingInput" placeholder="LA123456789" class="flex-1" :ui="{ base: 'w-full' }" />
            <UButton icon="i-lucide-save" @click="saveTracking" />
          </div>
          <p class="mt-2 text-[11px] text-slate-400">ລູກຄ້າຈະເຫັນເລກນີ້ໃນໜ້າຕິດຕາມຄຳສັ່ງຊື້ໃນແອັບ</p>
        </div>

        <div v-if="order.note" class="card p-5">
          <h2 class="mb-2 text-sm font-semibold text-slate-800">ໝາຍເຫດຈາກລູກຄ້າ</h2>
          <p class="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{{ order.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
