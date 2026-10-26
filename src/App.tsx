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
  AdminPage,
} from "@/pages"
import { ToastContainer, type ToastMessage } from "@/components/common"
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

function App() {
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
      currentView === "orders"
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
