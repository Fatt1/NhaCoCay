import React from "react"
import { Header, Footer, ToastContainer, FloatingChatWidget, type ToastMessage } from "@/components/common"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { NewPostModal } from "@/components/community/NewPostModal"
import { AuthModal } from "@/components/auth/AuthModal"

import type { DiaryPost } from "@/types"

interface MainLayoutProps {
  children: React.ReactNode
  activeTab?: "home" | "kits" | "forum" | "journal" | "about"
  onNavigateTab?: (tab: "home" | "kits" | "forum" | "journal" | "about") => void
  searchKeyword?: string
  onSearch?: (keyword: string) => void
  onNavigateSection?: (sectionId: string) => void
  isPostModalOpen?: boolean
  onClosePostModal?: () => void
  postToEdit?: DiaryPost | null
  onPostSuccess?: (message: string) => void
  isAuthModalOpen?: boolean
  onCloseAuthModal?: () => void
  onOpenAuthModal?: () => void
  toasts?: ToastMessage[]
  onRemoveToast?: (id: string) => void
  onNotify?: (message: string, icon?: string) => void
  onGoToCheckout?: () => void
  onNavigateOrders?: () => void
  onNavigateAdmin?: () => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab = "home",
  onNavigateTab,
  onSearch,
  onNavigateSection,
  isPostModalOpen = false,
  onClosePostModal = () => {},
  postToEdit = null,
  onPostSuccess,
  isAuthModalOpen = false,
  onCloseAuthModal = () => {},
  onOpenAuthModal,
  toasts = [],
  onRemoveToast = () => {},
  onNotify,
  onGoToCheckout,
  onNavigateOrders,
  onNavigateAdmin,
}) => {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-container selection:text-on-secondary-container">
      <Header
        activeTab={activeTab}
        onNavigateTab={onNavigateTab}
        onSearch={onSearch}
        onNavigateSection={onNavigateSection}
        onOpenAuthModal={onOpenAuthModal}
        onNotify={onNotify}
        onNavigateOrders={onNavigateOrders}
        onNavigateAdmin={onNavigateAdmin}
      />

      <main className="w-full pt-20 bg-surface flex-grow">{children}</main>

      <Footer onNotify={onNotify} />

      {/* Global Modals & Drawers */}
      <CartDrawer
        onNotify={onNotify}
        onOpenAuthModal={onOpenAuthModal}
        onGoToCheckout={onGoToCheckout}
      />
      <NewPostModal
        isOpen={isPostModalOpen}
        onClose={onClosePostModal}
        postToEdit={postToEdit}
        onSuccess={(msg) => {
          onNotify?.(msg, "check_circle")
          onPostSuccess?.(msg)
        }}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onCloseAuthModal}
        onSuccess={(msg) => onNotify?.(msg, "eco")}
      />
      <ToastContainer toasts={toasts} onRemove={onRemoveToast} />
      <FloatingChatWidget />
    </div>
  )
}
