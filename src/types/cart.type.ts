export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

export interface Cart {
  userId: string
  items: CartItem[]
  totalPrice: number
  updatedAt: string
}
