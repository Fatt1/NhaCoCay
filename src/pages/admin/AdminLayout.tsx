import React from "react"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Plus,
  RotateCw,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export type AdminTab = "dashboard" | "orders" | "products"

interface AdminLayoutProps {
  activeTab: AdminTab
  onSwitchTab: (tab: AdminTab) => void
  ordersCount: number
  pendingOrdersCount: number
  productsCount: number
  isRefreshing: boolean
  onRefresh: () => Promise<void>
  onOpenAddProduct: () => void
  onBackToShop: () => void
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSwitchTab,
  ordersCount,
  pendingOrdersCount,
  productsCount,
  isRefreshing,
  onRefresh,
  onOpenAddProduct,
  onBackToShop,
  children,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <SidebarProvider defaultOpen={true} className="h-screen w-screen overflow-hidden">
        {/* ================= OFFICIAL SHADCN SIDEBAR ================= */}
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shrink-0 select-none">
          <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs shrink-0 text-lg">
                🌱
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="font-heading font-extrabold text-sm text-sidebar-foreground truncate tracking-tight">
                  Nhà Có Cây
                </span>
                <span className="text-[11px] font-medium text-sidebar-foreground/70 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Admin Management</span>
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2.5">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-wider text-sidebar-foreground/50 px-2">
                Quản Trị Hệ Thống
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* 1. Dashboard */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "dashboard"}
                      onClick={() => onSwitchTab("dashboard")}
                      tooltip="Dashboard"
                      className={`cursor-pointer rounded-xl transition-all ${
                        activeTab === "dashboard"
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : "hover:bg-muted text-sidebar-foreground font-medium"
                      }`}
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* 2. Đơn Hàng */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "orders"}
                      onClick={() => onSwitchTab("orders")}
                      tooltip="Quản lý đơn hàng"
                      className={`cursor-pointer rounded-xl transition-all ${
                        activeTab === "orders"
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : "hover:bg-muted text-sidebar-foreground font-medium"
                      }`}
                    >
                      <ShoppingBag className="size-4" />
                      <span>Đơn Hàng</span>
                    </SidebarMenuButton>
                    {pendingOrdersCount > 0 && (
                      <SidebarMenuBadge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 text-[11px]">
                        {pendingOrdersCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>

                  {/* 3. Sản Phẩm */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeTab === "products"}
                      onClick={() => onSwitchTab("products")}
                      tooltip="Quản lý sản phẩm"
                      className={`cursor-pointer rounded-xl transition-all ${
                        activeTab === "products"
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : "hover:bg-muted text-sidebar-foreground font-medium"
                      }`}
                    >
                      <Package className="size-4" />
                      <span>Sản Phẩm</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="bg-muted text-foreground border border-border font-semibold">
                      {productsCount}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-3" />

            {/* Quick Action Button in Sidebar */}
            <div className="p-1 group-data-[collapsible=icon]:hidden">
              <Button
                type="button"
                size="sm"
                onClick={onOpenAddProduct}
                className="w-full text-xs font-bold gap-1.5 rounded-xl shadow-xs cursor-pointer h-9"
              >
                <Plus className="size-4" />
                <span>+ Thêm Bộ Kit Mới</span>
              </Button>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-3 flex flex-col gap-2 bg-sidebar">
            {/* Admin User Info using Shadcn Avatar */}
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-muted/40 border border-border/40 group-data-[collapsible=icon]:justify-center">
              <Avatar className="size-8 border border-border shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-bold text-sidebar-foreground truncate">
                  Quản Trị Viên
                </span>
                <span className="text-[10px] text-sidebar-foreground/60 truncate font-mono">
                  admin@nhacocay.vn
                </span>
              </div>
            </div>

            {/* Back to Shop */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToShop}
              className="w-full justify-start gap-2 text-xs font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-muted cursor-pointer rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              title="Về Website Cửa Hàng"
            >
              <Store className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Về Cửa Hàng</span>
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* ================= OFFICIAL SHADCN SIDEBAR INSET ================= */}
        <SidebarInset className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-background">
          {/* Top Navbar Header */}
          <header className="flex h-15 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-6 z-10 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="-ml-1 cursor-pointer shrink-0 hover:bg-muted rounded-xl" />
              <Separator orientation="vertical" className="h-5 shrink-0" />
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-sm md:text-base font-heading font-extrabold text-foreground truncate">
                  {activeTab === "dashboard" && "Dashboard Tổng Quan"}
                  {activeTab === "orders" && "Quản Lý Đơn Hàng"}
                  {activeTab === "products" && "Danh Sách Bộ Kit Trồng Cây"}
                </h1>
                <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground border-border shrink-0 hidden sm:inline-flex">
                  {activeTab === "dashboard" && "Real-time Metrics"}
                  {activeTab === "orders" && `${ordersCount} Đơn hàng`}
                  {activeTab === "products" && `${productsCount} Bộ kit`}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Live sync badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firestore Live</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="gap-1.5 text-xs rounded-xl border-border hover:bg-muted text-foreground cursor-pointer h-8.5 font-medium shadow-2xs"
                title="Làm mới dữ liệu từ Firestore"
              >
                <RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                <span className="hidden sm:inline">Làm Mới</span>
              </Button>

              {activeTab === "products" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onOpenAddProduct}
                  className="gap-1.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer h-8.5"
                >
                  <Plus className="size-3.5" />
                  <span>Thêm Sản Phẩm Mới</span>
                </Button>
              )}
            </div>
          </header>

          {/* Scrollable Main Content */}
          <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 bg-muted/20">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
