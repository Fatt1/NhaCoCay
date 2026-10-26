export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled"

export interface OrderCustomer {
  fullName: string
  phoneNumber: string
  email: string
  address: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface Order {
  id: string
  userId: string
  customer: OrderCustomer
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  note?: string
  createdAt: string
}
