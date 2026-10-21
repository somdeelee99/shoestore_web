import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(true)
  const mobileSidebar = ref(false)
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setNotifications(items: any[], unread = 0) {
    notifications.value = items
    unreadCount.value = unread
  }

  return { sidebarOpen, mobileSidebar, notifications, unreadCount, toggleSidebar, setNotifications }
})
