<script setup lang="ts">
import type { Category } from '~/types'

const api = useApi()
const toast = useToast()
const { date } = useFormat()
const asset = useAssetUrl()

const rows = ref<Category[]>([])
const loading = ref(true)
const modal = ref(false)
const saving = ref(false)
const editing = ref<Category | null>(null)
const confirmOpen = ref(false)
const target = ref<Category | null>(null)

const form = reactive({ name: '', description: '', image: '', status: true, sortOrder: 0 })

async function load() {
  loading.value = true
  try {
    const res = await api.get<Category[]>('/admin/categories')
    rows.value = res.data
  } finally {
    loading.value = false
  }
}
onMounted(load)

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', description: '', image: '', status: true, sortOrder: rows.value.length })
  modal.value = true
}

function openEdit(c: Category) {
  editing.value = c
  Object.assign(form, { name: c.name, description: c.description ?? '', image: c.image ?? '', status: c.status, sortOrder: c.sortOrder })
  modal.value = true
}

async function save() {
  if (!form.name.trim()) return toast.add({ title: 'ກະລຸນາໃສ່ຊື່ໝວດໝູ່', color: 'error' })
  saving.value = true
  try {
    if (editing.value) await api.patch(`/admin/categories/${editing.value.id}`, form)
    else await api.post('/admin/categories', form)
    toast.add({ title: 'ບັນທຶກສຳເລັດ', color: 'success' })
    modal.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function onUpload(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  const res = await api.upload(files)
  form.image = res.data.files[0].url
}

async function doDelete() {
  if (!target.value) return
  await api.del(`/admin/categories/${target.value.id}`)
  toast.add({ title: 'ລຶບໝວດໝູ່ສຳເລັດ', color: 'success' })
  confirmOpen.value = false
  load()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="page-title">ໝວດໝູ່ສິນຄ້າ</h1>
        <p class="page-subtitle">ຈັດການໝວດໝູ່ທີ່ສະແດງໃນແອັບ</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreate">ເພີ່ມໝວດໝູ່</UButton>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th class="w-10">#</th>
              <th>ໝວດໝູ່</th>
              <th>ຄຳອະທິບາຍ</th>
              <th>ຈຳນວນສິນຄ້າ</th>
              <th>ສະຖານະ</th>
              <th class="w-24">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in rows" :key="c.id">
              <td class="text-slate-400">{{ i + 1 }}</td>
              <td>
                <div class="flex items-center gap-3">
                  <ProductThumb :src="c.image" :name="c.name" />
                  <div>
                    <p class="font-medium text-slate-800">{{ c.name }}</p>
                    <p class="text-[11px] text-slate-400">{{ c.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="max-w-xs truncate text-xs text-slate-600">{{ c.description }}</td>
              <td><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{{ c.productCount }}</span></td>
              <td><StatusBadge :status="c.status ? 'ACTIVE' : 'BLOCKED'" type="active" /></td>
              <td>
                <div class="flex gap-1">
                  <button class="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50" @click="openEdit(c)"><UIcon name="i-lucide-pencil" class="h-4 w-4" /></button>
                  <button class="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" @click="target = c; confirmOpen = true"><UIcon name="i-lucide-trash-2" class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length"><td colspan="6"><EmptyState title="ຍັງບໍ່ມີໝວດໝູ່" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <UModal v-model:open="modal">
      <template #content>
        <div class="space-y-4 p-5">
          <h3 class="text-base font-semibold text-slate-900">{{ editing ? 'ແກ້ໄຂໝວດໝູ່' : 'ເພີ່ມໝວດໝູ່ໃໝ່' }}</h3>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ຊື່ໝວດໝູ່</label>
            <UInput v-model="form.name" class="w-full" :ui="{ base: 'w-full' }" placeholder="ເກີບແລ່ນ" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ຄຳອະທິບາຍ</label>
            <UTextarea v-model="form.description" class="w-full" :ui="{ base: 'w-full' }" :rows="3" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">ລຳດັບ</label>
              <UInput v-model.number="form.sortOrder" type="number" class="w-full" :ui="{ base: 'w-full' }" />
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 text-sm text-slate-700"><USwitch v-model="form.status" /> ເປີດໃຊ້ງານ</label>
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ຮູບພາບ</label>
            <div class="flex items-center gap-3">
              <ProductThumb :src="form.image" size="lg" />
              <label class="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                ເລືອກຮູບ
                <input type="file" accept="image/*" class="hidden" @change="onUpload" />
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="modal = false">ຍົກເລີກ</UButton>
            <UButton :loading="saving" @click="save">ບັນທຶກ</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <ConfirmModal v-model:open="confirmOpen" danger title="ລຶບໝວດໝູ່?" :description="`ລຶບ “${target?.name}”?`" confirm-label="ລຶບ" @confirm="doDelete" />
  </div>
</template>
