import React from "react"
import type { Order, OrderStatus, Product } from "@/types"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Eye,
} from "lucide-react"

interface AdminDashboardPageProps {
  orders: Order[]
  products: Product[]
  loadingOrders: boolean
  onNavigateTab: (tab: "dashboard" | "orders" | "products") => void
  onOpenOrderDetail: (order: Order) => void
  onSetOrderStatusFilter: (filter: string) => void
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

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  orders,
  products,
  loadingOrders,
  onNavigateTab,
  onOpenOrderDetail,
  onSetOrderStatusFilter,
}) => {
  // Stats Calculation
  const totalOrdersCount = orders.length
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length
  const totalProductsCount = products.length
  const outOfStockCount = products.filter((p) => (p.stockQuantity || 0) <= 0).length

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Alert Banner for pending orders needing approval */}
      {pendingOrdersCount > 0 && (
        <Card className="bg-amber-50/90 border-amber-200/90 shadow-xs">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3 text-amber-950">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                <AlertTriangle className="size-5 text-amber-700" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold text-amber-950">
                  Có {pendingOrdersCount} đơn hàng mới đang chờ duyệt!
                </h3>
                <p className="text-[11px] text-amber-800">
                  Vui lòng kiểm tra và xác nhận đơn hàng để chuyển sang giai đoạn đóng gói và vận chuyển.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onSetOrderStatusFilter("pending")
                onNavigateTab("orders")
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-8.5 gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Xem và duyệt ngay</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 4 Elevated KPI Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng Doanh Thu */}
        <Card className="rounded-2xl border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tổng Doanh Thu
            </CardTitle>
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base shadow-2xs">
              ₫
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 flex flex-col gap-1">
            <div className="text-2xl font-extrabold font-heading text-emerald-700">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <TrendingUp className="size-3 text-emerald-600" />
              <span>Đơn hợp lệ (đã trừ hủy)</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Tổng Số Đơn Hàng */}
        <Card className="rounded-2xl border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tổng Đơn Hàng
            </CardTitle>
            <div className="size-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs">
              <ShoppingBag className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 flex flex-col gap-1">
            <div className="text-2xl font-extrabold font-heading text-foreground">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đơn hàng khách đã đặt
            </p>
          </CardContent>
        </Card>

        {/* 3. Đơn Cần Duyệt */}
        <Card className="rounded-2xl border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Đơn Cần Duyệt
            </CardTitle>
            <div className="size-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-extrabold font-heading text-amber-600">
                {pendingOrdersCount}
              </div>
              {pendingOrdersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onSetOrderStatusFilter("pending")
                    onNavigateTab("orders")
                  }}
                  className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Xử lý</span>
                  <ArrowRight className="size-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đang chờ xác nhận từ shop
            </p>
          </CardContent>
        </Card>

        {/* 4. Bộ Kit Trong Kho */}
        <Card className="rounded-2xl border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Bộ Kit Trong Kho
            </CardTitle>
            <div className="size-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-2xs">
              <Package className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1 flex flex-col gap-1">
            <div className="text-2xl font-extrabold font-heading text-foreground">
              {totalProductsCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {outOfStockCount > 0 ? (
                <span className="text-rose-600 font-bold">{outOfStockCount} sản phẩm hết hàng</span>
              ) : (
                <span className="text-emerald-700 font-semibold">Tất cả sản phẩm còn hàng</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table using Shadcn Card & Table */}
      <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-border bg-card flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm md:text-base font-bold text-foreground">
              Đơn Hàng Gần Đây Cần Theo Dõi
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Top 5 đơn hàng mới nhất trên hệ thống shop Nhà Có Cây
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab("orders")}
            className="text-xs text-primary hover:text-primary hover:bg-primary/10 font-bold cursor-pointer"
          >
            Xem tất cả ({orders.length}) →
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl animate-spin text-primary">
                progress_activity
              </span>
              <span>Đang tải dữ liệu đơn hàng...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              Chưa có đơn hàng nào trên hệ thống.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border">
                  <TableHead className="w-[120px]">Mã Đơn</TableHead>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead className="w-[100px] text-center">Số Món</TableHead>
                  <TableHead className="w-[130px]">Tổng Tiền</TableHead>
                  <TableHead className="w-[150px]">Trạng Thái</TableHead>
                  <TableHead className="text-right w-[120px]">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => {
                  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending
                  const initials = order.customer.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(-2)
                    .join("")
                    .toUpperCase() || "KH"

                  return (
                    <TableRow key={order.id} className="border-border/60 hover:bg-muted/40">
                      <TableCell className="font-mono font-bold text-xs text-foreground">
                        <span className="bg-muted px-2 py-1 rounded text-[11px]">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7 border border-border">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground truncate">
                              {order.customer.fullName}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {order.customer.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                        {order.items.length} món
                      </TableCell>
                      <TableCell className="text-xs font-extrabold text-emerald-700">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit ${cfg.className}`}>
                          <span className={`size-1.5 rounded-full ${cfg.dotColor}`} />
                          <span>{cfg.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenOrderDetail(order)}
                          className="h-8 text-xs px-2.5 rounded-lg border-border hover:bg-muted text-foreground cursor-pointer gap-1.5 shadow-2xs"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>Chi Tiết</span>
                        </Button>
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
