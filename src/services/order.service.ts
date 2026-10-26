import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { Order, OrderCustomer, OrderItem, OrderStatus } from "@/types"
import { clearCart } from "./cart.service"

const ORDERS_COLLECTION = "orders"
const PRODUCTS_COLLECTION = "products"

/**
 * Đặt hàng: tạo đơn hàng mới, tự động trừ số lượng tồn kho sản phẩm và xóa giỏ hàng
 */
export const createOrder = async (
  userId: string,
  customer: OrderCustomer,
  items: OrderItem[],
  totalAmount: number,
  note?: string
): Promise<Order> => {
  const newDocRef = doc(collection(db, ORDERS_COLLECTION))
  const newOrder: Order = {
    id: newDocRef.id,
    userId: userId,
    customer,
    items,
    totalAmount,
    status: "pending",
    note: note || "",
    createdAt: new Date().toISOString(),
  }

  // 1. Lưu trực tiếp đơn hàng xuống Firestore DB
  await setDoc(newDocRef, newOrder)

  // 2. Tự động trừ số lượng tồn kho (stockQuantity) của từng sản phẩm trong Firestore DB
  for (const item of items) {
    if (item.productId && item.quantity > 0) {
      try {
        const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId)
        const prodSnap = await getDoc(prodRef)
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stockQuantity ?? 0
          const updatedStock = Math.max(0, currentStock - item.quantity)
          await updateDoc(prodRef, {
            stockQuantity: updatedStock,
            updatedAt: new Date().toISOString(),
          })
        }
      } catch (stockErr) {
        console.warn(`Could not deduct stock for product ${item.productId}:`, stockErr)
      }
    }
  }

  // 3. Xóa giỏ hàng của user sau khi đặt hàng thành công
  if (userId) {
    try {
      await clearCart(userId)
    } catch (e) {
      console.warn("Could not clear remote cart:", e)
    }
  }

  return newOrder
}

/**
 * Lấy danh sách các đơn hàng của user trực tiếp từ Firestore theo userId
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) return []

  const ordersRef = collection(db, ORDERS_COLLECTION)
  // Query trực tiếp theo userId
  const q = query(ordersRef, where("userId", "==", userId))
  const snapshot = await getDocs(q)

  const orders = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order)
  )

  // Sắp xếp đơn hàng mới nhất lên đầu
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return orders
}

/**
 * Admin: Xem danh sách toàn bộ đơn hàng từ Firestore
 */
export const getAllOrders = async (): Promise<Order[]> => {
  const ordersRef = collection(db, ORDERS_COLLECTION)
  const snapshot = await getDocs(ordersRef)
  const orders = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Order)
  )
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return orders
}

/**
 * Xem chi tiết 1 đơn hàng theo ID từ Firestore
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Order
  }
  return null
}

/**
 * Admin: Cập nhật trạng thái đơn hàng trên Firestore
 * (Tự động hoàn lại số lượng tồn kho nếu đơn hàng bị hủy)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId)
  const orderSnap = await getDoc(docRef)

  if (orderSnap.exists()) {
    const orderData = orderSnap.data() as Order
    const prevStatus = orderData.status

    // Nếu đơn hàng bị hủy ('cancelled') và trước đó chưa hủy -> hoàn lại số lượng tồn kho
    if (status === "cancelled" && prevStatus !== "cancelled") {
      for (const item of orderData.items) {
        if (item.productId && item.quantity > 0) {
          try {
            const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId)
            const prodSnap = await getDoc(prodRef)
            if (prodSnap.exists()) {
              const currentStock = prodSnap.data().stockQuantity ?? 0
              await updateDoc(prodRef, {
                stockQuantity: currentStock + item.quantity,
                updatedAt: new Date().toISOString(),
              })
            }
          } catch (e) {
            console.warn("Could not restore stock on order cancellation:", e)
          }
        }
      }
    }
    // Nếu đơn hàng từ 'cancelled' được chuyển lại trạng thái khác -> trừ lại số lượng tồn kho
    else if (prevStatus === "cancelled" && status !== "cancelled") {
      for (const item of orderData.items) {
        if (item.productId && item.quantity > 0) {
          try {
            const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId)
            const prodSnap = await getDoc(prodRef)
            if (prodSnap.exists()) {
              const currentStock = prodSnap.data().stockQuantity ?? 0
              await updateDoc(prodRef, {
                stockQuantity: Math.max(0, currentStock - item.quantity),
                updatedAt: new Date().toISOString(),
              })
            }
          } catch (e) {
            console.warn("Could not re-deduct stock on order reactivation:", e)
          }
        }
      }
    }
  }

  await updateDoc(docRef, { status })
}
