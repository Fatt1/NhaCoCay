import React, { useEffect, useState } from "react"
import type { Product, DiaryPost } from "@/types"
import { getProductById, getProducts, getPosts } from "@/services"
import { useCartStore, useAuthStore } from "@/stores"
import { ProductCard } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { navigateTo } from "@/lib/navigation"

interface ProductDetailPageProps {
  productId: string
  onBack: () => void
  onSelectProduct: (product: Product) => void
  onNotify?: (message: string, icon?: string) => void
  onOpenCart?: () => void
  onGoToCommunity?: () => void
  onGoToKits?: () => void
  onGoToCheckout?: () => void
}

const getInitial = (name: string): string => {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words[words.length - 1].charAt(0).toUpperCase()
}

const getAvatarBgClass = (name: string): string => {
  const colors = [
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-teal-100 text-teal-800",
    "bg-sky-100 text-sky-800",
    "bg-rose-100 text-rose-800",
    "bg-indigo-100 text-indigo-800",
  ]
  let hash = 0
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const formatTimeAgo = (dateStr: string): string => {
  try {
    const now = Date.now()
    const diff = now - new Date(dateStr).getTime()
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 1) return "Vừa xong"
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    return `${days} ngày trước`
  } catch {
    return "Gần đây"
  }
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onSelectProduct,
  onNotify,
  onGoToCommunity,
  onGoToKits,
  onGoToCheckout,
}) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [relatedPosts, setRelatedPosts] = useState<DiaryPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  const { addItem } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    window.scrollTo({ top: 0, behavior: "smooth" })

    // Fetch product details
    getProductById(productId)
      .then((data) => {
        if (!isMounted) return
        setProduct(data)
        setLoading(false)
        setSelectedImageIndex(0)
        setQuantity(1)
      })
      .catch((err) => {
        console.error("Error fetching product:", err)
        if (isMounted) setLoading(false)
      })

    // Fetch suggested products (up to 4 products from database, excluding current)
    getProducts()
      .then((all) => {
        if (!isMounted) return
        const others = all.filter((p) => p.id !== productId).slice(0, 4)
        setSuggestedProducts(others)
      })
      .catch(() => {
        if (isMounted) setSuggestedProducts([])
      })

    // Fetch community posts for this plant
    setLoadingPosts(true)
    getPosts()
      .then((allPosts) => {
        if (!isMounted) return
        // Find posts related to this product/plant
        setRelatedPosts(allPosts)
        setLoadingPosts(false)
      })
      .catch(() => {
        if (isMounted) {
          setRelatedPosts([])
          setLoadingPosts(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [productId])

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "đ"
  }

  const handleAddToCart = () => {
    if (!product) return
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "lock")
      return
    }
    const maxStock = product.stockQuantity || 1
    const finalQty = Math.min(quantity, maxStock)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      imageUrl: product.coverImage,
      quantity: finalQty,
    })
    onNotify?.(`Đã thêm ${finalQty} "${product.name}" vào giỏ hàng! 🌱`, "shopping_bag")
  }

  const handleBuyNow = () => {
    if (!product) return
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để mua hàng!", "lock")
      return
    }
    const maxStock = product.stockQuantity || 1
    const finalQty = Math.min(quantity, maxStock)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      imageUrl: product.coverImage,
      quantity: finalQty,
    })
    if (onGoToCheckout) {
      onGoToCheckout()
    } else {
      navigateTo("/checkout")
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-center flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-6xl text-outline">search_off</span>
        <h2 className="text-2xl font-heading font-bold text-on-surface">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-on-surface-variant max-w-md">
          Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng cung cấp.
        </p>
        <Button onClick={onBack} className="rounded-full bg-primary text-on-primary text-xs font-semibold px-6 py-2.5">
          Quay lại cửa hàng
        </Button>
      </div>
    )
  }

  const imagesList =
    product.images && product.images.length > 0 ? product.images : [product.coverImage]

  const discountPercent =
    product.originalPrice > product.salePrice
      ? Math.round((1 - product.salePrice / product.originalPrice) * 100)
      : 0

  return (
    <div className="bg-surface min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 flex flex-col gap-8 sm:gap-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-on-surface-variant font-medium select-none">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Trang Chủ</span>
          </button>
          <span>&gt;</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Bộ Kit Trồng Cây
          </button>
          <span>&gt;</span>
          <span className="text-on-surface font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Top Product Showcase (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-3.5 sm:gap-4">
            <div className="w-full aspect-[4/3] sm:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 bg-surface-container-low relative select-none">
              <img
                src={imagesList[selectedImageIndex] || product.coverImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnail Navigation Row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative size-16 sm:size-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-outline-variant/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Ảnh ${idx + 1}`} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Pricing, Actions */}
          <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <h1 className="font-heading text-xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-surface-container-low/70 rounded-2xl p-3.5 sm:p-5 flex flex-wrap items-baseline gap-3 sm:gap-4 border border-outline-variant/20">
              <span className="font-bold text-2xl sm:text-3xl text-primary font-heading">
                {formatCurrency(product.salePrice)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-xs sm:text-base text-outline line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <Badge className="bg-[#1b4332] text-white text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold border-none shadow-none">
                    Tiết kiệm {discountPercent}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Quantity Status */}
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="font-medium text-on-surface-variant">Tình trạng kho:</span>
              {product.stockQuantity > 0 ? (
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Còn {product.stockQuantity} sản phẩm
                </span>
              ) : (
                <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Tạm hết hàng
                </span>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                {/* Counter */}
                <div className="flex items-center justify-between sm:justify-start bg-surface-container-low rounded-2xl border border-outline-variant/30 p-1 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="size-10 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-on-surface">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 1, q + 1))}
                    disabled={quantity >= (product.stockQuantity || 1)}
                    className="size-10 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  {/* Add To Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity <= 0}
                    className="flex-1 bg-[#183d2c] hover:bg-[#112d20] text-white font-semibold py-3 sm:py-4 px-3 sm:px-6 rounded-2xl h-auto flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm text-xs sm:text-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">shopping_cart</span>
                    <span>Thêm Vào Giỏ</span>
                  </Button>

                  {/* Buy Now Button */}
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stockQuantity <= 0}
                    className="bg-[#c3eed7] hover:bg-[#b0e2c8] text-[#134931] font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl h-auto transition-all cursor-pointer shadow-none text-xs sm:text-sm disabled:opacity-50 shrink-0"
                  >
                    Mua Ngay
                  </Button>
                </div>
              </div>

              {quantity >= product.stockQuantity && product.stockQuantity > 0 && (
                <p className="text-[11px] text-amber-600 font-medium">
                  * Bạn đã chọn số lượng tối đa hiện có trong kho ({product.stockQuantity} sản phẩm).
                </p>
              )}
            </div>

            {/* Quick Specs / Benefits */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-outline-variant/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-on-surface-variant">Tỷ lệ nảy mầm</span>
                <span className="text-xs font-bold text-on-surface">
                  {product.specifications?.germinationRate?.value || "> 95%"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-on-surface-variant">Thời gian nảy mầm</span>
                <span className="text-xs font-bold text-on-surface">
                  {product.specifications?.germinationTime?.value || "5-7 ngày"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-on-surface-variant">Thời gian ra hoa</span>
                <span className="text-xs font-bold text-on-surface">
                  {product.specifications?.floweringTime?.value || "35-45 ngày"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-on-surface-variant">Lưu ý cho cây</span>
                <span className="text-xs font-bold text-on-surface">
                  {product.specifications?.plantCareNotes?.value || "Tưới gốc"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section 1: Product Description */}
        <div className="bg-[#edf7f1] rounded-3xl p-6 sm:p-8 border border-[#d6ede0]">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-bold text-base sm:text-lg">
              <span className="material-symbols-outlined text-[24px]">description</span>
              <span>Mô Tả Chi Tiết Sản Phẩm</span>
            </div>
            {product.description ? (
              <div
                className="font-body text-sm text-on-surface leading-relaxed [&>h3]:font-bold [&>h3]:text-base [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-2"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-xs text-on-surface-variant">Chưa có mô tả chi tiết cho sản phẩm này.</p>
            )}
          </div>
        </div>

        {/* Middle Section 2: Thành Phần Bộ Kit (Lấy từ type Product) */}
        <div className="flex flex-col gap-4">
          <div className="inline-block self-start">
            <span className="bg-surface-container-high text-on-surface font-semibold text-xs px-4 py-1.5 rounded-full inline-block">
              Thành Phần Bộ Kit
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/20">
            {product.kitComponents && product.kitComponents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {product.kitComponents.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 border-l-2 border-primary/30 pl-3">
                    <h4 className="font-bold text-sm text-on-surface leading-tight">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">Không có thông tin thành phần bộ kit.</p>
            )}
          </div>
        </div>

        {/* Middle Section 3: Community Posts List (Nếu không có thì ghi không có) */}
        <div className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-primary uppercase tracking-wider font-semibold block">
                CỘNG ĐỒNG NHÀ CÓ CÂY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Cùng Trồng {product.name} Với Cộng Đồng
              </h2>
            </div>
            {onGoToCommunity && (
              <button
                type="button"
                onClick={onGoToCommunity}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold transition-colors cursor-pointer shrink-0"
              >
                <span>Xem tất cả thảo luận</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>

          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-44 w-full rounded-2xl" />
              ))}
            </div>
          ) : relatedPosts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-outline">forum</span>
              <p className="text-xs text-on-surface-variant">
                Không có bài viết nào cho sản phẩm này. Hãy chia sẻ câu chuyện đầu tiên!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((post) => (
                <Card
                  key={post.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between"
                >
                  <CardContent className="p-0 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback
                          className={`text-xs font-bold ${getAvatarBgClass(post.authorName)}`}
                        >
                          {getInitial(post.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-on-surface">
                          {post.authorName}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-on-surface line-clamp-2 leading-snug">
                      "{post.title}"
                    </h4>

                    <div
                      className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed [&>h1]:font-bold [&>h2]:font-semibold [&>p]:inline"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="flex items-center gap-4 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-error">favorite</span>
                        <span>{post.likesCount} thích</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                        <span>{post.commentsCount} bình luận</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Gợi Ý Thêm (Tối đa 4 sản phẩm, không bịa dữ liệu) */}
        <div className="flex flex-col gap-6 pt-6 border-t border-outline-variant/20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-primary uppercase tracking-wider font-semibold block">
                GỢI Ý THÊM
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Các Bộ Kit Trồng Khác Bạn Sẽ Thích
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToKits || onBack}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold transition-colors cursor-pointer shrink-0"
            >
              <span>Xem tất cả bộ kit</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {suggestedProducts.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-4">Không có sản phẩm gợi ý nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {suggestedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(prod) => {
                    if (!user) {
                      onNotify?.("Vui lòng đăng nhập để thêm vào giỏ hàng!", "lock")
                      return
                    }
                    addItem({
                      productId: prod.id,
                      name: prod.name,
                      price: prod.salePrice,
                      imageUrl: prod.coverImage,
                      quantity: 1,
                    })
                    onNotify?.(`Đã thêm "${prod.name}" vào giỏ hàng! 🌱`, "shopping_bag")
                  }}
                  onSelectProduct={(prod) => onSelectProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
