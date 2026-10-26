import React, { useEffect, useState } from "react"
import { getOrderById } from "@/services"
import type { Order } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface OrderSuccessPageProps {
  orderId: string
  onContinueShopping: () => void
  onGoToJournals: () => void
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderId,
  onContinueShopping,
  onGoToJournals,
}) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getOrderById(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error("Error loading order:", err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [orderId])

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-surface-container animate-pulse mx-auto" />
        <div className="h-8 bg-surface-container rounded-2xl w-1/3 mx-auto animate-pulse" />
        <div className="h-64 bg-surface-container rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">receipt_long</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">Không tìm thấy thông tin đơn hàng</h2>
        <p className="text-xs text-on-surface-variant">
          Mã đơn hàng không tồn tại hoặc đã có lỗi xảy ra trong quá trình truy xuất dữ liệu.
        </p>
        <Button onClick={onContinueShopping} className="rounded-full bg-primary text-on-primary">
          Về Trang Chủ Mua Sắm
        </Button>
      </div>
    )
  }

  const orderCode = `NCC-${order.id.slice(-6).toUpperCase()}`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-20">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 shadow-md ring-8 ring-emerald-50 mb-2 animate-in zoom-in duration-300">
          <span className="material-symbols-outlined text-[44px]">check</span>
        </div>

        <div className="space-y-1.5">
          <Badge className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200">
            Đặt Hàng Thành Công
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#193a2c] tracking-tight">
            Cảm Ơn Bạn Đã Gieo Mầm Cùng Nhà Có Cây!
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Đơn hàng của bạn đã được ghi nhận. Nhà Có Cây sẽ sớm đóng gói cẩn thận và liên hệ giao
            hàng đến bạn trong thời gian sớm nhất.
          </p>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-6">
        {/* Order Code & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/15">
          <div>
            <span className="text-xs text-on-surface-variant block">Mã đơn hàng</span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-primary tracking-wide">
              #{orderCode}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-on-surface-variant block">Trạng thái đơn</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Đang chuẩn bị hàng</span>
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3 bg-surface-container-low/50 rounded-2xl p-4 sm:p-5 border border-outline-variant/20 text-xs">
          <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
            <span>Thông Tin Người Nhận</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-on-surface-variant block">Họ và tên:</span>
              <span className="font-bold text-on-surface">{order.customer.fullName}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block">Số điện thoại:</span>
              <span className="font-bold text-on-surface">{order.customer.phoneNumber}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block">Email:</span>
              <span className="font-bold text-on-surface">{order.customer.email}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block">Phương thức thanh toán:</span>
              <span className="font-bold text-emerald-800">Thanh toán khi nhận hàng (COD)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/15">
            <span className="text-on-surface-variant block">Địa chỉ nhận hàng:</span>
            <span className="font-semibold text-on-surface">{order.customer.address}</span>
          </div>

          {order.note && (
            <div className="pt-2 border-t border-outline-variant/15">
              <span className="text-on-surface-variant block">Ghi chú đơn hàng:</span>
              <span className="italic text-on-surface">{order.note}</span>
            </div>
          )}
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-on-surface">Danh Sách Sản Phẩm Đã Mua</h4>

          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/20"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-surface-container"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-on-surface line-clamp-1">{item.name}</h5>
                  <p className="text-[11px] text-on-surface-variant">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-primary">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Total Summary */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="font-bold text-sm sm:text-base text-on-surface">Tổng Tiền Thanh Toán:</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#193a2c]">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          onClick={onContinueShopping}
          className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold px-8 py-3.5 shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">storefront</span>
          <span>Tiếp Tục Mua Sắm</span>
        </Button>

        <Button
          variant="outline"
          onClick={onGoToJournals}
          className="w-full sm:w-auto rounded-full border-primary/30 text-primary hover:bg-primary/5 font-semibold px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          <span>Xem Sổ Tay Trồng Cây</span>
        </Button>
      </div>
    </div>
  )
}
