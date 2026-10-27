import React from "react"
import { useCartStore, useAuthStore } from "@/stores"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { navigateTo } from "@/lib/navigation"

interface CartDrawerProps {
  onNotify?: (message: string, icon?: string) => void
  onOpenAuthModal?: () => void
  onGoToCheckout?: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNotify,
  onOpenAuthModal,
  onGoToCheckout,
}) => {
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotal,
  } = useCartStore()

  const { user } = useAuthStore()

  if (!isOpen) return null

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      onNotify?.("Giỏ hàng của bạn đang trống!", "shopping_bag")
      return
    }

    closeCart()
    if (onGoToCheckout) {
      onGoToCheckout()
    } else {
      navigateTo("/checkout")
    }
  }

  const subtotal = getSubtotal()
  const total = getTotal()

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between border-l border-outline-variant/30 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">shopping_bag</span>
            <h3 className="font-heading font-semibold text-lg text-on-surface">Giỏ Hàng Của Bạn</h3>
            {user && (
              <Badge
                variant="secondary"
                className="bg-secondary-container text-primary text-xs font-semibold px-2 py-0.5 border-none"
              >
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
            aria-label="Đóng giỏ hàng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Item List */}
        <div className="p-6 flex-grow overflow-y-auto flex flex-col gap-4">
          {!user ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">lock</span>
              <p className="font-body text-sm max-w-xs">
                Bạn chưa đăng nhập. Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.
              </p>
              <Button
                onClick={() => {
                  closeCart()
                  onOpenAuthModal?.()
                }}
                className="rounded-full bg-primary text-on-primary text-xs font-semibold px-6"
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">shopping_basket</span>
              <p className="font-body text-sm">Giỏ hàng của bạn đang trống</p>
              <Button
                onClick={closeCart}
                className="rounded-full bg-primary text-on-primary text-xs font-semibold"
              >
                Chọn Kit Trồng Ngay
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30"
              >
                <div className="size-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0 flex flex-col gap-1">
                  <h4 className="font-medium text-sm text-on-surface truncate">{item.name}</h4>
                  <span className="text-xs text-primary font-bold">
                    {formatCurrency(item.price)}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="size-7 rounded-full bg-surface-container-lowest flex items-center justify-center font-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs text-on-surface px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="size-7 rounded-full bg-surface-container-lowest flex items-center justify-center font-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-outline hover:text-error transition-colors p-1 cursor-pointer"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {user && items.length > 0 && (
          <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low/50 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-on-surface">{formatCurrency(subtotal)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-sm font-bold text-on-surface">
                <span>Tổng cộng</span>
                <span className="text-primary text-base">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full py-6 rounded-full bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Đặt Hàng Ngay 🌱
            </Button>
          </div>
        )}
      </aside>
    </div>
  )
}
