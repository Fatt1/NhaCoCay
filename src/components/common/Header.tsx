import React from "react"
import logoImg from "@/assets/Logo.png"
import { useAuthStore, useCartStore } from "@/stores"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { navigateTo } from "@/lib/navigation"

interface HeaderProps {
  activeTab?: "home" | "kits" | "forum" | "journal" | "about"
  onNavigateTab?: (tab: "home" | "kits" | "forum" | "journal" | "about") => void
  onSearch?: (keyword: string) => void
  onNavigateSection?: (sectionId: string) => void
  onOpenAuthModal?: () => void
  onNotify?: (message: string, icon?: string) => void
  onNavigateOrders?: () => void
  onNavigateAdmin?: () => void
}

const getInitial = (name: string): string => {
  if (!name) return "U"
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words[words.length - 1].charAt(0).toUpperCase()
}

const getAvatarBgClass = (name: string): string => {
  const colors = [
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-teal-100 text-teal-800",
    "bg-sky-100 text-sky-800",
    "bg-rose-100 text-rose-800",
    "bg-indigo-100 text-indigo-800",
  ]
  let hash = 0
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getDisplayName = (user: { fullName?: string; email?: string } | null): string => {
  if (!user) return ""
  if (user.fullName && user.fullName.trim()) {
    return user.fullName.trim()
  }
  if (user.email) {
    return user.email.split("@")[0]
  }
  return "Thành viên"
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = "home",
  onNavigateTab,
  onNavigateSection: _onNavigateSection,
  onOpenAuthModal,
  onNotify,
  onNavigateOrders,
  onNavigateAdmin,
}) => {
  const { user, reset } = useAuthStore()
  const { items, openCart } = useCartStore()

  const cartTotalQty = user ? items.reduce((sum, item) => sum + item.quantity, 0) : 0
  const displayName = getDisplayName(user)

  const handleCartClick = () => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để xem và quản lý giỏ hàng!", "lock")
      onOpenAuthModal?.()
      return
    }
    openCart()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between relative">
        {/* Logo */}
        <div
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab("home")
            } else {
              navigateTo("/")
            }
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none"
        >
          <img
            src={logoImg}
            alt="Nhà Có Cây Logo"
            className="h-12 sm:h-18 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />

        </div>

        {/* Centered Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => {
              onNavigateTab?.("home")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`px-3.5 py-1.5 font-semibold text-[14px] transition-all cursor-pointer ${activeTab === "home"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-full"
              }`}
          >
            Trang Chủ
          </button>
          <button
            onClick={() => onNavigateTab?.("kits")}
            className={`px-3.5 py-1.5 font-semibold text-[14px] transition-all cursor-pointer ${activeTab === "kits"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-full"
              }`}
          >
            Bộ Kit Trồng Cây
          </button>
          <button
            onClick={() => onNavigateTab?.("forum")}
            className={`px-3.5 py-1.5 font-semibold text-[14px] transition-all cursor-pointer ${activeTab === "forum"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-full"
              }`}
          >
            Diễn Đàn
          </button>
          <button
            onClick={() => onNavigateTab?.("journal")}
            className={`px-3.5 py-1.5 font-semibold text-[14px] transition-all cursor-pointer ${activeTab === "journal"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-full"
              }`}
          >
            Nhật Ký Cây
          </button>
          <button
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab("about")
              } else {
                navigateTo("/about")
              }
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`px-3.5 py-1.5 font-semibold text-[14px] transition-all cursor-pointer ${activeTab === "about"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-full"
              }`}
          >
            Về Chúng Tôi
          </button>
        </nav>

        {/* Right Tools (Cart, User Profile Dropdown) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Giỏ hàng"
            onClick={handleCartClick}
            className="relative p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            {user && cartTotalQty > 0 && (
              <Badge
                variant="secondary"
                className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-secondary text-on-secondary text-[10px] font-bold p-0 border-none"
              >
                {cartTotalQty}
              </Badge>
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/50 shrink-0">
            {user ? (
              <div className="relative group py-2">
                <button
                  type="button"
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-surface-container/60 transition-colors cursor-pointer select-none"
                >
                  <Avatar className="size-9 ring-2 ring-primary/20">
                    <AvatarFallback
                      className={`font-bold text-sm ${getAvatarBgClass(displayName)}`}
                    >
                      {getInitial(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex items-center gap-1 text-left">
                    <span className="font-semibold text-xs text-on-surface leading-tight max-w-[130px] truncate">
                      {displayName}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu on hover */}
                <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-56 bg-surface rounded-2xl shadow-xl border border-outline-variant/30 py-2 overflow-hidden text-left">
                    {/* User preview header */}
                    <div className="px-4 py-2.5 border-b border-outline-variant/15 bg-surface-container-low/40">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-xs text-on-surface truncate">{displayName}</p>
                        {user.role === "admin" && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Option 1: Lịch sử đơn hàng */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateOrders) {
                          onNavigateOrders()
                        } else {
                          navigateTo("/orders")
                        }
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs text-on-surface hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        receipt_long
                      </span>
                      <span className="font-semibold">Lịch Sử Đơn Hàng</span>
                    </button>

                    {/* Option: Quản trị Admin (Chỉ hiển thị cho tài khoản có quyền Admin) */}
                    {user.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateAdmin) {
                            onNavigateAdmin()
                          } else {
                            navigateTo("/admin")
                          }
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs text-on-surface hover:text-[#193a2c] hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-emerald-800">
                          admin_panel_settings
                        </span>
                        <span className="font-semibold">Trang Quản Trị (Admin)</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-outline-variant/15" />

                    {/* Option 2: Đăng xuất */}
                    <button
                      type="button"
                      onClick={() => {
                        reset()
                        onNotify?.("Đã đăng xuất tài khoản thành công!", "logout")
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span className="font-semibold">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onOpenAuthModal}
                className="rounded-full bg-primary text-on-primary font-semibold text-xs px-4 h-9 shadow-sm"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
