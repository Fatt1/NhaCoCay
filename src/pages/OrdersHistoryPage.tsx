import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/stores"
import { getUserOrders } from "@/services"
import type { Order, OrderStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OrdersHistoryPageProps {
  onBack: () => void
  onSelectOrder?: (orderId: string) => void
  onOpenAuthModal?: () => void
  onGoToShop: () => void
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Đang chuẩn bị hàng",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  shipping: {
    label: "Đang giao hàng",
    className: "bg-purple-50 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Giao thành công",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-800 border-rose-200",
  },
}

export const OrdersHistoryPage: React.FC<OrdersHistoryPageProps> = ({
  onBack,
  onSelectOrder,
  onOpenAuthModal,
  onGoToShop,
}) => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    getUserOrders(user.uid)
      .then((data) => {
        if (isMounted) {
          setOrders(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error("Error fetching user orders:", err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [user])

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  // 1. Trường hợp CHƯA ĐĂNG NHẬP (Yêu cầu đăng nhập theo yêu cầu của user)
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[40px]">lock</span>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-on-surface">
            Yêu Cầu Đăng Nhập
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Vui lòng đăng nhập tài khoản để xem toàn bộ lịch sử đơn hàng và theo dõi hành trình giao
            hạt giống cây trồng của bạn.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            onClick={onOpenAuthModal}
            className="rounded-full bg-primary text-on-primary font-semibold px-8 py-3 shadow-md"
          >
            Đăng Nhập Ngay
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-full border-outline-variant/40 text-on-surface font-medium px-6 py-3"
          >
            Về Trang Chủ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-20">
      {/* Top Back Navigation */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer group w-fit"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Quay lại</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-5">
        <div className="space-y-1.5">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>TÀI KHOẢN CỦA TÔI</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#193a2c] tracking-tight">
            Lịch Sử Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
            Theo dõi tình trạng xử lý và danh sách các bộ kit gieo mầm bạn đã đặt mua tại Nhà Có Cây.
          </p>
        </div>

        <Button
          type="button"
          onClick={onGoToShop}
          className="rounded-full bg-primary text-on-primary font-semibold px-6 shadow-sm flex items-center gap-2 self-start sm:self-center cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          <span>Khám Phá Cửa Hàng</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-3xl bg-surface-container animate-pulse border border-outline-variant/20"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface rounded-3xl p-10 sm:p-14 text-center border border-dashed border-outline-variant/40 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-surface-container text-on-surface-variant mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-on-surface">Bạn Chưa Có Đơn Hàng Nào</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Hiện tại bạn chưa đặt đơn hàng nào. Hãy chọn cho mình một bộ kit trồng cây để gieo mầm
              bình yên ngay hôm nay nhé!
            </p>
          </div>
          <Button
            type="button"
            onClick={onGoToShop}
            className="rounded-full bg-primary text-on-primary font-semibold px-6"
          >
            Khám Phá Bộ Kit Trồng Cây
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const orderCode = `NCC-${order.id.slice(-6).toUpperCase()}`
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)
            const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={order.id}
                className="bg-surface rounded-3xl border border-outline-variant/30 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/15">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-extrabold text-sm sm:text-base text-primary">
                      #{orderCode}
                    </span>
                    <span className="text-xs text-on-surface-variant hidden sm:inline">•</span>
                    <span className="text-xs text-on-surface-variant">{orderDate}</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`font-semibold text-xs px-3 py-0.5 rounded-full ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Items list: mỗi orderItem là 1 hàng riêng biệt */}
                <div className="flex flex-col gap-2.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 w-full"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 bg-surface-container"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-on-surface line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Số lượng: <span className="font-semibold text-on-surface">{item.quantity}</span> x{" "}
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-primary shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Info */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-t border-outline-variant/15 text-xs">
                  <div className="space-y-1">
                    <p className="text-on-surface-variant">
                      Giao tới:{" "}
                      <span className="font-semibold text-on-surface">
                        {order.customer.fullName} ({order.customer.phoneNumber})
                      </span>
                    </p>
                    <p className="text-on-surface-variant line-clamp-1">
                      Địa chỉ: {order.customer.address}
                    </p>
                    {order.note && (
                      <p className="text-on-surface-variant italic line-clamp-1">
                        Ghi chú: "{order.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col justify-between sm:text-right items-center sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10 shrink-0">
                    <span className="text-xs text-on-surface-variant">
                      Tổng cộng ({totalQty} sản phẩm)
                    </span>
                    <span className="font-extrabold text-base sm:text-lg text-[#193a2c]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    {onSelectOrder && (
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order.id)}
                        className="mt-1 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Chi tiết đơn hàng</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
