import type { ApiResponse } from '~/types'

/**
 * Thin wrapper over $fetch for the NestJS Admin API.
 * - injects the Bearer token
 * - unwraps { success, data, meta }
 * - handles 401 by logging out
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const toast = useToast()

  async function request<T>(path: string, options: any = {}): Promise<ApiResponse<T>> {
    try {
      const res = await $fetch<ApiResponse<T>>(`${config.public.apiBase}${path}`, {
        ...options,
        headers: {
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
          ...(options.headers || {}),
        },
      })
      return res
    } catch (err: any) {
      const status = err?.response?.status
      const message = err?.data?.message
      const text = Array.isArray(message) ? message.join(', ') : message || err?.message || 'ເກີດຂໍ້ຜິດພາດ'
      if (status === 401) {
        auth.logout()
        navigateTo('/login')
      } else if (options?.silent !== true) {
        toast.add({ title: 'ຜິດພາດ', description: text, color: 'error', icon: 'i-lucide-alert-circle' })
      }
      throw err
    }
  }

  return {
    get: <T>(path: string, query?: Record<string, any>, silent = false) =>
      request<T>(path, { method: 'GET', query, silent }),
    post: <T>(path: string, body?: any, silent = false) => request<T>(path, { method: 'POST', body, silent }),
    patch: <T>(path: string, body?: any, silent = false) => request<T>(path, { method: 'PATCH', body, silent }),
    del: <T>(path: string, silent = false) => request<T>(path, { method: 'DELETE', silent }),
    upload: async (files: File[]) => {
      const form = new FormData()
      files.forEach((f) => form.append('files', f))
      return request<{ files: { url: string; filename: string }[] }>('/admin/uploads', { method: 'POST', body: form })
    },
  }
}
