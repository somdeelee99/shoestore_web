import dayjs from 'dayjs'
import 'dayjs/locale/lo'

export const useFormat = () => {
  const { locale } = useI18n()

  const currency = (value?: number | string | null) => {
    const n = Number(value ?? 0)
    return `${new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'lo-LA').format(Math.round(n))} ₭`
  }

  const number = (value?: number | string | null) =>
    new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'lo-LA').format(Number(value ?? 0))

  const date = (value?: string | Date | null) => (value ? dayjs(value).format('DD/MM/YYYY') : '-')

  const dateTime = (value?: string | Date | null) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-')

  const timeAgo = (value?: string | Date | null) => {
    if (!value) return '-'
    const diff = Date.now() - new Date(value).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'ດຽວນີ້'
    if (min < 60) return `${min} ນາທີກ່ອນ`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr} ຊົ່ວໂມງກ່ອນ`
    const day = Math.floor(hr / 24)
    if (day < 30) return `${day} ມື້ກ່ອນ`
    return dayjs(value).format('DD/MM/YYYY')
  }

  const dateInput = (value?: string | Date | null) => (value ? dayjs(value).format('YYYY-MM-DD') : '')

  return { currency, number, date, dateTime, timeAgo, dateInput }
}

/** Builds an absolute URL for files served by the API (uploads, avatars...). */
export const useAssetUrl = () => {
  const config = useRuntimeConfig()
  return (path?: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${config.public.apiOrigin}${path}`
  }
}
