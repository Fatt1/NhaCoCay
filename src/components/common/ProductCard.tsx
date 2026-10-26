import React from "react"
import type { Product } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, e: React.MouseEvent) => void
  onSelectProduct?: (product: Product) => void
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
  className = "",
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "₫"
  }

  return (
    <Card
      onClick={() => onSelectProduct?.(product)}
      className={`bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer ${className}`}
    >
      <CardContent className="p-0 flex flex-col justify-between h-full">
        <div>
          {/* Single Image (không bấm qua bấm lại) */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-surface-container-low select-none">
            <img
              src={product.coverImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h4
              className="font-bold text-base text-on-surface truncate mt-1 group-hover:text-primary transition-colors"
              title={product.name}
            >
              {product.name}
            </h4>
            <p className="text-xs text-on-surface-variant line-clamp-2">
              {product.shortDescription}
            </p>
          </div>
        </div>

        {/* Bottom: Giá gốc, giá giảm & Nút giỏ hàng (giống ban đầu) */}
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-primary text-base">
                {formatCurrency(product.salePrice)}
              </span>
              {product.originalPrice > product.salePrice && (
                <span className="text-[11px] text-outline line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <Button
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart?.(product, e)
              }}
              className="size-9 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-primary flex items-center justify-center font-bold text-lg transition-colors cursor-pointer active:scale-95 shadow-none"
              title="Thêm vào giỏ hàng"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
