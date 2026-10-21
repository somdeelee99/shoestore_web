<script setup lang="ts">
const api = useApi()
const toast = useToast()
const auth = useAuthStore()
const { locale, setLocale } = useI18n()
const asset = useAssetUrl()

const tab = ref<'store' | 'shipping' | 'account' | 'permissions'>('store')
const loading = ref(true)
const saving = ref(false)
const settings = reactive<Record<string, string>>({})
const password = reactive({ currentPassword: '', newPassword: '' })

const tabs = [
  { id: 'store', label: 'ຂໍ້ມູນຮ້ານ', icon: 'i-lucide-store' },
  { id: 'shipping', label: 'ການຂົນສົ່ງ', icon: 'i-lucide-truck' },
  { id: 'account', label: 'ບັນຊີຜູ້ໃຊ້', icon: 'i-lucide-user-cog' },
  { id: 'permissions', label: 'ສິດການໃຊ້ງານ', icon: 'i-lucide-shield-check' },
]

async function load() {
  loading.value = true
  try {
    const res = await api.get<Record<string, string>>('/admin/settings')
    Object.assign(settings, res.data)
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function save() {
  saving.value = true
  try {
    await api.patch('/admin/settings', settings)
    toast.add({ title: 'ບັນທຶກການຕັ້ງຄ່າສຳເລັດ', color: 'success' })
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (password.newPassword.length < 6) return toast.add({ title: 'ລະຫັດຜ່ານໃໝ່ຢ່າງໜ້ອຍ 6 ໂຕ', color: 'error' })
  await api.post('/admin/auth/change-password', password)
  toast.add({ title: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດ', color: 'success' })
  password.currentPassword = ''
  password.newPassword = ''
}

async function onAvatar(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  const res = await api.upload(files)
  const url = res.data.files[0].url
  const me = await api.patch<any>('/admin/auth/me', { avatar: url })
  auth.user = me.data
  toast.add({ title: 'ອັບເດດຮູບໂປຣໄຟລ໌ແລ້ວ', color: 'success' })
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="page-title">ຕັ້ງຄ່າ</h1>
      <p class="page-subtitle">ຈັດການຂໍ້ມູນຮ້ານ, ການຂົນສົ່ງ ແລະ ບັນຊີຜູ້ໃຊ້</p>
    </div>

    <div class="grid gap-5 lg:grid-cols-4">
      <div class="card h-fit p-2">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition"
          :class="tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'"
          @click="tab = t.id as any"
        >
          <UIcon :name="t.icon" class="h-4 w-4" />{{ t.label }}
        </button>
      </div>

      <div class="space-y-5 lg:col-span-3">
        <div v-show="tab === 'store'" class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800">ຂໍ້ມູນຮ້ານ</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ຊື່ຮ້ານ</label>
              <UInput v-model="settings.storeName" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ອີເມວ</label>
              <UInput v-model="settings.storeEmail" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ເບີໂທຕິດຕໍ່</label>
              <UInput v-model="settings.storePhone" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ສະກຸນເງິນ</label>
              <select v-model="settings.currency" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                <option value="LAK">₭ ກີບ (LAK)</option>
                <option value="THB">฿ ບາດ (THB)</option>
                <option value="USD">$ ໂດລາ (USD)</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-sm text-slate-700">ທີ່ຢູ່ຮ້ານ</label>
              <UInput v-model="settings.storeAddress" :ui="{ base: 'w-full' }" />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-sm text-slate-700">ໂລໂກ້ຮ້ານ</label>
              <div class="flex items-center gap-3">
                <ProductThumb :src="settings.storeLogo || null" size="lg" />
                <UInput v-model="settings.storeLogo" placeholder="URL ຂອງໂລໂກ້" :ui="{ base: 'w-full' }" />
              </div>
            </div>
            <div class="sm:col-span-2 flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p class="text-sm font-medium text-slate-700">ໂໝດບຳລຸງຮັກສາ</p>
                <p class="text-[11px] text-slate-500">ປິດການສັ່ງຊື້ຊົ່ວຄາວຈາກແອັບ</p>
              </div>
              <USwitch
                :model-value="settings.maintenanceMode === 'true'"
                @update:model-value="settings.maintenanceMode = String($event)"
              />
            </div>
          </div>
          <div class="mt-5 flex justify-end">
            <UButton icon="i-lucide-save" :loading="saving" @click="save">ບັນທຶກ</UButton>
          </div>
        </div>

        <div v-show="tab === 'shipping'" class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800">ຄ່າຂົນສົ່ງ</h2>
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ມາດຕະຖານ (3-5 ວັນ)</label>
              <UInput v-model="settings.shippingFeeStandard" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ດ່ວນ (1-2 ວັນ)</label>
              <UInput v-model="settings.shippingFeeExpress" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ພາຍໃນວັນ</label>
              <UInput v-model="settings.shippingFeeSameDay" type="number" :ui="{ base: 'w-full' }" />
            </div>
            <div class="sm:col-span-3">
              <label class="mb-1.5 block text-sm text-slate-700">ສົ່ງຟຣີເມື່ອຊື້ຂັ້ນຕ່ຳ (₭)</label>
              <UInput v-model="settings.freeShippingThreshold" type="number" :ui="{ base: 'w-full' }" />
            </div>
          </div>
          <div class="mt-5 flex justify-end"><UButton icon="i-lucide-save" :loading="saving" @click="save">ບັນທຶກ</UButton></div>
        </div>

        <div v-show="tab === 'account'" class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800">ບັນຊີຂອງຂ້ອຍ</h2>
          <div class="flex items-center gap-4">
            <img v-if="auth.user?.avatar" :src="asset(auth.user.avatar)" class="h-16 w-16 rounded-full object-cover" alt="" />
            <span v-else class="grid h-16 w-16 place-items-center rounded-full bg-slate-900 text-lg font-bold text-white">{{ auth.initials }}</span>
            <label class="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
              ປ່ຽນຮູບ
              <input type="file" accept="image/*" class="hidden" @change="onAvatar" />
            </label>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label class="mb-1.5 block text-sm text-slate-700">ຊື່</label><UInput :model-value="auth.user?.name" disabled :ui="{ base: 'w-full' }" /></div>
            <div><label class="mb-1.5 block text-sm text-slate-700">ອີເມວ</label><UInput :model-value="auth.user?.email" disabled :ui="{ base: 'w-full' }" /></div>
            <div><label class="mb-1.5 block text-sm text-slate-700">ສິດ</label><UInput :model-value="auth.user?.role === 'ADMIN' ? 'ຜູ້ດູແລລະບົບ' : 'ພະນັກງານ'" disabled :ui="{ base: 'w-full' }" /></div>
            <div>
              <label class="mb-1.5 block text-sm text-slate-700">ພາສາ</label>
              <select :value="locale" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" @change="setLocale(($event.target as HTMLSelectElement).value as any)">
                <option value="lo">ລາວ</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <h3 class="mt-6 mb-3 text-sm font-semibold text-slate-800">ປ່ຽນລະຫັດຜ່ານ</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <UInput v-model="password.currentPassword" type="password" placeholder="ລະຫັດຜ່ານເດີມ" :ui="{ base: 'w-full' }" />
            <UInput v-model="password.newPassword" type="password" placeholder="ລະຫັດຜ່ານໃໝ່" :ui="{ base: 'w-full' }" />
          </div>
          <div class="mt-4 flex justify-end"><UButton icon="i-lucide-key-round" @click="changePassword">ປ່ຽນລະຫັດຜ່ານ</UButton></div>
        </div>

        <div v-show="tab === 'permissions'" class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800">ສິດການໃຊ້ງານ</h2>
          <div class="table-wrap">
            <table class="table-base">
              <thead><tr><th>ໜ້າທີ່</th><th class="text-center">ADMIN</th><th class="text-center">STAFF</th></tr></thead>
              <tbody>
                <tr v-for="row in [
                  { name: 'ແດຊະບອດ ແລະ ລາຍງານ', admin: true, staff: true },
                  { name: 'ຈັດການສິນຄ້າ', admin: true, staff: true },
                  { name: 'ຈັດການຄຳສັ່ງຊື້', admin: true, staff: true },
                  { name: 'ຈັດການລູກຄ້າ', admin: true, staff: true },
                  { name: 'ໂປຣໂມຊັ່ນ', admin: true, staff: false },
                  { name: 'ຕັ້ງຄ່າລະບົບ', admin: true, staff: false },
                ]" :key="row.name">
                  <td class="text-xs">{{ row.name }}</td>
                  <td class="text-center"><UIcon :name="row.admin ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'" class="mx-auto h-4 w-4" :class="row.admin ? 'text-emerald-500' : 'text-slate-300'" /></td>
                  <td class="text-center"><UIcon :name="row.staff ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'" class="mx-auto h-4 w-4" :class="row.staff ? 'text-emerald-500' : 'text-slate-300'" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
