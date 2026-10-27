import { useState, useEffect } from "react"
import { MainLayout } from "@/layouts"
import {
  HomePage,
  ProductDetailPage,
  PlantKitsPage,
  ForumPage,
  JournalsListPage,
  JournalDetailPage,
  CheckoutPage,
  OrderSuccessPage,
  OrdersHistoryPage,
  AboutPage,
  AdminPage,
} from "@/pages"
import { ToastContainer, type ToastMessage } from "@/components/common"
import { useAuthStore } from "@/stores"
import { AuthModal } from "@/components/auth/AuthModal"
import type { DiaryPost } from "@/types"

type AppView =
  | "home"
  | "kits"
  | "forum"
  | "journal"
  | "journal-detail"
  | "product-detail"
  | "checkout"
  | "order-success"
  | "orders"
  | "admin"
  | "about"

function App() {
  const { user } = useAuthStore()
  const [currentView, setCurrentView] = useState<AppView>("home")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [postToEdit, setPostToEdit] = useState<DiaryPost | null>(null)
  const [postsVersion, setPostsVersion] = useState(0)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const refreshPosts = () => setPostsVersion((v) => v + 1)

  const handleOpenNewPost = () => {
    setPostToEdit(null)
    setIsPostModalOpen(true)
  }

  const handleEditPost = (post: DiaryPost) => {
    setPostToEdit(post)
    setIsPostModalOpen(true)
  }

  const handleClosePostModal = () => {
    setIsPostModalOpen(false)
    setPostToEdit(null)
  }

  // Sync with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith("#/product/")) {
        const id = hash.replace("#/product/", "")
        if (id) {
          setSelectedProductId(id)
          setCurrentView("product-detail")
        }
      } else if (hash.startsWith("#/journal/")) {
        const id = hash.replace("#/journal/", "")
        if (id) {
          setSelectedDiaryId(id)
          setCurrentView("journal-detail")
        }
      } else if (hash.startsWith("#/order-success/")) {
        const id = hash.replace("#/order-success/", "")
        if (id) {
          setSelectedOrderId(id)
          setCurrentView("order-success")
        }
      } else if (hash === "#/checkout") {
        setCurrentView("checkout")
      } else if (hash === "#/orders") {
        setCurrentView("orders")
      } else if (hash === "#/admin" || hash.startsWith("#/admin/")) {
        setCurrentView("admin")
      } else if (hash === "#/journal") {
        setSelectedDiaryId(null)
        setCurrentView("journal")
      } else if (hash === "#/kits") {
        setSelectedProductId(null)
        setCurrentView("kits")
      } else if (hash === "#/forum") {
        setSelectedProductId(null)
        setCurrentView("forum")
      } else if (hash === "#/about") {
        setSelectedProductId(null)
        setSelectedDiaryId(null)
        setSelectedOrderId(null)
        setCurrentView("about")
      } else if (hash === "" || hash === "#" || hash === "#/") {
        setSelectedProductId(null)
        setSelectedDiaryId(null)
        setSelectedOrderId(null)
        setCurrentView("home")
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const addToast = (message: string, icon = "check_circle") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, icon }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleSelectProduct = (product: { id: string }) => {
    setSelectedProductId(product.id)
    setCurrentView("product-detail")
    window.location.hash = `#/product/${product.id}`
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSelectDiary = (diaryId: string) => {
    setSelectedDiaryId(diaryId)
    setCurrentView("journal-detail")
    window.location.hash = `#/journal/${diaryId}`
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleGoToCheckout = () => {
    setCurrentView("checkout")
    window.location.hash = "#/checkout"
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleOrderSuccess = (orderId: string) => {
    setSelectedOrderId(orderId)
    setCurrentView("order-success")
    window.location.hash = `#/order-success/${orderId}`
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavigateOrders = () => {
    setSelectedProductId(null)
    setSelectedDiaryId(null)
    setSelectedOrderId(null)
    setCurrentView("orders")
    window.location.hash = "#/orders"
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavigateAdmin = () => {
    if (!user || user.role !== "admin") {
      addToast("Chỉ tài khoản Quản Trị Viên mới có quyền truy cập trang Admin!", "lock")
      setIsAuthModalOpen(true)
      return
    }
    setSelectedProductId(null)
    setSelectedDiaryId(null)
    setSelectedOrderId(null)
    setCurrentView("admin")
    window.location.hash = "#/admin"
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavigateTab = (tab: "home" | "kits" | "forum" | "journal" | "about") => {
    if (tab === "kits") {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("kits")
      window.location.hash = "#/kits"
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (tab === "forum") {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("forum")
      window.location.hash = "#/forum"
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (tab === "journal") {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("journal")
      window.location.hash = "#/journal"
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (tab === "about") {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("about")
      window.location.hash = "#/about"
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (tab === "home") {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("home")
      window.location.hash = "#/"
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSearch = (kw: string) => {
    setSearchKeyword(kw)
    if (
      currentView === "product-detail" ||
      currentView === "forum" ||
      currentView === "journal" ||
      currentView === "journal-detail" ||
      currentView === "checkout" ||
      currentView === "order-success" ||
      currentView === "orders" ||
      currentView === "about"
    ) {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("kits")
      window.location.hash = "#/kits"
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const scrollToSection = (sectionId: string) => {
    if (currentView !== "home") {
      setSelectedProductId(null)
      setSelectedDiaryId(null)
      setSelectedOrderId(null)
      setCurrentView("home")
      window.location.hash = "#/"
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } else {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const activeHeaderTab: "home" | "kits" | "forum" | "journal" | "about" | undefined =
    currentView === "product-detail"
      ? "home"
      : currentView === "journal-detail"
      ? "journal"
      : currentView === "checkout" || currentView === "order-success"
      ? "kits"
      : currentView === "orders" || currentView === "admin"
      ? undefined
      : currentView

  if (currentView === "admin") {
    if (!user || user.role !== "admin") {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 selection:bg-secondary-container">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-8 sm:p-10 border border-outline-variant/30 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs ring-8 ring-rose-50/50">
              <span className="material-symbols-outlined text-[34px]">admin_panel_settings</span>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                Khu vực hạn chế
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight pt-1">
                Yêu Cầu Quyền Quản Trị
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-body">
                {!user
                  ? "Trang quản trị chỉ dành riêng cho Quản Trị Viên (Admin) của Nhà Có Cây. Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục."
                  : `Tài khoản (${user.email}) hiện không có quyền Quản Trị Viên (Admin). Vui lòng đăng nhập bằng tài khoản Quản Trị Viên được phân quyền.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNavigateTab("home")}
                className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/40 text-xs sm:text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Về Trang Chủ
              </button>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                {!user ? "Đăng Nhập Admin" : "Đổi Tài Khoản"}
              </button>
            </div>
          </div>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(msg) => addToast(msg, "eco")}
          />
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      )
    }

    return (
      <>
        <AdminPage
          onBackToShop={() => handleNavigateTab("home")}
          onNotify={addToast}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <MainLayout
      activeTab={activeHeaderTab}
      onNavigateTab={handleNavigateTab}
      onSearch={handleSearch}
      onNavigateSection={scrollToSection}
      isPostModalOpen={isPostModalOpen}
      onClosePostModal={handleClosePostModal}
      postToEdit={postToEdit}
      onPostSuccess={refreshPosts}
      isAuthModalOpen={isAuthModalOpen}
      onCloseAuthModal={() => setIsAuthModalOpen(false)}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
      toasts={toasts}
      onRemoveToast={removeToast}
      onNotify={addToast}
      onGoToCheckout={handleGoToCheckout}
      onNavigateOrders={handleNavigateOrders}
      onNavigateAdmin={handleNavigateAdmin}
    >
      {currentView === "product-detail" && selectedProductId ? (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => handleNavigateTab("home")}
          onSelectProduct={handleSelectProduct}
          onNotify={addToast}
          onGoToCommunity={() => handleNavigateTab("forum")}
        />
      ) : currentView === "checkout" ? (
        <CheckoutPage
          onBack={() => handleNavigateTab("kits")}
          onOrderSuccess={handleOrderSuccess}
          onNotify={addToast}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      ) : currentView === "order-success" && selectedOrderId ? (
        <OrderSuccessPage
          orderId={selectedOrderId}
          onContinueShopping={() => handleNavigateTab("kits")}
          onGoToJournals={() => handleNavigateTab("journal")}
        />
      ) : currentView === "orders" ? (
        <OrdersHistoryPage
          onBack={() => handleNavigateTab("home")}
          onSelectOrder={(orderId) => handleOrderSuccess(orderId)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onGoToShop={() => handleNavigateTab("kits")}
        />
      ) : currentView === "journal-detail" && selectedDiaryId ? (
        <JournalDetailPage
          diaryId={selectedDiaryId}
          onBack={() => handleNavigateTab("journal")}
          onGoToForum={() => handleNavigateTab("forum")}
          onNotify={addToast}
        />
      ) : currentView === "journal" ? (
        <JournalsListPage
          onSelectDiary={handleSelectDiary}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNotify={addToast}
        />
      ) : currentView === "kits" ? (
        <PlantKitsPage
          searchKeyword={searchKeyword}
          onBack={() => handleNavigateTab("home")}
          onSelectProduct={handleSelectProduct}
          onNotify={addToast}
          onSearchChange={setSearchKeyword}
        />
      ) : currentView === "forum" ? (
        <ForumPage
          onBack={() => handleNavigateTab("home")}
          onOpenNewPost={handleOpenNewPost}
          onEditPost={handleEditPost}
          onNotify={addToast}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          postsVersion={postsVersion}
          onRefreshPosts={refreshPosts}
        />
      ) : currentView === "about" ? (
        <AboutPage
          onNavigateTab={handleNavigateTab}
          onExploreKits={() => handleNavigateTab("kits")}
        />
      ) : (
        <HomePage
          searchKeyword={searchKeyword}
          onOpenNewPost={handleOpenNewPost}
          onEditPost={handleEditPost}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNotify={addToast}
          onSelectProduct={handleSelectProduct}
          postsVersion={postsVersion}
        />
      )}
    </MainLayout>
  )
}

export default App
