import React, { useEffect, useState } from "react"
import { getProducts } from "@/services"
import { useCartStore, useAuthStore } from "@/stores"
import type { Product } from "@/types"
import { ProductCard } from "@/components/common"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface PlantKitsPageProps {
  searchKeyword?: string
  onBack: () => void
  onSelectProduct: (product: Product) => void
  onNotify?: (message: string, icon?: string) => void
  onSearchChange?: (kw: string) => void
}

export const PlantKitsPage: React.FC<PlantKitsPageProps> = ({
  searchKeyword = "",
  onBack,
  onSelectProduct,
  onNotify,
  onSearchChange,
}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [keywordInput, setKeywordInput] = useState(searchKeyword)
  const [activeKeyword, setActiveKeyword] = useState(searchKeyword)

  const { addItem } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    window.scrollTo({ top: 0, behavior: "smooth" })

    getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync external search keyword
  useEffect(() => {
    setKeywordInput(searchKeyword)
    setActiveKeyword(searchKeyword)
  }, [searchKeyword])

  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setActiveKeyword(keywordInput.trim())
      onSearchChange?.(keywordInput.trim())
    }
  }

  const handleTriggerSearch = () => {
    setActiveKeyword(keywordInput.trim())
    onSearchChange?.(keywordInput.trim())
  }

  const filteredProducts = products.filter((p) => {
    if (!activeKeyword.trim()) return true
    const kw = activeKeyword.toLowerCase()
    return p.name.toLowerCase().includes(kw) || p.shortDescription.toLowerCase().includes(kw)
  })

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
    <div className="bg-surface min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium select-none">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Trang Chủ</span>
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Cửa Hàng Xanh
          </button>
          <span>/</span>
          <span className="text-on-surface font-semibold">
            Bộ Kit Trồng Cây Trọn Gói
          </span>
        </nav>

        {/* Hero Banner (matching user image) */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#dcf4e7] via-[#eaf8f0] to-[#f3fbf6] border border-[#bfe8d2] shadow-xs overflow-hidden flex flex-col gap-4">
          {/* Subtle Decorative Botanical Shape */}
          <div className="absolute right-6 -bottom-6 size-48 opacity-25 pointer-events-none hidden sm:block">
            <svg viewBox="0 0 200 200" fill="none" className="size-full">
              <polygon points="100,20 180,180 20,160" fill="#2d6a4f" opacity="0.4" />
              <polygon points="100,20 180,180 100,120" fill="#1b4332" opacity="0.6" />
            </svg>
          </div>

          <div className="flex flex-col gap-2 max-w-2xl z-10">
            <h1 className="font-heading text-2xl sm:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <span>Bộ Kit Trồng Cây Trọn Gói</span>
              <span className="text-primary text-2xl">🌱</span>
            </h1>
            <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Tất cả những gì bạn cần để bắt đầu một góc xanh bình yên tại nhà — từ hạt giống, viên nén sơ dừa đến chậu giấy và hướng dẫn chăm sóc cây.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 z-10">
            <span className="px-4 py-1.5 rounded-full bg-[#1b4332] text-white text-xs font-semibold shadow-xs">
              Tất Cả {products.length > 0 ? `(${products.length})` : ""}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <span className="text-xs text-on-surface-variant font-medium">
            Hiển thị <strong className="text-on-surface font-bold">{filteredProducts.length}</strong> trong số{" "}
            <strong className="text-on-surface font-bold">{products.length}</strong> bộ kit trồng cây trọn gói
          </span>

          {/* Search Input with Enter trigger */}
          <div className="relative w-full sm:w-80">
            <span
              onClick={handleTriggerSearch}
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] cursor-pointer hover:text-primary transition-colors"
            >
              search
            </span>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDownSearch}
              placeholder="Tìm kiếm cây, hạt giống... (Nhấn Enter)"
              className="w-full pl-9 pr-16 py-2 bg-surface-container-low rounded-full text-xs text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => {
                  setKeywordInput("")
                  setActiveKeyword("")
                  onSearchChange?.("")
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={handleTriggerSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-primary text-on-primary rounded-full text-[11px] font-semibold hover:bg-primary-container transition-all cursor-pointer"
            >
              Tìm
            </button>
          </div>
        </div>

        {/* Products Grid (Reusing ProductCard) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {[1, 2, 3, 4].map((n) => (
              <Card
                key={n}
                className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-square rounded-2xl" />
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
          <div className="py-16 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
            <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
            <h3 className="font-heading font-semibold text-base text-on-surface">
              Không tìm thấy bộ kit phù hợp
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              Không có kết quả nào cho từ khóa "{activeKeyword}". Hãy thử tìm kiếm với tên cây hoặc hạt giống khác!
            </p>
            <Button
              onClick={() => {
                setKeywordInput("")
                setActiveKeyword("")
                onSearchChange?.("")
              }}
              className="rounded-full bg-primary text-on-primary text-xs font-semibold px-5 py-2 mt-2 cursor-pointer"
            >
              Xem tất cả bộ kit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
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
    </div>
  )
}
