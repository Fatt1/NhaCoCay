import React from "react"
import type { Product } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Search, X, Edit, Trash2, Package } from "lucide-react"

interface AdminProductsPageProps {
  products: Product[]
  loadingProducts: boolean
  productSearch: string
  onProductSearchChange: (search: string) => void
  productStockFilter: "all" | "in_stock" | "out_of_stock"
  onProductStockFilterChange: (filter: "all" | "in_stock" | "out_of_stock") => void
  deletingProductId: string | null
  onOpenAddProduct: () => void
  onOpenEditProduct: (product: Product) => void
  onDeleteProduct: (product: Product) => Promise<void>
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  products,
  loadingProducts,
  productSearch,
  onProductSearchChange,
  productStockFilter,
  onProductStockFilterChange,
  deletingProductId,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  const outOfStockCount = products.filter((p) => (p.stockQuantity || 0) <= 0).length
  const inStockCount = products.length - outOfStockCount

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const term = productSearch.trim().toLowerCase()
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.shortDescription.toLowerCase().includes(term)
    const matchesStock =
      productStockFilter === "all" ||
      (productStockFilter === "in_stock" && (p.stockQuantity || 0) > 0) ||
      (productStockFilter === "out_of_stock" && (p.stockQuantity || 0) <= 0)
    return matchesSearch && matchesStock
  })

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      {/* Search, Stock Filters & Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input using Shadcn Input */}
          <div className="w-full sm:w-80 relative">
            <Input
              type="text"
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="Tìm kiếm bộ kit theo tên hoặc mô tả..."
              className="rounded-xl text-xs h-10 pl-9.5 bg-card border-border shadow-2xs"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            {productSearch && (
              <button
                type="button"
                onClick={() => onProductSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Stock filter chips */}
          <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-border shadow-2xs">
            <button
              type="button"
              onClick={() => onProductStockFilterChange("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                productStockFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Tất cả ({products.length})
            </button>
            <button
              type="button"
              onClick={() => onProductStockFilterChange("in_stock")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                productStockFilter === "in_stock"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Còn hàng ({inStockCount})
            </button>
            <button
              type="button"
              onClick={() => onProductStockFilterChange("out_of_stock")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                productStockFilter === "out_of_stock"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Hết hàng ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <Button
          type="button"
          onClick={onOpenAddProduct}
          className="rounded-xl text-xs font-bold gap-2 shadow-xs shrink-0 cursor-pointer h-10 px-4"
        >
          <Plus className="size-4" />
          <span>+ Thêm Bộ Kit Mới</span>
        </Button>
      </div>

      {/* Products Data Card & Table */}
      <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loadingProducts ? (
            <div className="p-16 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl animate-spin text-primary">
                progress_activity
              </span>
              <span>Đang tải danh sách bộ kit từ Firestore...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60">
                <Package className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-foreground">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-muted-foreground">
                  Bạn có thể tạo mới một bộ kit gieo mầm ngay bây giờ.
                </p>
              </div>
              <Button
                type="button"
                onClick={onOpenAddProduct}
                className="rounded-xl text-xs font-bold mt-2 cursor-pointer h-9 px-4"
              >
                + Thêm Sản Phẩm Ngay
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border">
                  <TableHead className="w-[320px]">Bộ Kit Sản Phẩm</TableHead>
                  <TableHead className="w-[140px]">Giá Bán</TableHead>
                  <TableHead className="w-[120px]">Tồn Kho</TableHead>
                  <TableHead>Thông Số Sinh Trưởng (Specs)</TableHead>
                  <TableHead className="w-[100px] text-center">Phụ Kiện</TableHead>
                  <TableHead className="w-[150px] text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isDeleting = deletingProductId === product.id
                  const discount =
                    product.originalPrice > product.salePrice
                      ? Math.round(
                          ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
                        )
                      : 0

                  return (
                    <TableRow key={product.id} className="border-border/60 hover:bg-muted/40 align-top">
                      {/* Ảnh & Tên sản phẩm */}
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="relative size-13 rounded-xl bg-muted overflow-hidden shrink-0 border border-border shadow-2xs">
                            <img
                              src={product.coverImage || product.images?.[0] || ""}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                            {discount > 0 && (
                              <span className="absolute bottom-0 right-0 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-tl">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground line-clamp-1 hover:text-primary transition-colors">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                              {product.shortDescription}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Giá bán / Giá gốc */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-xs text-emerald-700">
                            {formatCurrency(product.salePrice)}
                          </span>
                          {product.originalPrice > product.salePrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Tồn kho */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.stockQuantity > 10
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : product.stockQuantity > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {product.stockQuantity > 0
                            ? `Còn ${product.stockQuantity} bộ`
                            : "Hết hàng"}
                        </Badge>
                      </TableCell>

                      {/* Thông số sinh trưởng */}
                      <TableCell>
                        {product.specifications ? (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-foreground/80">
                            <div>
                              <span className="text-muted-foreground text-[10px]">Nảy mầm: </span>
                              <span className="font-semibold">{product.specifications.germinationRate?.value || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-[10px]">Thời gian: </span>
                              <span className="font-semibold">{product.specifications.germinationTime?.value || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-[10px]">Ra hoa: </span>
                              <span className="font-semibold">{product.specifications.floweringTime?.value || "N/A"}</span>
                            </div>
                            <div className="truncate max-w-[140px]" title={product.specifications.plantCareNotes?.value}>
                              <span className="text-muted-foreground text-[10px]">Lưu ý: </span>
                              <span className="font-semibold">{product.specifications.plantCareNotes?.value || "N/A"}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa có thông số</span>
                        )}
                      </TableCell>

                      {/* Phụ kiện */}
                      <TableCell className="text-center">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold border border-border/60">
                          {product.kitComponents?.length || 0} món
                        </span>
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenEditProduct(product)}
                            className="h-8 text-xs px-2.5 rounded-lg border-border text-foreground hover:bg-muted cursor-pointer gap-1 shadow-2xs"
                          >
                            <Edit className="size-3.5 text-primary" />
                            <span>Sửa</span>
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => onDeleteProduct(product)}
                            className="h-8 text-xs px-2.5 rounded-lg cursor-pointer gap-1 shadow-2xs"
                          >
                            {isDeleting ? (
                              <span className="material-symbols-outlined text-[16px] animate-spin">
                                progress_activity
                              </span>
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            <span>Xóa</span>
                          </Button>
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
