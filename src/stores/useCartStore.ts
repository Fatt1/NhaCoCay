import { create } from "zustand"
import type { CartItem } from "@/types"

interface CartState {
  isOpen: boolean
  items: CartItem[]
  voucherCode: string
  discountPercent: number
  openCart: () => void
  closeCart: () => void
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, delta: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  applyVoucher: (code: string) => boolean
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  isOpen: false,
  items: [], // Chưa đăng nhập thì giỏ hàng mặc định rỗng
  voucherCode: "",
  discountPercent: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  setItems: (items) => set({ items }),

  addItem: (newItem) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === newItem.productId
      )
      if (existingIndex > -1) {
        const updated = [...state.items]
        updated[existingIndex].quantity += newItem.quantity || 1
        return { items: updated }
      }
      return { items: [...state.items, newItem] }
    })
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const updated = state.items
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
      return { items: updated }
    })
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }))
  },

  clearCart: () => set({ items: [], voucherCode: "", discountPercent: 0 }),

  applyVoucher: (code) => {
    if (code.trim().toUpperCase() === "MAMXANH10") {
      set({ voucherCode: "MAMXANH10", discountPercent: 0.1 })
      return true
    }
    return false
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const discount = Math.round(subtotal * get().discountPercent)
    return Math.max(0, subtotal - discount)
  },
}))
