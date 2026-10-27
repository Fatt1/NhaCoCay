import React, { useEffect, useState } from "react"
import { getDiaryById, updateDiaryStepStatus, deleteDiary, getProducts } from "@/services"
import type { PlantDiary, HandbookStepStatus, Product } from "@/types"
import { Button } from "@/components/ui/button"

interface JournalDetailPageProps {
  diaryId: string
  onBack: () => void
  onGoToForum?: () => void
  onNotify?: (message: string, icon?: string) => void
}

const STATUS_CONFIG: Record<
  HandbookStepStatus,
  { label: string; icon: string; className: string }
> = {
  completed: {
    label: "Đã hoàn thành ✓",
    icon: "check_circle",
    className: "text-[#2e6945] font-semibold",
  },
  in_progress: {
    label: "Đang thực hiện 💧",
    icon: "water_drop",
    className: "text-[#b26a00] font-semibold",
  },
  upcoming: {
    label: "Sắp tới ⏳",
    icon: "hourglass_empty",
    className: "text-[#7a7875] font-medium",
  },
}

// Styling 6 bước theo mockup (màu nền và icon minh họa cho từng bước)
const STEP_BOX_STYLES = [
  {
    bg: "bg-[#e5f1fc]",
    color: "text-[#1e88e5]",
    icon: "waves",
  },
  {
    bg: "bg-[#fef3c7]",
    color: "text-[#d97706]",
    icon: "grain",
  },
  {
    bg: "bg-[#ffedd5]",
    color: "text-[#ea580c]",
    icon: "inventory_2",
  },
  {
    bg: "bg-[#e6f4ea]",
    color: "text-[#16a34a]",
    icon: "shower",
  },
  {
    bg: "bg-[#fef9c3]",
    color: "text-[#ca8a04]",
    icon: "wb_sunny",
  },
  {
    bg: "bg-[#e8f5e9]",
    color: "text-[#2e7d32]",
    icon: "potted_plant",
  },
]

export const JournalDetailPage: React.FC<JournalDetailPageProps> = ({
  diaryId,
  onBack,
  onGoToForum,
  onNotify,
}) => {
  const [diary, setDiary] = useState<PlantDiary | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeStepMenu, setActiveStepMenu] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([getDiaryById(diaryId), getProducts()])
      .then(([diaryData, productsList]) => {
        if (!isMounted) return
        if (diaryData) {
          setDiary(diaryData)
          // Tìm product tương ứng để lấy specifications (tỷ lệ nảy mầm, thời gian nảy mầm, ra hoa, lưu ý)
          const matchedProd =
            productsList.find(
              (p) =>
                p.name.toLowerCase().includes(diaryData.plantName.toLowerCase()) ||
                diaryData.plantName.toLowerCase().includes(p.name.toLowerCase())
            ) || productsList[0] || null

          setProduct(matchedProd)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading journal details:", err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [diaryId])

  // Xử lý đổi trạng thái bước
  const handleStatusChange = async (stepNumber: number, newStatus: HandbookStepStatus) => {
    if (!diary) return
    setActiveStepMenu(null)

    // Cập nhật optimistic
    const updatedSteps = diary.handbookSteps.map((s) =>
      s.stepNumber === stepNumber ? { ...s, status: newStatus } : s
    )
    setDiary({ ...diary, handbookSteps: updatedSteps })

    try {
      await updateDiaryStepStatus(diary.id, stepNumber, newStatus)
      onNotify?.(`Đã cập nhật trạng thái Bước ${stepNumber}!`, "check_circle")
    } catch (err) {
      console.error(err)
      onNotify?.("Có lỗi xảy ra khi lưu trạng thái bước", "error")
    }
  }

  // Xóa nhật ký
  const handleDeleteDiary = async () => {
    if (!diary) return
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa sổ tay nhật ký "${diary.plantName}" không? Hành động này không thể hoàn tác.`
    )
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await deleteDiary(diary.id)
      onNotify?.("Đã xóa nhật ký trồng cây!", "delete")
      window.location.hash = "#/journal"
      onBack()
    } catch (err) {
      console.error(err)
      onNotify?.("Có lỗi xảy ra khi xóa nhật ký", "error")
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-surface-container rounded-2xl w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface-container rounded-3xl" />
            ))}
          </div>
          <div className="h-96 bg-surface-container rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!diary) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl">auto_stories</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">Không tìm thấy nhật ký trồng cây</h2>
        <p className="text-sm text-on-surface-variant">
          Nhật ký này có thể đã bị xóa hoặc liên kết không chính xác.
        </p>
        <Button onClick={onBack} className="rounded-full bg-primary text-on-primary">
          Quay Lại Danh Sách Nhật Ký
        </Button>
      </div>
    )
  }

  // Tính số ngày đã gieo
  const startDateObj = new Date(diary.startDate || diary.createdAt)
  const today = new Date()
  const diffTime = Math.max(0, today.getTime() - startDateObj.getTime())
  const elapsedDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
  const harvestDays = 60

  // Specifications lấy từ product
  const specs = product?.specifications

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Top Bar Navigation & Delete */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Danh Sách Nhật Ký</span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={handleDeleteDiary}
            className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold px-4 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>{isDeleting ? "Đang Xóa..." : "Xóa Nhật Ký Này"}</span>
          </Button>
        </div>
      </div>

      {/* Header Info Banner: Cà Chua Bi Cherry Đỏ */}
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#193a2c] tracking-tight">
          {diary.plantName}
        </h1>
        <p className="text-sm text-[#4a5568] font-medium flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#2d3748]">Giai đoạn:</span>
          <span>Nảy mầm &amp; Phát triển lá non</span>
          <span className="text-[#a0aec0]">•</span>
          <span>
            {elapsedDays} / {harvestDays} ngày tới kỳ thu hoạch
          </span>
        </p>
      </div>

      {/* 4 Specification Cards (Lấy từ product.specifications khớp với mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tỷ lệ nảy mầm */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between h-34 relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#daf2e3] text-[#247c4e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dcf4e6] text-[#1c693f]">
              Đạt chuẩn
            </span>
          </div>
          <div>
            <span className="text-xs text-[#718096] block mb-0.5">
              {specs?.germinationRate?.label || "Tỷ lệ nảy mầm"}
            </span>
            <span className="text-base font-extrabold text-[#1a4d2e]">
              {specs?.germinationRate?.value || "> 95% (95% - 98%)"}
            </span>
          </div>
        </div>

        {/* Card 2: Thời gian nảy mầm */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between h-34 relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#daf2e3] text-[#247c4e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dcf4e6] text-[#1c693f]">
              Dự kiến
            </span>
          </div>
          <div>
            <span className="text-xs text-[#718096] block mb-0.5">
              {specs?.germinationTime?.label || "Thời gian nảy mầm"}
            </span>
            <span className="text-base font-extrabold text-[#1a4d2e]">
              {specs?.germinationTime?.value || "5 - 7 ngày"}
            </span>
          </div>
        </div>

        {/* Card 3: Thời gian ra hoa */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between h-34 relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#daf2e3] text-[#247c4e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_florist</span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dcf4e6] text-[#1c693f]">
              Giai đoạn 3
            </span>
          </div>
          <div>
            <span className="text-xs text-[#718096] block mb-0.5">
              {specs?.floweringTime?.label || "Thời gian ra hoa"}
            </span>
            <span className="text-base font-extrabold text-[#1a4d2e]">
              {specs?.floweringTime?.value || "35 - 45 ngày"}
            </span>
          </div>
        </div>

        {/* Card 4: Lưu ý cho cây */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs flex flex-col justify-between h-34 relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#daf2e3] text-[#247c4e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dcf4e6] text-[#1c693f]">
              Quan trọng
            </span>
          </div>
          <div>
            <span className="text-xs text-[#718096] block mb-0.5">
              {specs?.plantCareNotes?.label || "Lưu ý cho cây"}
            </span>
            <span className="text-base font-extrabold text-[#1a4d2e]">
              {specs?.plantCareNotes?.value || "Tưới gốc & đón nắng"}
            </span>
          </div>
        </div>
      </div>

      {/* Sổ tay nhật ký gieo mầm (Kraft Paper Card Container) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2e6945]">
          <span className="w-2 h-2 rounded-full bg-[#2e6945]" />
          <span>CẨM NANG KÈM BỘ KIT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a382b] tracking-tight">
          Sổ tay nhật ký gieo mầm
        </h2>
        <p className="text-sm text-[#4a5568]">
          Bản đối chiếu trực quan từ tấm thiệp hướng dẫn giấy kraft đính kèm trong mỗi hộp sản phẩm từ
          Nhà Có Cây.
        </p>

        {/* Container màu kraft giấy mộc */}
        <div className="mt-6 bg-[#fbf5ed] rounded-3xl p-6 sm:p-10 border border-[#ecdac7] shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Cột trái: Lời nhắn từ Nhà Có Cây */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#2a241e] font-heading">
                  Lời nhắn từ Nhà Có Cây
                </h3>
                <div className="text-sm text-[#5c5348] leading-relaxed space-y-3.5">
                  <p>
                    Có bao giờ bạn cảm thấy thế giới xung quanh mình vận hành quá nhanh, đến mức ta
                    quên mất cách quan sát những điều bình dị đang lớn lên mỗi ngày?
                  </p>
                  <p>
                    Nhà Có Cây ra đời không chỉ để lấp đầy khoảng xanh nơi góc bàn hay ở cửa sổ. Đây là
                    một lời mời để bạn dừng lại, hít thở và tự tay chăm sóc một mầm sống từ những bước
                    đầu tiên.
                  </p>
                  <p>
                    Dù đó là một nhành hoa rực rỡ hay mầm lá tươi mát, mỗi hạt giống gieo xuống đều là
                    một lời hứa về sự kiên nhẫn và lòng trân trọng. Việc tưới nước mỗi sáng, chờ đợi
                    chiếc lá đầu tiên hé nở chính là cách chúng ta vỗ về tâm hồn, tìm lại sự tĩnh lặng
                    và kết nối với thiên nhiên theo cách nguyên bản nhất.
                  </p>
                  <p className="font-semibold text-[#3d3226]">
                    Hôm nay bạn gieo xuống sự quan tâm, ngày mai bạn gặt hái được niềm vui rực rỡ. Hãy
                    để mầm xanh này lớn lên cùng bạn nhé!
                  </p>
                </div>
              </div>

              {/* Logo / Brand signature */}
              <div className="pt-4 flex items-center gap-3 text-[#3a5243]">
                <div className="w-10 h-10 rounded-full bg-[#e8ded1] flex items-center justify-center text-[#2e593e]">
                  <span className="material-symbols-outlined text-[22px]">potted_plant</span>
                </div>
                <span className="font-heading font-bold text-lg tracking-tight">Nhà Có Cây</span>
              </div>
            </div>

            {/* Cột phải: Đánh dấu mầm xanh (Grid 6 bước) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-[#2a241e]">Đánh dấu mầm xanh</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ecdac7] text-[#554637]">
                  Quy Trình 6 Bước Chuẩn
                </span>
              </div>

              {/* Grid 6 Bước */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {diary.handbookSteps.map((step, idx) => {
                  const style = STEP_BOX_STYLES[idx % STEP_BOX_STYLES.length]
                  const statusInfo = STATUS_CONFIG[step.status] || STATUS_CONFIG.upcoming
                  const isMenuOpen = activeStepMenu === step.stepNumber

                  return (
                    <div
                      key={step.stepNumber}
                      className="bg-white rounded-2xl p-4 border border-[#e5d8c8] shadow-2xs flex flex-col justify-between min-h-[260px] h-full relative transition-all hover:shadow-xs"
                    >
                      {/* Top Header của Card Bước: "Bước X" & Icon góc phải */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2a241e]">
                          Bước {step.stepNumber}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${style.bg} ${style.color}`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {style.icon}
                          </span>
                        </div>
                      </div>

                      {/* Khung màu minh họa giữa card */}
                      <div
                        className={`w-full h-18 rounded-xl flex items-center justify-center my-2.5 ${style.bg}`}
                      >
                        <span className={`material-symbols-outlined text-[28px] ${style.color}`}>
                          {style.icon}
                        </span>
                      </div>

                      {/* Mô tả bước (hiển thị full toàn bộ không cắt ...) */}
                      <p className="text-[12px] text-[#4a4238] leading-relaxed flex-1 mb-3 break-words">
                        {step.description}
                      </p>

                      {/* Nút bấm chọn trạng thái bước (Đã hoàn thành / Đang thực hiện / Sắp tới) */}
                      <div className="relative pt-1 border-t border-[#f0e6da]">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveStepMenu(isMenuOpen ? null : step.stepNumber)
                          }
                          className="w-full text-left flex items-center justify-between text-[11px] py-1 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <span className={`inline-flex items-center gap-1 ${statusInfo.className}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{statusInfo.label}</span>
                          </span>
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                            expand_more
                          </span>
                        </button>

                        {/* Dropdown Menu chọn trạng thái */}
                        {isMenuOpen && (
                          <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-white rounded-xl shadow-lg border border-[#e5d8c8] py-1 text-xs animate-in fade-in zoom-in-95">
                            {(["completed", "in_progress", "upcoming"] as HandbookStepStatus[]).map(
                              (st) => {
                                const opt = STATUS_CONFIG[st]
                                const isCur = step.status === st
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(step.stepNumber, st)}
                                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-surface-container transition-colors ${isCur ? "font-bold text-primary bg-primary/5" : "text-on-surface"
                                      }`}
                                  >
                                    <span>{opt.label}</span>
                                    {isCur && (
                                      <span className="material-symbols-outlined text-[14px]">
                                        check
                                      </span>
                                    )}
                                  </button>
                                )
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner trợ giúp bác sĩ cây (Dark Forest Green Container) */}
      <div className="bg-[#193a2c] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        {/* Hạt trang trí nền */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-emerald-200 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[15px]">psychiatry</span>
              <span>Đồng hành cùng bạn</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Mầm Cây Của Bạn Cần Trợ Giúp Kịp Thời?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Bạn phát hiện hạt giống nảy mầm chậm lớn hay có bất kỳ băn khoăn nào khi chăm sóc cây? Liên hệ Nhà Có Cây để được hỗ trợ hướng dẫn nhé
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href="https://www.facebook.com/profile.php?id=61595312774033"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white text-[#193a2c] hover:bg-white/90 font-bold px-5 py-3 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm no-underline transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#193a2c]">
                medical_services
              </span>
              <span>Hỗ trợ tư vấn</span>
            </a>

            {onGoToForum && (
              <Button
                type="button"
                variant="outline"
                onClick={onGoToForum}
                className="rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 backdrop-blur-xs flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">forum</span>
                <span>Chia Sẻ Lên Diễn Đàn Cây</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
