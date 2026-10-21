import type { OrderStatus } from '~/types'

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'ລໍຖ້າຢືນຢັນ', color: 'warning', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'ຢືນຢັນແລ້ວ', color: 'info', dot: 'bg-sky-500' },
  PACKING: { label: 'ກຳລັງກຽມສົ່ງ', color: 'info', dot: 'bg-blue-500' },
  SHIPPING: { label: 'ກຳລັງຂົນສົ່ງ', color: 'primary', dot: 'bg-orange-500' },
  DELIVERED: { label: 'ສຳເລັດ', color: 'success', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'ຍົກເລີກ', color: 'error', dot: 'bg-rose-500' },
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: 'ເກັບເງິນປາຍທາງ',
  BANK_TRANSFER: 'ໂອນທະນາຄານ',
  E_WALLET: 'E-Wallet',
  CREDIT_CARD: 'ບັດເຄຣດິດ',
}

export const SHIPPING_METHOD_LABEL: Record<string, string> = {
  STANDARD: 'ມາດຕະຖານ (3-5 ວັນ)',
  EXPRESS: 'ດ່ວນ (1-2 ວັນ)',
  SAME_DAY: 'ສົ່ງພາຍໃນວັນ',
}

export const PAYMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  UNPAID: { label: 'ຍັງບໍ່ຊຳລະ', color: 'warning' },
  PAID: { label: 'ຊຳລະແລ້ວ', color: 'success' },
  REFUNDED: { label: 'ຄືນເງິນ', color: 'error' },
}

export const useStatus = () => ({
  orderMeta: (status: OrderStatus) => ORDER_STATUS_META[status] ?? { label: status, color: 'neutral', dot: 'bg-slate-400' },
  paymentMeta: (status: string) => PAYMENT_STATUS_META[status] ?? { label: status, color: 'neutral' },
  paymentMethod: (m: string) => PAYMENT_METHOD_LABEL[m] ?? m,
  shippingMethod: (m: string) => SHIPPING_METHOD_LABEL[m] ?? m,
})
