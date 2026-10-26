import React, { useState } from "react"
import type { Order, OrderItem, OrderStatus } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  User,
  Phone,
  MapPin,
  FileText,
  Copy,
  Printer,
  Check,
  ArrowRight,
  Package,
} from "lucide-react"

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
}

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string
    color: string
    bgColor: string
    borderColor: string
    icon: React.ReactNode
  }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "text-amber-800",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    icon: <Clock className="size-3.5 text-amber-700" />,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <CheckCircle2 className="size-3.5 text-blue-600" />,
  },
  shipping: {
    label: "Đang giao",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: <Truck className="size-3.5 text-purple-600" />,
  },
  delivered: {
    label: "Giao thành công",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: <PackageCheck className="size-3.5 text-emerald-600" />,
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    icon: <XCircle className="size-3.5 text-rose-600" />,
  },
}

/**
 * Normalizes items list to safely handle any Firestore variations:
 * Array, Object with numeric keys, stringified JSON, or alternative field names (items, products, orderItems, cartItems)
 */
const normalizeOrderItems = (ord: any): OrderItem[] => {
  if (!ord) return []
  let raw = ord.items ?? ord.products ?? ord.orderItems ?? ord.cartItems ?? ord.itemList
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw)
    } catch {
      raw = []
    }
  }
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : Object.values(raw)
  return list.map((item: any, idx: number) => ({
    productId: item.productId || item.id || `item_${idx}`,
    name: item.name || item.title || item.productName || "Bộ Kit Trồng Cây",
    price: typeof item.price === "number" ? item.price : parseFloat(item.price) || 0,
    quantity: typeof item.quantity === "number" ? item.quantity : parseInt(item.quantity, 10) || 1,
    imageUrl: item.imageUrl || item.image || item.coverImage || item.thumbnail || (item.images && item.images[0]) || "",
  }))
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!order) return null

  const items = normalizeOrderItems(order)
  const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending

  const customer = {
    fullName: order.customer?.fullName || (order as any).fullName || "Khách hàng",
    phoneNumber: order.customer?.phoneNumber || (order as any).phoneNumber || (order as any).phone || "Không có SĐT",
    email: order.customer?.email || (order as any).email || "",
    address: order.customer?.address || (order as any).address || "Nhận tại cửa hàng",
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true)
      await onUpdateStatus(order.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Quick next status action helper
  const getNextStatusAction = () => {
    if (order.status === "pending") {
      return { status: "confirmed" as OrderStatus, label: "Duyệt Đơn Hàng", icon: <CheckCircle2 className="size-3.5" /> }
    }
    if (order.status === "confirmed") {
      return { status: "shipping" as OrderStatus, label: "Giao Hàng", icon: <Truck className="size-3.5" /> }
    }
    if (order.status === "shipping") {
      return { status: "delivered" as OrderStatus, label: "Đã Giao Thành Công", icon: <PackageCheck className="size-3.5" /> }
    }
    return null
  }

  const nextAction = getNextStatusAction()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden p-0 gap-0 border-border bg-card text-foreground shadow-2xl rounded-2xl flex flex-col">
        {/* Sticky Header with solid background */}
        <DialogHeader className="p-4 md:p-5 pb-3 border-b border-border bg-card sticky top-0 z-10 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
            <div className="flex flex-col gap-0.5 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base md:text-lg font-heading font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <span>Chi Tiết Đơn Hàng</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md text-xs font-bold">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                </DialogTitle>
                <button
                  type="button"
                  onClick={() => handleCopy(order.id, "orderId")}
                  className="size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                  title="Sao chép mã đơn"
                >
                  {copiedField === "orderId" ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3 text-muted-foreground/70" />
                <span>
                  Đặt lúc:{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </DialogDescription>
            </div>

            {/* Current Status Pill */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 shadow-2xs ${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor}`}
              >
                {statusCfg.icon}
                <span>{statusCfg.label}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Action & Status Fast-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-2 bg-muted/30 border-b border-border/60 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Trạng thái:</span>
            <select
              value={order.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="text-xs font-bold rounded-lg border border-border bg-card text-foreground px-2.5 py-1 focus:ring-1 focus:ring-primary focus:outline-hidden disabled:opacity-50 cursor-pointer shadow-2xs h-7.5"
            >
              <option value="pending">Chờ duyệt</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Giao thành công</option>
              <option value="cancelled">Hủy đơn</option>
            </select>
            {isUpdating && (
              <span className="material-symbols-outlined text-[16px] animate-spin text-primary">
                progress_activity
              </span>
            )}
          </div>

          {nextAction && (
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleStatusChange(nextAction.status)}
              className="rounded-lg text-xs font-bold gap-1.5 h-7.5 px-3 cursor-pointer shadow-xs"
            >
              {nextAction.icon}
              <span>{nextAction.label}</span>
              <ArrowRight className="size-3" />
            </Button>
          )}
        </div>

        {/* Scrollable Body: Compact customer info + PRIME FOCUS ON PURCHASED PRODUCTS */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 bg-muted/20">
          {/* COMPACT Customer & Shipping Information Strip (Takes only ~70px of vertical space) */}
          <div className="bg-card border border-border rounded-xl p-3 md:p-3.5 shadow-xs flex flex-col gap-2.5 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-center">
              {/* Customer Name & Phone (5 cols) */}
              <div className="md:col-span-5 flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Khách hàng:</span>
                    <span className="font-bold text-foreground truncate">{customer.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <Phone className="size-3 text-emerald-600 shrink-0" />
                    <a href={`tel:${customer.phoneNumber}`} className="hover:underline hover:text-primary">
                      {customer.phoneNumber}
                    </a>
                    {customer.phoneNumber !== "Không có SĐT" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(customer.phoneNumber, "phone")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                        title="Sao chép số điện thoại"
                      >
                        {copiedField === "phone" ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address (5 cols) */}
              <div className="md:col-span-5 flex items-start gap-2.5 min-w-0 border-t md:border-t-0 md:border-l border-border/60 pt-2 md:pt-0 md:pl-3">
                <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="size-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Địa chỉ nhận hàng:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(customer.address, "address")}
                      className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                      title="Sao chép địa chỉ"
                    >
                      {copiedField === "address" ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                  <span className="font-medium text-foreground text-xs line-clamp-1 leading-relaxed" title={customer.address}>
                    {customer.address}
                  </span>
                </div>
              </div>

              {/* Payment Method Chip (2 cols) */}
              <div className="md:col-span-2 flex flex-col md:items-end justify-center text-[11px] text-muted-foreground border-t md:border-t-0 md:border-l border-border/60 pt-2 md:pt-0 md:pl-3">
                <span className="font-bold text-foreground">COD (Tiền mặt)</span>
                <span className="text-emerald-700 font-semibold text-[10px]">Freeship toàn quốc</span>
              </div>
            </div>

            {/* Customer Note if present */}
            {order.note && (
              <div className="flex items-center gap-2 p-2 px-2.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs">
                <FileText className="size-3.5 text-amber-700 shrink-0" />
                <span className="font-bold text-[11px] text-amber-800 shrink-0">Ghi chú khách:</span>
                <span className="italic truncate">"{order.note}"</span>
              </div>
            )}
          </div>

          {/* MAIN SPOTLIGHT: Danh Sách Sản Phẩm Đã Mua (Purchased Products Table) */}
          <div className="flex-1 bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col min-h-0">
            {/* Header of items */}
            <div className="p-3.5 md:p-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                <h4 className="text-xs md:text-sm font-bold text-foreground uppercase tracking-wider">
                  Danh Sách Sản Phẩm Đã Mua ({items.length} món)
                </h4>
              </div>
              <Badge variant="secondary" className="font-bold text-xs">
                Tổng {items.reduce((s, i) => s + (i.quantity || 1), 0)} sản phẩm
              </Badge>
            </div>

            {/* Table or Empty Notice */}
            {items.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <Package className="size-10 text-muted-foreground/40" />
                <p className="text-xs font-bold text-foreground">Không tìm thấy sản phẩm nào trong đơn hàng này</p>
                <p className="text-[11px] text-muted-foreground">
                  Đơn hàng có thể được lưu trữ từ dữ liệu cũ không có mảng chi tiết sản phẩm.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border text-xs">
                      <TableHead className="w-[68px]">Ảnh</TableHead>
                      <TableHead>Tên Bộ Kit Sản Phẩm</TableHead>
                      <TableHead className="text-center w-[90px]">Số Lượng</TableHead>
                      <TableHead className="text-right w-[130px]">Đơn Giá</TableHead>
                      <TableHead className="text-right w-[140px]">Thành Tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx} className="border-border/60 hover:bg-muted/30">
                        {/* Ảnh sản phẩm */}
                        <TableCell>
                          <div className="size-13 rounded-xl overflow-hidden border border-border bg-muted shrink-0 relative shadow-2xs">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg bg-emerald-50">
                                🌱
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Tên sản phẩm */}
                        <TableCell>
                          <span className="font-bold text-xs md:text-sm text-foreground line-clamp-2">
                            {item.name}
                          </span>
                          {item.productId && (
                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                              Mã SP: {item.productId.slice(-8)}
                            </span>
                          )}
                        </TableCell>

                        {/* Số lượng */}
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold text-xs px-2.5 py-0.5">
                            x{item.quantity}
                          </Badge>
                        </TableCell>

                        {/* Đơn giá */}
                        <TableCell className="text-right text-xs text-muted-foreground font-medium">
                          {formatCurrency(item.price)}
                        </TableCell>

                        {/* Thành tiền */}
                        <TableCell className="text-right font-extrabold text-xs md:text-sm text-emerald-700">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Compact Financial Summary Breakdown */}
            <div className="p-3.5 md:p-4 bg-muted/40 border-t border-border flex flex-col gap-1.5 shrink-0 mt-auto">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(
                    items.reduce((s, i) => s + i.price * i.quantity, 0) || order.totalAmount
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-700">Miễn phí giao hàng (0₫)</span>
              </div>
              <Separator className="my-0.5" />
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Tổng Tiền Khách Thanh Toán:
                </span>
                <span className="text-lg md:text-xl font-heading font-extrabold text-emerald-700">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer with solid background */}
        <div className="p-3.5 md:px-5 border-t border-border bg-card flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs rounded-xl px-3.5 h-8.5 gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>In Đơn Hàng</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl px-6 h-8.5 font-bold cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
