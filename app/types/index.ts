export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  meta?: PageMeta & { statusCounts?: Record<string, number> }
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminUser {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  role: 'ADMIN' | 'STAFF'
  status: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  status: boolean
  sortOrder: number
  productCount: number
}

export interface Variant {
  id: string
  sku: string
  size: string
  color: string
  colorHex?: string
  price: number
  stock: number
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  brand?: string
  description?: string
  price: number
  comparePrice?: number
  costPrice?: number
  status: 'ACTIVE' | 'DRAFT'
  featured: boolean
  rating: number
  reviewCount: number
  soldCount: number
  categoryId: string
  category?: { id: string; name: string }
  images: { id: string; url: string }[]
  variants: Variant[]
  thumbnail?: string | null
  stock?: number
  createdAt: string
}

export interface OrderItem {
  id: string
  name: string
  image?: string
  size?: string
  color?: string
  price: number
  quantity: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  code: string
  customer?: { id: string; name: string; phone?: string; email?: string; avatar?: string }
  status: OrderStatus
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED'
  paymentMethod: string
  shippingMethod: string
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  recipient: string
  phone: string
  shippingAddress: string
  note?: string
  trackingNumber?: string
  items: OrderItem[]
  history?: { id: string; status: OrderStatus; note?: string; createdAt: string }[]
  itemCount?: number
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  status: 'ACTIVE' | 'BLOCKED'
  createdAt: string
  orderCount: number
  totalSpent: number
}

export interface Coupon {
  id: string
  code: string
  name: string
  type: 'PERCENT' | 'FIXED'
  value: number
  minSpend: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startAt: string
  endAt: string
  status: boolean
}

export interface InventoryRow {
  id: string
  sku: string
  size: string
  color: string
  colorHex?: string
  stock: number
  price: number
  product: { id: string; name: string; thumbnail?: string | null }
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
}

export interface DashboardData {
  range: { from: string; to: string }
  kpis: {
    revenue: { value: number; growth: number }
    orders: { value: number; growth: number }
    customers: { value: number; growth: number }
    products: { value: number; growth: number }
    pendingOrders: number
  }
  revenueChart: { date: string; revenue: number; orders: number }[]
  orderStatusDistribution: { status: OrderStatus; count: number; previous: number }[]
  topProducts: { productId: string; name: string; thumbnail?: string; quantity: number; revenue: number }[]
  categoryDistribution: { category: string; count: number }[]
  recentOrders: Order[]
}

export interface ChatConversation {
  id: string
  customer: { id: string; name: string; avatar?: string; phone?: string }
  lastMessage?: string
  lastMessageAt: string
  unread: number
}

export interface ChatMessage {
  id: string
  body: string
  senderRole: 'CUSTOMER' | 'STAFF'
  senderId?: string
  sender?: { id: string; name: string; avatar?: string; role: string }
  createdAt: string
}
