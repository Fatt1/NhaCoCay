import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { navigateTo } from "@/lib/navigation"
import hinh1 from "@/assets/hinh1.jpg"
import hinh2 from "@/assets/hinh2.jpg"
import hinh3 from "@/assets/hinh3.jpg"

const HERO_IMAGES = [
  {
    url: hinh1,
    alt: "Bộ kit gieo trồng tiện lợi và mầm xanh Nhà Có Cây",
  },
  {
    url: hinh2,
    alt: "Chậu cây xanh mộc mạc và bình yên tại nhà",
  },
  {
    url: hinh3,
    alt: "Không gian xanh chữa lành cùng Nhà Có Cây",
  },
]

interface HeroSectionProps {
  onExploreKits?: () => void
  onJoinForum?: () => void
  onNotify?: (message: string, icon?: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreKits,
  onJoinForum,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === 0 ? HERO_IMAGES.length - 1 : prev - 1
    )
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      (prev + 1) % HERO_IMAGES.length
    )
  }

  return (
    <section className="relative overflow-hidden pt-4 sm:pt-6 pb-12 sm:pb-20 md:pb-28">
      {/* Ambient Botanical Backdrops */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#cde8d5]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 size-80 rounded-full bg-[#bceecf]/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center pt-2 md:pt-6">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4 sm:gap-6">
            <Badge
              variant="secondary"
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-secondary-container/80 text-on-secondary-container border border-secondary-container flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-primary">eco</span>
              <span className="text-xs font-semibold text-primary">
                Khởi đầu lối sống xanh bền vững
              </span>
            </Badge>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] font-bold text-on-surface tracking-tight leading-[1.2]">
              Gieo mầm bình yên, mở không gian xanh ngay tại nhà.
            </h1>

            <p className="font-body text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Bắt đầu góc xanh của riêng bạn với bộ kit gieo trồng tiện lợi từ Nhà Có Cây. Mỗi bộ kit được chuẩn bị đầy đủ từ hạt giống, viên nén xơ dừa đến hướng dẫn gieo trồng chi tiết, giúp bạn dễ dàng bắt đầu hành trình làm vườn ngay tại nhà. Tự tay gieo những hạt mầm nhỏ, chăm sóc từng chồi non và chờ đón những bông hoa đầu tiên khoe sắc. Bởi đôi khi, niềm vui giản dị nhất chính là được ngắm nhìn những điều nhỏ bé lớn lên mỗi ngày. 🌱
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  if (onExploreKits) {
                    onExploreKits()
                  } else {
                    navigateTo("/kits")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                }}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-6 rounded-full bg-primary text-on-primary font-semibold text-xs sm:text-sm shadow-xl shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer h-auto"
              >
                <span>Khám phá Kit Trồng Cây</span>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">arrow_forward</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (onJoinForum) {
                    onJoinForum()
                  } else {
                    navigateTo("/forum")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-6 rounded-full bg-secondary-container/60 text-primary border border-primary/20 font-semibold text-xs sm:text-sm hover:bg-secondary-container transition-all flex items-center justify-center gap-2 cursor-pointer h-auto"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">forum</span>
                <span>Tham gia Diễn Đàn</span>
              </Button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-3 border-t border-outline-variant/30 text-on-surface-variant text-xs">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px]">verified</span>
                <span>Trọn bộ kit gieo trồng tiện lợi</span>
              </div>
              <span className="text-outline-variant hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px]">local_shipping</span>
                <span>Giao hàng toàn quốc</span>
              </div>
              <span className="text-outline-variant hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px]">support_agent</span>
                <span>Bác sĩ cây hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pure Visual Image Carousel (3 Images) */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft botanical glow backdrop */}
              <div className="absolute inset-0 bg-primary-fixed/30 rounded-3xl blur-2xl transform scale-95" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-low group/hero-carousel aspect-[4/3] sm:aspect-[5/4] lg:h-[460px] w-full select-none">
                {HERO_IMAGES.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentImageIndex === idx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                      }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="size-full object-cover transition-transform duration-1000 group-hover/hero-carousel:scale-105"
                    />
                  </div>
                ))}

                {/* Left / Right Navigation Controls */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Hình trước"
                  className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 size-8 sm:size-10 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-xs opacity-80 sm:opacity-0 sm:group-hover/hero-carousel:opacity-100 transition-all cursor-pointer shadow-md z-20"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Hình sau"
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 size-8 sm:size-10 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-xs opacity-80 sm:opacity-0 sm:group-hover/hero-carousel:opacity-100 transition-all cursor-pointer shadow-md z-20"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_right</span>
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm z-20">
                  {HERO_IMAGES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      aria-label={`Chuyển đến ảnh ${idx + 1}`}
                      className={`transition-all rounded-full cursor-pointer ${currentImageIndex === idx
                        ? "w-6 h-2 bg-white"
                        : "size-2 bg-white/60 hover:bg-white/90"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
