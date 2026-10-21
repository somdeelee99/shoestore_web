<script setup lang="ts">
import type { Category, Product } from '~/types'

const props = defineProps<{ product?: Product | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: any): void; (e: 'cancel'): void }>()

const api = useApi()
const toast = useToast()
const asset = useAssetUrl()
const { currency } = useFormat()

const categories = ref<Category[]>([])
const uploading = ref(false)
const activeTab = ref<'info' | 'variants'>('info')

const form = reactive({
  name: props.product?.name ?? '',
  brand: props.product?.brand ?? '',
  sku: props.product?.sku ?? '',
  categoryId: props.product?.categoryId ?? '',
  description: props.product?.description ?? '',
  price: props.product?.price ?? 0,
  comparePrice: props.product?.comparePrice ?? 0,
  status: props.product?.status ?? 'ACTIVE',
  featured: props.product?.featured ?? false,
  images: (props.product?.images ?? []).map((i) => i.url) as string[],
  variants: (props.product?.variants ?? []).map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    colorHex: v.colorHex ?? '#111827',
    price: v.price,
    stock: v.stock,
    sku: v.sku,
  })),
})

onMounted(async () => {
  const res = await api.get<Category[]>('/admin/categories')
  categories.value = res.data
  if (!form.categoryId && res.data.length) form.categoryId = res.data[0].id
})

async function onUpload(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  uploading.value = true
  try {
    const res = await api.upload(files)
    form.images.push(...res.data.files.map((f) => f.url))
    toast.add({ title: 'ອັບໂຫຼດຮູບສຳເລັດ', color: 'success' })
  } finally {
    uploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function addVariant() {
  form.variants.push({ size: '40', color: 'ດຳ', colorHex: '#111827', price: form.price || 0, stock: 0, sku: '' } as any)
}

function removeVariant(i: number) {
  form.variants.splice(i, 1)
}

function removeImage(i: number) {
  form.images.splice(i, 1)
}

function submit() {
  if (!form.name.trim()) return toast.add({ title: 'ກະລຸນາໃສ່ຊື່ສິນຄ້າ', color: 'error' })
  if (!form.categoryId) return toast.add({ title: 'ກະລຸນາເລືອກໝວດໝູ່', color: 'error' })
  if (!form.price) return toast.add({ title: 'ກະລຸນາໃສ່ລາຄາ', color: 'error' })
  emit('submit', {
    ...form,
    price: Number(form.price),
    comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
    variants: form.variants.map((v) => ({ ...v, price: Number(v.price), stock: Number(v.stock) })),
  })
}

const totalStock = computed(() => form.variants.reduce((s, v) => s + Number(v.stock || 0), 0))
const discountPercent = computed(() =>
  form.comparePrice && Number(form.comparePrice) > Number(form.price)
    ? Math.round(((Number(form.comparePrice) - Number(form.price)) / Number(form.comparePrice)) * 100)
    : 0,
)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <UButton to="/products" icon="i-lucide-arrow-left" color="neutral" variant="ghost" />
        <div>
          <h1 class="page-title">{{ product ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່' }}</h1>
          <p class="page-subtitle">{{ product ? product.name : 'ປ້ອນຂໍ້ມູນສິນຄ້າໃໝ່ເຂົ້າໃນລະບົບ' }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <UButton color="neutral" variant="soft" to="/products">ຍົກເລີກ</UButton>
        <UButton icon="i-lucide-save" :loading="submitting" @click="submit">{{ product ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກ' }}</UButton>
      </div>
    </div>

    <div class="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm">
      <button
        v-for="t in [
          { id: 'info', label: 'ຂໍ້ມູນທົ່ວໄປ' },
          { id: 'variants', label: `ຂະໜາດ / ສີ (${form.variants.length})` },
        ]"
        :key="t.id"
        class="flex-1 rounded-lg px-3 py-2 font-medium transition"
        :class="activeTab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
        @click="activeTab = t.id as any"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-show="activeTab === 'info'" class="grid gap-5 xl:grid-cols-3">
      <div class="card space-y-5 p-5 xl:col-span-2">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ຊື່ສິນຄ້າ <span class="text-rose-500">*</span></label>
            <UInput v-model="form.name" placeholder="Nike Air Max 270" size="lg" :ui="{ base: 'w-full' }" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ໝວດໝູ່ <span class="text-rose-500">*</span></label>
            <select v-model="form.categoryId" class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ແບຣນ</label>
            <UInput v-model="form.brand" placeholder="Nike" size="lg" :ui="{ base: 'w-full' }" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">SKU</label>
            <UInput v-model="form.sku" placeholder="SKU-NK-270" size="lg" :ui="{ base: 'w-full' }" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ສະຖານະ</label>
            <select v-model="form.status" class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500">
              <option value="ACTIVE">ເປີດຂາຍ</option>
              <option value="DRAFT">ຮ່າງ</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ລາຄາ (₭) <span class="text-rose-500">*</span></label>
            <UInput v-model.number="form.price" type="number" size="lg" :ui="{ base: 'w-full' }" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ລາຄາປຽບທຽບ (₭)</label>
            <UInput v-model.number="form.comparePrice" type="number" size="lg" :ui="{ base: 'w-full' }" />
            <p v-if="discountPercent" class="mt-1 text-[11px] text-emerald-600">ສ່ວນຫຼຸດ {{ discountPercent }}%</p>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">ລາຍລະອຽດ</label>
          <div class="mb-1 flex gap-1 rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-500">
            <button v-for="i in ['i-lucide-bold', 'i-lucide-italic', 'i-lucide-underline', 'i-lucide-list', 'i-lucide-image']" :key="i" class="rounded p-1.5 hover:bg-white">
              <UIcon :name="i" class="h-4 w-4" />
            </button>
          </div>
          <textarea
            v-model="form.description"
            rows="6"
            placeholder="ລາຍລະອຽດສິນຄ້າ, ຂະໜາດ, ວັດຖຸດິບ, ວິທີການດູແລ..."
            class="w-full rounded-b-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <label class="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <USwitch v-model="form.featured" />
          <span class="text-sm text-slate-700">ສິນຄ້າແນະນຳ (ສະແດງໃນໜ້າຫຼັກຂອງແອັບ)</span>
        </label>
      </div>

      <div class="space-y-5">
        <div class="card p-5">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">ຮູບພາບສິນຄ້າ</h3>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(img, i) in form.images" :key="img" class="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              <img :src="asset(img)" class="h-full w-full object-cover" alt="" />
              <button class="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100" @click="removeImage(i)">
                <UIcon name="i-lucide-trash-2" class="h-5 w-5 text-white" />
              </button>
              <span v-if="i === 0" class="absolute left-1 top-1 rounded bg-brand-600 px-1.5 text-[10px] text-white">ຫຼັກ</span>
            </div>
            <label class="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-400 hover:text-brand-500">
              <div class="text-center">
                <UIcon :name="uploading ? 'i-lucide-loader-2' : 'i-lucide-plus'" class="mx-auto h-5 w-5" :class="uploading ? 'animate-spin' : ''" />
                <span class="mt-1 block text-[10px]">ເພີ່ມຮູບ</span>
              </div>
              <input type="file" accept="image/*" multiple class="hidden" @change="onUpload" />
            </label>
          </div>
          <p class="mt-2 text-[11px] text-slate-400">ຮອງຮັບ JPG, PNG, WEBP ຂະໜາດບໍ່ເກີນ 5MB</p>
        </div>

        <div class="card p-5">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">ສະຫຼຸບ</h3>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">ລາຄາຂາຍ</dt><dd class="font-semibold">{{ currency(form.price) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">ສະຕັອກລວມ</dt><dd class="font-semibold">{{ totalStock }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">ຈຳນວນຕົວແປ</dt><dd class="font-semibold">{{ form.variants.length }}</dd></div>
          </dl>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'variants'" class="card p-5">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">ຕົວແປສິນຄ້າ (ຂະໜາດ / ສີ)</h3>
          <p class="text-xs text-slate-500">ແຕ່ລະຕົວແປມີ SKU ແລະ ສະຕັອກຂອງຕົນເອງ</p>
        </div>
        <UButton icon="i-lucide-plus" size="sm" @click="addVariant">ເພີ່ມຕົວແປ</UButton>
      </div>
      <div class="table-wrap">
        <table class="table-base">
          <thead>
            <tr>
              <th class="w-10">#</th>
              <th>ຂະໜາດ</th>
              <th>ສີ</th>
              <th>SKU</th>
              <th>ລາຄາ</th>
              <th>ຈຳນວນ</th>
              <th class="w-14">ລຶບ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, i) in form.variants" :key="i">
              <td class="text-slate-400">{{ i + 1 }}</td>
              <td><UInput v-model="v.size" size="sm" class="w-20" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <input v-model="v.colorHex" type="color" class="h-7 w-7 cursor-pointer rounded-md border border-slate-200" />
                  <UInput v-model="v.color" size="sm" class="w-28" />
                </div>
              </td>
              <td><UInput v-model="v.sku" size="sm" placeholder="auto" class="w-40" /></td>
              <td><UInput v-model.number="v.price" type="number" size="sm" class="w-28" /></td>
              <td><UInput v-model.number="v.stock" type="number" size="sm" class="w-20" /></td>
              <td>
                <button class="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" @click="removeVariant(i)">
                  <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                </button>
              </td>
            </tr>
            <tr v-if="!form.variants.length">
              <td colspan="7" class="py-10 text-center text-sm text-slate-400">ຍັງບໍ່ມີຕົວແປ — ກົດ "ເພີ່ມຕົວແປ"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
