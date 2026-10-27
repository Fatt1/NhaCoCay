import React, { useEffect, useState } from "react"
import { getUserDiaries, deleteDiary } from "@/services"
import { useAuthStore } from "@/stores"
import type { PlantDiary } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateDiaryModal } from "@/components/diary/CreateDiaryModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface JournalsListPageProps {
  onSelectDiary: (diaryId: string) => void
  onOpenAuthModal?: () => void
  onNotify?: (message: string, icon?: string) => void
}

export const JournalsListPage: React.FC<JournalsListPageProps> = ({
  onSelectDiary,
  onOpenAuthModal,
  onNotify,
}) => {
  const { user } = useAuthStore()
  const [diaries, setDiaries] = useState<PlantDiary[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [diaryToDelete, setDiaryToDelete] = useState<PlantDiary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDiaries = async () => {
    if (!user) {
      setDiaries([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getUserDiaries(user.uid)
      setDiaries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiaries()
  }, [user])

  const handleRequestDelete = (e: React.MouseEvent, diary: PlantDiary) => {
    e.stopPropagation()
    setDiaryToDelete(diary)
  }

  const handleConfirmDelete = async () => {
    if (!diaryToDelete) return

    try {
      setIsDeleting(true)
      await deleteDiary(diaryToDelete.id)
      onNotify?.("Đã xóa nhật ký trồng cây!", "delete")
      setDiaries((prev) => prev.filter((d) => d.id !== diaryToDelete.id))
      setDiaryToDelete(null)
    } catch (err) {
      console.error(err)
      onNotify?.("Có lỗi xảy ra khi xóa nhật ký", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenCreateModal = () => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập tài khoản để tạo nhật ký trồng cây!", "lock")
      onOpenAuthModal?.()
      return
    }
    setIsCreateModalOpen(true)
  }

  const handleCreatedSuccess = (newDiary: PlantDiary) => {
    // Navigate straight to the detail page of the new diary!
    onSelectDiary(newDiary.id)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-5 sm:pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>HÀNH TRÌNH MẦM XANH</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-on-surface tracking-tight">
            Sổ Tay Nhật Ký Trồng Cây
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Theo dõi hành trình sinh trưởng từng mầm cây, cập nhật trạng thái 6 bước chăm sóc theo
            thiệp cẩm nang giấy kraft của Nhà Có Cây.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-on-primary font-semibold px-6 py-2.5 shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Tạo Nhật Ký Cây Mới</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20"
            />
          ))}
        </div>
      ) : diaries.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-14 text-center border border-dashed border-outline-variant/40 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">nature</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-on-surface">Bạn Chưa Có Nhật Ký Cây Nào</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Hãy chọn 1 bộ kit trồng cây để bắt đầu hành trình nuôi dưỡng và quan sát mầm xanh lớn
              lên mỗi ngày!
            </p>
          </div>
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto rounded-full bg-primary text-on-primary font-semibold px-6"
          >
            Bắt Đầu Gieo Cây Đầu Tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {diaries.map((diary) => {
            const completedCount = diary.handbookSteps.filter(
              (s) => s.status === "completed"
            ).length
            const inProgressCount = diary.handbookSteps.filter(
              (s) => s.status === "in_progress"
            ).length
            const totalSteps = diary.handbookSteps.length || 6
            const progressPercent = Math.round((completedCount / totalSteps) * 100)

            return (
              <div
                key={diary.id}
                onClick={() => onSelectDiary(diary.id)}
                className="group bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Image cover */}
                  <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                    <img
                      src={diary.coverImage}
                      alt={diary.plantName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-[#193a2c] font-semibold text-xs backdrop-blur-xs shadow-2xs">
                        {completedCount === totalSteps
                          ? "Thu hoạch thành công"
                          : `Bước ${completedCount + (inProgressCount > 0 ? 1 : 0)} / ${totalSteps}`}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      title="Xóa nhật ký này"
                      disabled={isDeleting && diaryToDelete?.id === diary.id}
                      onClick={(e) => handleRequestDelete(e, diary)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {diary.plantName}
                      </h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        <span>
                          Gieo ngày:{" "}
                          {new Date(diary.startDate || diary.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">Tiến độ quy trình</span>
                        <span className="font-bold text-primary">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-5 pb-5 pt-1">
                  <div className="w-full py-2.5 rounded-2xl bg-surface-container-low group-hover:bg-primary group-hover:text-on-primary text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    <span>Xem Sổ Tay Chi Tiết</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Tạo Nhật Ký Trồng Cây Mới */}
      <CreateDiaryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreatedSuccess}
        onNotify={onNotify}
      />

      {/* Shadcn AlertDialog Xác nhận xóa nhật ký */}
      <AlertDialog
        open={!!diaryToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDiaryToDelete(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <span className="material-symbols-outlined text-2xl">warning</span>
              Xác nhận xóa nhật ký
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sổ tay nhật ký{" "}
              <span className="font-semibold text-on-surface">
                &ldquo;{diaryToDelete?.plantName}&rdquo;
              </span>{" "}
              không? Toàn bộ tiến trình chăm sóc và hình ảnh đã lưu sẽ bị xóa vĩnh viễn và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDiaryToDelete(null)}
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
