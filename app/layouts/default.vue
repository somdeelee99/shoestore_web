<template>
  <div class="flex min-h-screen bg-[#f4f6fa]">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
      <footer class="border-t border-slate-200 bg-white px-6 py-3 text-center text-[11px] text-slate-400">
        ShoeStore Admin Panel © {{ new Date().getFullYear() }} — ສ້າງດ້ວຍ Nuxt 4 · NestJS · Prisma · PostgreSQL
      </footer>
    </div>
  </div>
</template>
