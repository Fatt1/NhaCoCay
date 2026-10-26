import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { Product } from "@/types"
import { INITIAL_PRODUCTS, seedInitialProducts } from "./seed.service"

const PRODUCTS_COLLECTION = "products"

/**
 * Lấy danh sách toàn bộ sản phẩm (tự động seed nếu database trống hoặc fallback dữ liệu mẫu)
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return await seedInitialProducts()
    }

    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product)
  } catch (err) {
    console.warn("Firestore fetch error, fallback to seed products:", err)
    const now = new Date().toISOString()
    return INITIAL_PRODUCTS.map((item) => ({
      ...item,
      createdAt: now,
      updatedAt: now,
    }))
  }
}

/**
 * Tìm kiếm sản phẩm theo tên (không phân biệt chữ hoa, chữ thường)
 */
export const searchProducts = async (keyword: string): Promise<Product[]> => {
  const allProducts = await getProducts()
  const lowerKeyword = keyword.trim().toLowerCase()
  if (!lowerKeyword) return allProducts

  return allProducts.filter((product) =>
    product.name.toLowerCase().includes(lowerKeyword) ||
    product.shortDescription.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * Xem chi tiết 1 sản phẩm theo ID
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as Product
}

/**
 * Admin: Thêm mới sản phẩm
 */
export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> => {
  const now = new Date().toISOString()
  const newDocRef = doc(collection(db, PRODUCTS_COLLECTION))
  const newProduct: Product = {
    ...productData,
    id: newDocRef.id,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(newDocRef, newProduct)
  return newProduct
}

/**
 * Admin: Chỉnh sửa sản phẩm
 */
export const updateProduct = async (
  productId: string,
  productData: Partial<Omit<Product, "id" | "createdAt">>
): Promise<void> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId)
  await updateDoc(docRef, {
    ...productData,
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Admin: Xóa sản phẩm
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId)
  await deleteDoc(docRef)
}
