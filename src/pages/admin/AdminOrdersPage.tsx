import React from "react"
import type { Order, OrderStatus } from "@/types"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, X, Eye, Phone, MapPin, ShoppingBag } from "lucide-react"

interface AdminOrdersPageProps {
  orders: Order[]
  loadingOrders: boolean
  orderSearch: string
  onOrderSearchChange: (search: string) => void
  orderStatusFilter: string
  onOrderStatusFilterChange: (status: string) => void
  updatingOrderId: string | null
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
  onOpenOrderDetail: (order: Order) => void
}

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
    dotColor: "bg-amber-500",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    dotColor: "bg-blue-500",
  },
  shipping: {
    label: "Đang giao",
    className: "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    dotColor: "bg-purple-500",
  },
  delivered: {
    label: "Giao thành công",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
    dotColor: "bg-emerald-500",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
    dotColor: "bg-rose-500",
  },
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  orders,
  loadingOrders,
  orderSearch,
  onOrderSearchChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  updatingOrderId,
  onUpdateStatus,
  onOpenOrderDetail,
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter
    const term = orderSearch.trim().toLowerCase()
    const matchesSearch =
      !term ||
      order.id.toLowerCase().includes(term) ||
      order.customer.fullName.toLowerCase().includes(term) ||
      order.customer.phoneNumber.includes(term) ||
      order.customer.email.toLowerCase().includes(term) ||
      order.customer.address.toLowerCase().includes(term)
    return matchesStatus && matchesSearch
  })

  const statusTabs = [
    { key: "all", label: "Tất cả", count: orders.length },
    {
      key: "pending",
      label: "Chờ duyệt",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      key: "confirmed",
      label: "Đã xác nhận",
      count: orders.filter((o) => o.status === "confirmed").length,
    },
    {
      key: "shipping",
      label: "Đang giao",
      count: orders.filter((o) => o.status === "shipping").length,
    },
    {
      key: "delivered",
      label: "Giao thành công",
      count: orders.filter((o) => o.status === "delivered").length,
    },
    {
      key: "cancelled",
      label: "Đã hủy",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      {/* Search & Status Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card rounded-2xl border border-border shadow-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onOrderStatusFilterChange(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                orderStatusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                orderStatusFilter === tab.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input using Shadcn Input */}
        <div className="w-full lg:w-80 relative">
          <Input
            type="text"
            value={orderSearch}
            onChange={(e) => onOrderSearchChange(e.target.value)}
            placeholder="Tìm theo mã đơn, họ tên, SĐT, địa chỉ..."
            className="rounded-xl text-xs h-10 pl-9.5 bg-card border-border shadow-2xs"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          {orderSearch && (
            <button
              type="button"
              onClick={() => onOrderSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Data Card & Table */}
      <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loadingOrders ? (
            <div className="p-16 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl animate-spin text-primary">
                progress_activity
              </span>
              <span>Đang tải danh sách đơn hàng từ Firestore...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60">
                <ShoppingBag className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-foreground">Không tìm thấy đơn hàng nào</h3>
                <p className="text-xs text-muted-foreground">
                  Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border">
                  <TableHead className="w-[110px]">Mã Đơn</TableHead>
                  <TableHead className="w-[190px]">Khách Hàng</TableHead>
                  <TableHead className="w-[130px]">Số Điện Thoại</TableHead>
                  <TableHead>Địa Chỉ Nhận Hàng</TableHead>
                  <TableHead className="w-[120px]">Tổng Tiền</TableHead>
                  <TableHead className="w-[150px]">Trạng Thái</TableHead>
                  <TableHead className="w-[200px] text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending
                  const isUpdating = updatingOrderId === order.id
                  const initials = order.customer.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(-2)
                    .join("")
                    .toUpperCase() || "KH"

                  return (
                    <TableRow key={order.id} className="border-border/60 hover:bg-muted/40">
                      {/* 1. Mã Đơn & Ngày */}
                      <TableCell className="font-mono font-bold text-xs text-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span className="bg-muted px-2 py-0.5 rounded-md text-[11px] w-fit border border-border/50">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="font-sans font-normal text-[10px] text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </TableCell>

                      {/* 2. Người đặt */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7 border border-border shrink-0">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-xs text-foreground truncate">
                            {order.customer.fullName}
                          </span>
                        </div>
                      </TableCell>

                      {/* 3. Số điện thoại */}
                      <TableCell className="font-mono text-xs text-foreground">
                        <a
                          href={`tel:${order.customer.phoneNumber}`}
                          className="hover:underline hover:text-primary flex items-center gap-1"
                        >
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{order.customer.phoneNumber}</span>
                        </a>
                      </TableCell>

                      {/* 4. Địa chỉ giao hàng */}
                      <TableCell>
                        <span className="text-xs text-foreground line-clamp-1 max-w-[280px] flex items-center gap-1" title={order.customer.address}>
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{order.customer.address}</span>
                        </span>
                      </TableCell>

                      {/* 5. Tổng tiền */}
                      <TableCell className="font-extrabold text-xs text-emerald-700">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>

                      {/* 6. Trạng thái */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 w-fit ${statusCfg.className}`}
                        >
                          <span className={`size-1.5 rounded-full ${statusCfg.dotColor}`} />
                          <span>{statusCfg.label}</span>
                        </Badge>
                      </TableCell>

                      {/* 7. Thao tác: Xem chi tiết Popup + Fast status selector */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenOrderDetail(order)}
                            className="h-8 text-xs px-2.5 rounded-lg border-border hover:bg-muted text-foreground cursor-pointer gap-1.5 shadow-2xs"
                            title="Xem chi tiết đơn hàng dạng Popup"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span>Xem</span>
                          </Button>

                          {/* Fast status selector */}
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              onUpdateStatus(order.id, e.target.value as OrderStatus)
                            }
                            className="text-xs font-semibold rounded-lg border border-border bg-background text-foreground px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-hidden disabled:opacity-50 cursor-pointer shadow-2xs h-8"
                            title="Cập nhật nhanh trạng thái"
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
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
