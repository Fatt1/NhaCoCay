import React from "react"
import { useAuthStore } from "@/stores"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { navigateTo } from "@/lib/navigation"

import type { DiaryPost } from "@/types"

interface JournalSectionProps {
  onNotify?: (message: string, icon?: string) => void
  onOpenAuthModal?: () => void
  onOpenNewPost?: () => void
  onEditPost?: (post: DiaryPost) => void
  postsVersion?: number
  onGoToJournals?: () => void
}

export const JournalSection: React.FC<JournalSectionProps> = ({
  onNotify,
  onOpenAuthModal,
  onGoToJournals,
}) => {
  const { user } = useAuthStore()

  const handleGoToJournal = () => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để xem và ghi chép nhật ký cây!", "lock")
      onOpenAuthModal?.()
      return
    }

    if (onGoToJournals) {
      onGoToJournals()
    } else {
      navigateTo("/journal")
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="bg-surface-container-low relative border-y border-outline-variant/30 py-20" id="journal-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-8">
        {!user ? (
          /* Khi chưa đăng nhập: Ẩn thông tin cá nhân và yêu cầu đăng nhập */
          <Card className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/30 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="size-16 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-heading font-bold text-xl text-on-surface">
                  Nhật Ký & Sổ Tay Sinh Trưởng
                </h3>
                <p className="text-xs text-on-surface-variant max-w-lg leading-relaxed">
                  Bạn chưa đăng nhập. Vui lòng đăng nhập tài khoản để khởi tạo sổ tay 6 bước chăm sóc, theo dõi tiến độ sinh trưởng và ghi chép mầm cây của riêng bạn.
                </p>
              </div>
            </div>
            <Button
              onClick={onOpenAuthModal}
              className="rounded-full bg-primary text-on-primary font-semibold text-xs px-6 py-3.5 shrink-0 h-auto shadow-md"
            >
              Đăng nhập để xem nhật ký
            </Button>
          </Card>
        ) : (
          /* Khi đã đăng nhập: Hiển thị thông tin người dùng và nút theo dõi tiến độ */
          <>
            {/* Dashboard Top Header Bar */}
            <Card className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-outline-variant/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="size-16 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-lg font-bold">
                      {user.fullName?.trim() ? user.fullName.trim().charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-sm">
                    🌱
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-heading font-bold text-xl text-on-surface">
                    {user.fullName}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {user.email} • {user.phoneNumber || "Thành viên yêu cây"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant/30 shadow-sm">
                <Button
                  onClick={handleGoToJournal}
                  className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer h-auto"
                >
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  <span>Theo dõi tiến độ cây 🌱</span>
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </section>
  )
}
