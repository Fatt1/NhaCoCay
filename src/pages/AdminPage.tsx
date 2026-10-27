import React, { useState, useEffect } from "react"
import {
  getAllOrders,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getPosts,
  deletePost,
} from "@/services"
import type { Order, OrderStatus, Product, DiaryPost } from "@/types"
import {
  AdminLayout,
  AdminDashboardPage,
  AdminOrdersPage,
  AdminProductsPage,
  AdminPostsPage,
  type AdminTab,
} from "./admin"
import { ProductFormModal } from "@/components/admin/ProductFormModal"
import { OrderDetailModal } from "@/components/admin/OrderDetailModal"
import { navigateTo } from "@/lib/navigation"

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
      const path = window.location.pathname + window.location.hash
      if (path.includes("products")) return "products"
      if (path.includes("orders")) return "orders"
      if (path.includes("posts")) return "posts"
      return "dashboard"
    }
    return "dashboard"
  })

  // Sync pathname with active tab
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname + window.location.hash
      if (path.includes("products")) {
        setActiveTab("products")
      } else if (path.includes("orders")) {
        setActiveTab("orders")
      } else if (path.includes("posts")) {
        setActiveTab("posts")
      } else if (path.includes("dashboard") || path === "/admin" || path === "/admin/" || path === "#/admin") {
        setActiveTab("dashboard")
      }
    }
    window.addEventListener("popstate", handleLocationChange)
    window.addEventListener("hashchange", handleLocationChange)
    return () => {
      window.removeEventListener("popstate", handleLocationChange)
      window.removeEventListener("hashchange", handleLocationChange)
    }
  }, [])

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab)
    const newPath = tab === "dashboard" ? "/admin" : `/admin/${tab}`
    navigateTo(newPath)
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

  // Posts State
  const [posts, setPosts] = useState<DiaryPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [postSearch, setPostSearch] = useState("")
  const [postImageFilter, setPostImageFilter] = useState<"all" | "with_image" | "text_only">("all")
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

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

  // Load All Posts
  const loadPosts = async () => {
    try {
      setLoadingPosts(true)
      const data = await getPosts()
      setPosts(data)
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài viết admin:", err)
      onNotify?.("Không thể tải danh sách bài viết!", "error")
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    loadOrders()
    loadProducts()
    loadPosts()
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await Promise.all([loadOrders(), loadProducts(), loadPosts()])
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

  // Handle Delete Post
  const handleDeletePost = async (post: DiaryPost) => {
    try {
      setDeletingPostId(post.id)
      await deletePost(post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      onNotify?.(`Đã xóa bài viết "${post.title}" thành công!`, "delete")
    } catch (err) {
      console.error("Lỗi khi xóa bài viết:", err)
      onNotify?.("Có lỗi xảy ra khi xóa bài viết!", "error")
    } finally {
      setDeletingPostId(null)
    }
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
        postsCount={posts.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenAddProduct={handleOpenAddProduct}
        onBackToShop={onBackToShop}
      >
        {activeTab === "dashboard" && (
          <AdminDashboardPage
            orders={orders}
            products={products}
            postsCount={posts.length}
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

        {activeTab === "posts" && (
          <AdminPostsPage
            posts={posts}
            loadingPosts={loadingPosts}
            postSearch={postSearch}
            onPostSearchChange={setPostSearch}
            postImageFilter={postImageFilter}
            onPostImageFilterChange={setPostImageFilter}
            deletingPostId={deletingPostId}
            onDeletePost={handleDeletePost}
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
