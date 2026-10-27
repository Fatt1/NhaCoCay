import React, { useState, useEffect } from "react"
import { useAuthStore, useCartStore } from "@/stores"
import { createOrder } from "@/services"
import { orderCustomerSchema } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface CheckoutPageProps {
  onBack: () => void
  onOrderSuccess: (orderId: string) => void
  onNotify?: (message: string, icon?: string) => void
  onOpenAuthModal?: () => void
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onOrderSuccess,
  onNotify,
  onOpenAuthModal,
}) => {
  const { user } = useAuthStore()
  const { items, getSubtotal, getTotal, clearCart } = useCartStore()

  // Form states
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-fill họ tên, số điện thoại, email từ user khi đã đăng nhập
  useEffect(() => {
    if (user) {
      if (user.fullName && !fullName) setFullName(user.fullName)
      if (user.phoneNumber && !phoneNumber) setPhoneNumber(user.phoneNumber)
      if (user.email && !email) setEmail(user.email)
    }
  }, [user])

  const subtotal = getSubtotal()
  const total = getTotal()

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  const handleFieldChange = (field: string, value: string) => {
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }

    if (field === "fullName") setFullName(value)
    else if (field === "phoneNumber") setPhoneNumber(value)
    else if (field === "email") setEmail(value)
    else if (field === "address") setAddress(value)
    else if (field === "note") setNote(value)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      onNotify?.("Giỏ hàng của bạn đang trống!", "shopping_bag")
      return
    }

    // Kiểm tra validation bằng Zod
    const validationResult = orderCustomerSchema.safeParse({
      fullName,
      phoneNumber,
      email,
      address,
      note,
    })

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0] as string
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = err.message
        }
      })
      setErrors(fieldErrors)
      onNotify?.("Vui lòng kiểm tra lại thông tin còn thiếu hoặc chưa hợp lệ!", "warning")
      return
    }

    try {
      setIsSubmitting(true)

      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }))

      const customerData = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
      }

      const createdOrder = await createOrder(
        user?.uid || "guest_user",
        customerData,
        orderItems,
        total,
        note.trim()
      )

      // Xóa giỏ hàng
      clearCart()
      onNotify?.("Đặt hàng thành công! Đang chuyển hướng...", "celebration")

      // Chuyển sang màn hình đặt hàng thành công
      onOrderSuccess(createdOrder.id)
    } catch (err) {
      console.error("Order creation failed:", err)
      onNotify?.("Có lỗi xảy ra khi đặt hàng, vui lòng thử lại!", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">shopping_cart</span>
        </div>
        <h2 className="text-2xl font-bold font-heading text-on-surface">
          Giỏ Hàng Của Bạn Đang Trống
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Hiện tại bạn chưa chọn bộ kit hoặc sản phẩm nào để thanh toán. Hãy dạo một vòng cửa hàng để
          chọn mầm cây ưng ý nhé!
        </p>
        <Button
          onClick={onBack}
          className="rounded-full bg-primary text-on-primary font-semibold px-8 py-3 shadow-md"
        >
          Khám Phá Các Bộ Kit Trồng Cây
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Quay lại giỏ hàng / Mua sắm</span>
        </button>

        {!user && (
          <div className="text-xs text-on-surface-variant flex items-center gap-2">
            <span>Đã có tài khoản?</span>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Đăng nhập để tự động điền
            </button>
          </div>
        )}
      </div>

      {/* Page Title */}
      <div className="space-y-1 border-b border-outline-variant/15 pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>HOÀN TẤT ĐƠN HÀNG</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#193a2c] tracking-tight">
          Thanh Toán &amp; Đặt Hàng
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Vui lòng kiểm tra lại danh sách sản phẩm và thông tin nhận hàng trước khi xác nhận.
        </p>
      </div>

      {/* Main Checkout Grid */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Form thông tin khách hàng (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/15">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-on-surface">
                  Thông Tin Giao Hàng
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {user
                    ? "Họ tên, SĐT và Email đã được tự động điền từ tài khoản của bạn (có thể chỉnh sửa)."
                    : "Điền thông tin để Nhà Có Cây gửi cây giống đến bạn nhanh nhất."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>
                    Họ và tên người nhận <span className="text-rose-500">*</span>
                  </span>
                  {user?.fullName && (
                    <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Tự động điền
                    </span>
                  )}
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className={`rounded-xl bg-surface-container-lowest text-sm h-11 ${
                    errors.fullName ? "border-rose-500 focus-visible:ring-rose-400" : ""
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* SĐT & Email (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>
                      Số điện thoại <span className="text-rose-500">*</span>
                    </span>
                    {user?.phoneNumber && (
                      <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Tự động điền
                      </span>
                    )}
                  </label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className={`rounded-xl bg-surface-container-lowest text-sm h-11 ${
                      errors.phoneNumber ? "border-rose-500 focus-visible:ring-rose-400" : ""
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>{errors.phoneNumber}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>
                      Email nhận thông báo <span className="text-rose-500">*</span>
                    </span>
                    {user?.email && (
                      <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Tự động điền
                      </span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="Ví dụ: an.nguyen@gmail.com"
                    className={`rounded-xl bg-surface-container-lowest text-sm h-11 ${
                      errors.email ? "border-rose-500 focus-visible:ring-rose-400" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Địa chỉ nhận hàng */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">
                  Địa chỉ nhận hàng cụ thể <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className={`rounded-xl bg-surface-container-lowest text-sm h-11 ${
                    errors.address ? "border-rose-500 focus-visible:ring-rose-400" : ""
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* Ghi chú đơn hàng */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Ghi chú đơn hàng</span>
                  <span className="text-[11px] font-normal text-on-surface-variant">(Không bắt buộc)</span>
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  placeholder="Ghi chú thêm về thời gian nhận hàng, lưu ý giao cây giống cẩn thận..."
                  rows={3}
                  className="rounded-xl bg-surface-container-lowest text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tóm tắt các sản phẩm sẽ mua (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-2xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <h3 className="font-heading font-bold text-base text-on-surface">
                Tóm Tắt Đơn Hàng ({items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                Giao hàng tận nơi
              </Badge>
            </div>

            {/* Danh sách các sản phẩm sẽ mua */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-surface-container"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-on-surface line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Số lượng: <span className="font-semibold text-on-surface">{item.quantity}</span> x{" "}
                      {formatCurrency(item.price)}
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

            <Separator />

            {/* Chi tiết thanh toán */}
            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-on-surface">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-emerald-700">Miễn phí toàn quốc</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-on-surface">Tổng thanh toán</span>
                <span className="text-xl font-extrabold text-[#193a2c]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Nút Đặt Hàng */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 rounded-2xl bg-[#193a2c] hover:bg-[#112d20] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Đang Xử Lý Đơn Hàng...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Xác Nhận Đặt Hàng ({formatCurrency(total)})</span>
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-on-surface-variant leading-relaxed">
              🌱 Bằng cách nhấn Xác nhận đặt hàng, bạn đồng ý với chính sách giao nhận và bảo hành
              cây trồng 100% của Nhà Có Cây.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
