import { defineStore } from 'pinia'
import type { AdminUser } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>('shoestore_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  const userCookie = useCookie<AdminUser | null>('shoestore_user', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

  const token = ref<string | null>(tokenCookie.value ?? null)
  const user = ref<AdminUser | null>(userCookie.value ?? null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const initials = computed(() =>
    (user.value?.name ?? 'A')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  )

  function setSession(payload: { accessToken: string; user: AdminUser }) {
    token.value = payload.accessToken
    user.value = payload.user
    tokenCookie.value = payload.accessToken
    userCookie.value = payload.user
  }

  function logout() {
    token.value = null
    user.value = null
    tokenCookie.value = null
    userCookie.value = null
  }

  return { token, user, loading, isAuthenticated, initials, setSession, logout }
})
