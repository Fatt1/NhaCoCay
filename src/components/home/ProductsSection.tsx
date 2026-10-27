import React, { useEffect, useState } from "react"
import { getProducts } from "@/services"
import { useCartStore, useAuthStore } from "@/stores"
import type { Product } from "@/types"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/common"

interface ProductsSectionProps {
  searchKeyword?: string
  onNotify?: (message: string, icon?: string) => void
  onSelectProduct?: (product: Product) => void
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  searchKeyword = "",
  onNotify,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    let isMounted = true
    getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = products.filter((p) => {
    if (!searchKeyword.trim()) return true
    const kw = searchKeyword.toLowerCase()
    return p.name.toLowerCase().includes(kw) || p.shortDescription.toLowerCase().includes(kw)
  })

  const { user } = useAuthStore()

  const handleAddToCart = (product: Product) => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "lock")
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      imageUrl: product.coverImage,
      quantity: 1,
    })
    onNotify?.(`Đã thêm "${product.name}" vào giỏ hàng! 🌱`, "shopping_bag")
  }

  return (
    <section className="py-20 bg-surface" id="shop-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-primary uppercase tracking-wider font-semibold block">
              CỬA HÀNG XANH
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Bộ Kit Trồng Cây Yêu Thích
            </h2>
            <p className="font-body text-sm text-on-surface-variant">
              Đã bao gồm đầy đủ hạt giống, đất sinh học, chậu gốm & cẩm nang chi tiết." thành "Đã bao gồm đầy đủ hạt giống, viên nén xơ dừa, chậu giấy, hướng dẫn chi tiết & sticker...
            </p>
          </div>

          <a
            href="#shop-section"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold transition-colors shrink-0"
          >
            <span>Xem tất cả bộ kit</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Card
                key={n}
                className="bg-surface-container-lowest rounded-3xl p-4 border border-outline-variant/30 flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-square rounded-2xl" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="size-9 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant gap-2">
            <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
            <p className="text-sm">Không tìm thấy sản phẩm phù hợp với từ khóa "{searchKeyword}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
