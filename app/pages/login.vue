<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const api = useApi()
const route = useRoute()
const toast = useToast()

const form = reactive({ identifier: 'admin@shoestore.com', password: 'Admin@123' })
const showPassword = ref(false)
const remember = ref(true)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: any }>(
      '/admin/auth/login',
      { identifier: form.identifier, password: form.password },
      true,
    )
    auth.setSession({ accessToken: res.data.accessToken, user: res.data.user })
    toast.add({ title: 'ຍິນດີຕ້ອນຮັບ', description: res.data.user.name, color: 'success', icon: 'i-lucide-check-circle' })
    await navigateTo((route.query.redirect as string) || '/')
  } catch (e: any) {
    const msg = e?.data?.message
    error.value = Array.isArray(msg) ? msg.join(', ') : msg || 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-white">
    <!-- Left showcase -->
    <div class="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
      <div
        class="absolute inset-0 bg-cover bg-center opacity-60"
        style="background-image: url('https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&q=80')"
      />
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-red-950/70" />

      <div class="relative flex items-center gap-3">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <svg viewBox="0 0 32 32" class="h-7 w-7">
            <path d="M4 21.5c0-1.1.9-2 2-2h2.6l2.4-6c.4-.9 1.2-1.5 2.2-1.5h1c.8 0 1.5.6 1.6 1.4l1 5.6 5 1.8c1.7.6 2.7 2.1 2.7 3.8v1.4H4v-4.5z" fill="#fff" />
            <circle cx="10" cy="25.5" r="1.8" fill="#e11d2a" />
            <circle cx="21" cy="25.5" r="1.8" fill="#e11d2a" />
          </svg>
        </span>
        <div>
          <p class="text-lg font-bold">ShoeStore</p>
          <p class="text-xs text-white/60">Admin Panel</p>
        </div>
      </div>

      <div class="relative">
        <h1 class="text-4xl font-bold leading-tight">ຈັດການຮ້ານຂອງທ່ານ<br />ຢ່າງມີປະສິດທິພາບ</h1>
        <p class="mt-4 max-w-sm text-sm text-white/70">
          ຕິດຕາມຍອດຂາຍ, ຈັດການສິນຄ້າ, ຄຳສັ່ງຊື້, ລູກຄ້າ ແລະ ແຊັດສະພອດ ໄດ້ໃນບ່ອນດຽວ
        </p>
        <div class="mt-8 flex gap-6 text-sm">
          <div>
            <p class="text-2xl font-bold">125M₭</p>
            <p class="text-white/60">ຍອດຂາຍເດືອນນີ້</p>
          </div>
          <div>
            <p class="text-2xl font-bold">330+</p>
            <p class="text-white/60">ຄຳສັ່ງຊື້</p>
          </div>
          <div>
            <p class="text-2xl font-bold">256</p>
            <p class="text-white/60">ລູກຄ້າ</p>
          </div>
        </div>
      </div>

      <p class="relative text-xs text-white/40">© {{ new Date().getFullYear() }} ShoeStore. All rights reserved.</p>
    </div>

    <!-- Right form -->
    <div class="flex flex-1 items-center justify-center p-6">
      <div class="w-full max-w-sm">
        <h2 class="text-center text-2xl font-bold text-slate-900">{{ $t('login.title') }}</h2>
        <p class="mt-1 text-center text-sm text-slate-500">ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອຈັດການຮ້ານຂອງທ່ານ</p>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ອີເມວ ຫຼື ເບີໂທ</label>
            <UInput
              v-model="form.identifier"
              size="xl"
              icon="i-lucide-mail"
              placeholder="admin@shoestore.com"
              class="w-full"
              :ui="{ base: 'w-full' }"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">ລະຫັດຜ່ານ</label>
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              size="xl"
              icon="i-lucide-lock"
              placeholder="••••••••"
              class="w-full"
              :ui="{ base: 'w-full' }"
              :trailing-icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click-trailing="showPassword = !showPassword"
            />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-slate-600">
              <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              ຈື່ຂ້ອຍໄວ້
            </label>
            <a href="#" class="font-medium text-brand-600 hover:underline">ລືມລະຫັດຜ່ານ?</a>
          </div>

          <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{{ error }}</p>

          <UButton type="submit" block size="xl" color="primary" :loading="loading" class="justify-center font-semibold">
            ເຂົ້າສູ່ລະບົບ
          </UButton>
        </form>

        <div class="my-6 flex items-center gap-3 text-[11px] text-slate-400">
          <span class="h-px flex-1 bg-slate-200" />ຫຼື<span class="h-px flex-1 bg-slate-200" />
        </div>

        <div class="space-y-2.5">
          <button class="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <svg class="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            ເຂົ້າສູ່ລະບົບດ້ວຍ Google
          </button>
          <button class="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <svg class="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
              <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
              <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
              <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
            </svg>
            ເຂົ້າສູ່ລະບົບດ້ວຍ Microsoft
          </button>
        </div>

        <p class="mt-6 rounded-xl bg-slate-50 p-3 text-center text-[11px] leading-relaxed text-slate-500">
          ບັນຊີທົດລອງ: <b>admin@shoestore.com</b> / <b>Admin@123</b><br />
          ພະນັກງານ: <b>staff@shoestore.com</b> / <b>Admin@123</b>
        </p>
      </div>
    </div>
  </div>
</template>
