import React, { useEffect, useState } from "react"
import { getProducts, createDiary } from "@/services"
import { useAuthStore } from "@/stores"
import type { Product, PlantDiary } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CreateDiaryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (diary: PlantDiary) => void
  onNotify?: (message: string, icon?: string) => void
}

export const CreateDiaryModal: React.FC<CreateDiaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNotify,
}) => {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    setLoading(true)

    getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data)
          if (data.length > 0 && !selectedProductId) {
            setSelectedProductId(data[0].id)
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) {
      onNotify?.("Vui lòng chọn 1 bộ kit trồng cây!", "warning")
      return
    }

    if (!user) {
      onNotify?.("Vui lòng đăng nhập để tạo nhật ký trồng cây!", "lock")
      return
    }

    try {
      setIsSubmitting(true)
      const diary = await createDiary(user.uid, {
        plantName: selectedProduct.name,
        coverImage: selectedProduct.coverImage,
        startDate: startDate || new Date().toISOString().split("T")[0],
      })
      onNotify?.("Khởi tạo nhật ký gieo mầm thành công!", "eco")
      onSuccess(diary)
      onClose()
    } catch (err) {
      console.error(err)
      onNotify?.("Có lỗi xảy ra khi tạo nhật ký, vui lòng thử lại!", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-surface rounded-3xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Tạo Nhật Ký Trồng Cây Mới</h2>
              <p className="text-xs text-on-surface-variant">
                Chọn 1 bộ kit trồng cây để kích hoạt cẩm nang 6 bước và bản theo dõi sinh trưởng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Chọn sản phẩm (chỉ chọn 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span>Chọn Bộ Kit Của Bạn</span>
                <span className="text-xs font-normal text-on-surface-variant">
                  (Chỉ chọn 1 sản phẩm)
                </span>
              </label>
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                1 sản phẩm
              </Badge>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-surface-container animate-pulse border border-outline-variant/20"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant text-sm bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/40">
                Không tìm thấy sản phẩm bộ kit nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {products.map((product) => {
                  const isSelected = selectedProductId === product.id
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 text-left ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                          : "border-outline-variant/30 hover:border-outline-variant/70 bg-surface-container-lowest"
                      }`}
                    >
                      {/* Radio indicator */}
                      <div
                        className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-outline-variant bg-surface"
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </div>

                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="w-18 h-18 rounded-xl object-cover shrink-0 bg-surface-container"
                      />

                      <div className="flex-1 min-w-0 pr-5 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-on-surface line-clamp-2 leading-tight">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-1">
                            {product.shortDescription}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-primary">
                            {product.salePrice.toLocaleString("vi-VN")}đ
                          </span>
                          {product.specifications?.germinationRate?.value && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                              Nảy mầm: {product.specifications.germinationRate.value.split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Ngày bắt đầu gieo */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-on-surface block">
              Ngày Bắt Đầu Gieo Trồng
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
            />
            <p className="text-[11px] text-on-surface-variant">
              Thời gian sẽ được tính để đo tiến độ sinh trưởng và ngày dự kiến thu hoạch.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant/15 flex items-center justify-end gap-3 bg-surface-container-low/50">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full text-on-surface-variant hover:text-on-surface"
          >
            Hủy Bỏ
          </Button>
          <Button
            type="button"
            disabled={!selectedProductId || isSubmitting}
            onClick={handleSubmit}
            className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-semibold px-6 shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Đang Khởi Tạo...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">nature</span>
                <span>Bắt Đầu Gieo Mầm</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
