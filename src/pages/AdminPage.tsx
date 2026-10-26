import React, { useState, useEffect } from "react"
import {
  getAllOrders,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services"
import type { Order, OrderStatus, Product } from "@/types"
import {
  AdminLayout,
  AdminDashboardPage,
  AdminOrdersPage,
  AdminProductsPage,
  type AdminTab,
} from "./admin"
import { ProductFormModal } from "@/components/admin/ProductFormModal"
import { OrderDetailModal } from "@/components/admin/OrderDetailModal"

interface AdminPageProps {
  onBackToShop: () => void
  onNotify?: (message: string, icon?: string) => void
  initialTab?: AdminTab
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onBackToShop,
  onNotify,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (initialTab) return initialTab
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash.includes("products")) return "products"
      if (hash.includes("orders")) return "orders"
      return "dashboard"
    }
    return "dashboard"
  })

  // Sync hash with active tab
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      if (hash.includes("products")) {
        setActiveTab("products")
      } else if (hash.includes("orders")) {
        setActiveTab("orders")
      } else if (hash.includes("dashboard") || hash === "#/admin" || hash === "#/admin/") {
        setActiveTab("dashboard")
      }
    }
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab)
    window.location.hash = `#/admin/${tab}`
  }

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)

  // Products State
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productSearch, setProductSearch] = useState("")
  const [productStockFilter, setProductStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all")
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load All Orders
  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      const data = await getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng admin:", err)
      onNotify?.("Không thể tải danh sách đơn hàng!", "error")
    } finally {
      setLoadingOrders(false)
    }
  }

  // Load All Products
  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm admin:", err)
      onNotify?.("Không thể tải danh sách sản phẩm!", "error")
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadOrders()
    loadProducts()
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await Promise.all([loadOrders(), loadProducts()])
      onNotify?.("Dữ liệu quản trị đã được làm mới!", "check_circle")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle Order Status Update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId)
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
        setSelectedOrderForDetail((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
      onNotify?.("Đã cập nhật trạng thái đơn hàng thành công!", "check_circle")
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err)
      onNotify?.("Không thể cập nhật trạng thái đơn hàng!", "error")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Handle View Order Detail Popup
  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrderForDetail(order)
    setIsOrderDetailOpen(true)
  }

  // Handle Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ kit "${product.name}" khỏi cơ sở dữ liệu không?`
    )
    if (!confirmed) return

    try {
      setDeletingProductId(product.id)
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      onNotify?.(`Đã xóa bộ kit "${product.name}" thành công!`, "delete")
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err)
      onNotify?.("Có lỗi xảy ra khi xóa sản phẩm!", "error")
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleProductSubmit = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p
        )
      )
      onNotify?.(`Đã cập nhật thành công sản phẩm "${productData.name}"!`, "check_circle")
    } else {
      const created = await createProduct(productData)
      setProducts((prev) => [created, ...prev])
      onNotify?.(`Đã thêm mới bộ kit "${productData.name}" lên cửa hàng!`, "eco")
    }
    setIsProductModalOpen(false)
  }

  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onSwitchTab={switchTab}
        ordersCount={orders.length}
        pendingOrdersCount={pendingOrdersCount}
        productsCount={products.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenAddProduct={handleOpenAddProduct}
        onBackToShop={onBackToShop}
      >
        {activeTab === "dashboard" && (
          <AdminDashboardPage
            orders={orders}
            products={products}
            loadingOrders={loadingOrders}
            onNavigateTab={switchTab}
            onOpenOrderDetail={handleOpenOrderDetail}
            onSetOrderStatusFilter={setOrderStatusFilter}
          />
        )}

        {activeTab === "orders" && (
          <AdminOrdersPage
            orders={orders}
            loadingOrders={loadingOrders}
            orderSearch={orderSearch}
            onOrderSearchChange={setOrderSearch}
            orderStatusFilter={orderStatusFilter}
            onOrderStatusFilterChange={setOrderStatusFilter}
            updatingOrderId={updatingOrderId}
            onUpdateStatus={handleUpdateStatus}
            onOpenOrderDetail={handleOpenOrderDetail}
          />
        )}

        {activeTab === "products" && (
          <AdminProductsPage
            products={products}
            loadingProducts={loadingProducts}
            productSearch={productSearch}
            onProductSearchChange={setProductSearch}
            productStockFilter={productStockFilter}
            onProductStockFilterChange={setProductStockFilter}
            deletingProductId={deletingProductId}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </AdminLayout>

      {/* Product Form Modal (Shadcn Dialog) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
      />

      {/* Order Detail Modal (Shadcn Dialog) */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        isOpen={isOrderDetailOpen}
        onClose={() => {
          setIsOrderDetailOpen(false)
          setSelectedOrderForDetail(null)
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  )
}
