import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/config/firebase"
import type { Cart, CartItem } from "@/types"

const CARTS_COLLECTION = "carts"

/**
 * Lấy giỏ hàng của người dùng hiện tại
 */
export const getCart = async (userId: string): Promise<Cart> => {
  const docRef = doc(db, CARTS_COLLECTION, userId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    const emptyCart: Cart = {
      userId,
      items: [],
      totalPrice: 0,
      updatedAt: new Date().toISOString(),
    }
    await setDoc(docRef, emptyCart)
    return emptyCart
  }

  return docSnap.data() as Cart
}

/**
 * Thêm sản phẩm vào giỏ hàng (nếu đã có thì cộng dồn số lượng)
 */
export const addToCart = async (
  userId: string,
  newItem: Omit<CartItem, "quantity">,
  quantity = 1
): Promise<Cart> => {
  const currentCart = await getCart(userId)
  const existingItemIndex = currentCart.items.findIndex(
    (item) => item.productId === newItem.productId
  )

  let updatedItems: CartItem[]

  if (existingItemIndex > -1) {
    updatedItems = currentCart.items.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    )
  } else {
    updatedItems = [...currentCart.items, { ...newItem, quantity }]
  }

  const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const updatedCart: Cart = {
    userId,
    items: updatedItems,
    totalPrice,
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(db, CARTS_COLLECTION, userId), updatedCart)
  return updatedCart
}

/**
 * Cập nhật số lượng của một món hàng trong giỏ (nếu quantity <= 0 thì tự xóa)
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart> => {
  if (quantity <= 0) {
    return removeFromCart(userId, productId)
  }

  const currentCart = await getCart(userId)
  const updatedItems = currentCart.items.map((item) =>
    item.productId === productId ? { ...item, quantity } : item
  )

  const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const updatedCart: Cart = {
    userId,
    items: updatedItems,
    totalPrice,
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(db, CARTS_COLLECTION, userId), updatedCart)
  return updatedCart
}

/**
 * Xóa một sản phẩm ra khỏi giỏ hàng
 */
export const removeFromCart = async (userId: string, productId: string): Promise<Cart> => {
  const currentCart = await getCart(userId)
  const updatedItems = currentCart.items.filter((item) => item.productId !== productId)
  const totalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const updatedCart: Cart = {
    userId,
    items: updatedItems,
    totalPrice,
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(db, CARTS_COLLECTION, userId), updatedCart)
  return updatedCart
}

/**
 * Xóa trắng giỏ hàng (sau khi đặt hàng thành công)
 */
export const clearCart = async (userId: string): Promise<void> => {
  const emptyCart: Cart = {
    userId,
    items: [],
    totalPrice: 0,
    updatedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, CARTS_COLLECTION, userId), emptyCart)
}
