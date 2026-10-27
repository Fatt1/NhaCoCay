import React, { useEffect, useRef } from "react"
import { navigateTo } from "@/lib/navigation"

interface AboutPageProps {
  onNavigateTab?: (tab: "home" | "kits" | "forum" | "journal" | "about") => void
  onExploreKits?: () => void
}

const CORE_VALUES = [
  {
    num: "01",
    icon: "forest",
    title: "Gần gũi với thiên nhiên",
    desc: "Đưa thiên nhiên đến gần hơn với cuộc sống, góp phần hình thành thói quen sống xanh.",
    isWide: false,
  },
  {
    num: "02",
    icon: "inventory_2",
    title: "Đơn giản và tiện lợi",
    desc: "Hướng đến những giải pháp thiết thực, dễ tiếp cận, giúp khách hàng dễ dàng bắt đầu hành trình sống xanh.",
    isWide: false,
  },
  {
    num: "03",
    icon: "diversity_3",
    title: "Kết nối và sẻ chia",
    desc: "Khuyến khích sự chia sẻ kiến thức, kinh nghiệm và những giá trị tích cực xoay quanh lối sống xanh.",
    isWide: false,
  },
  {
    num: "04",
    icon: "verified_user",
    title: "Trách nhiệm và tận tâm",
    desc: "Đề cao trách nhiệm trong hoạt động kinh doanh, chú trọng chất lượng, sự tận tâm với khách hàng và không ngừng cải thiện.",
    isWide: false,
  },
  {
    num: "05",
    icon: "compost",
    title: "Phát triển bền vững",
    desc: "Hướng đến sự phát triển ổn định, lâu dài của doanh nghiệp gắn với ý thức bảo vệ môi trường.",
    isWide: true,
  },
]

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateTab,
  onExploreKits,
}) => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = pageRef.current
    if (!root) return

    if (typeof IntersectionObserver === "undefined") {
      root.querySelectorAll(".reveal-on-scroll, .reveal-scale").forEach((el) => {
        el.classList.add("is-revealed")
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed")
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    )

    const elements = root.querySelectorAll(".reveal-on-scroll, .reveal-scale")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onNavigateTab) {
      onNavigateTab("home")
    } else {
      navigateTo("/")
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleExploreClick = () => {
    if (onExploreKits) {
      onExploreKits()
    } else if (onNavigateTab) {
      onNavigateTab("kits")
    } else {
      navigateTo("/kits")
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div ref={pageRef} className="flex flex-col w-full min-h-[calc(100vh-5rem)]">
      {/* Subtle organic background decor */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
          {/* 1. Breadcrumb navigation */}
          <nav aria-label="Đường dẫn trang" className="reveal-on-scroll mb-6 sm:mb-8 lg:mb-12">
            <ol className="flex items-center gap-2 text-xs sm:text-sm font-medium text-on-surface-variant">
              <li>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  <span>Trang Chủ</span>
                </button>
              </li>
              <li className="flex items-center text-outline-variant">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </li>
              <li aria-current="page" className="font-bold text-primary">
                Về Chúng Tôi
              </li>
            </ol>
          </nav>

          {/* 2. Khối Hero Giới Thiệu Thương Hiệu */}
          <section className="reveal-on-scroll flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-20 lg:mb-28 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/70 text-on-secondary-container text-xs font-semibold uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-[16px]">potted_plant</span>
              <span>CÂU CHUYỆN THƯƠNG HIỆU</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[44px] font-extrabold font-heading text-primary tracking-tight leading-tight">
              Về “Nhà Có Cây”
            </h1>

            <div className="relative px-2 sm:px-6 py-1 sm:py-2">
              <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant leading-relaxed text-center font-body">
                Nhà Có Cây tin rằng niềm vui đôi khi bắt đầu từ những điều thật nhỏ bé — một hạt giống được gieo xuống,
                một mầm xanh vừa nhú lên hay một bông hoa đầu tiên khoe sắc. Thông qua những bộ kit gieo hạt tiện lợi
                và cộng đồng những người yêu cây, Nhà Có Cây mong muốn giúp việc gieo trồng trở nên đơn giản, dễ dàng hơn,
                để ai cũng có thể tự tay vun trồng một góc xanh của riêng mình và tìm thấy niềm vui, sự bình yên từ thiên nhiên.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-low text-primary text-xs sm:text-sm font-semibold border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-secondary">spa</span>
                <span>Mộc mạc &amp; Thuần tự nhiên</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-low text-primary text-xs sm:text-sm font-semibold border border-outline-variant/20 shadow-xs">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-secondary">energy_savings_leaf</span>
                <span>Lối sống xanh chữa lành</span>
              </div>
            </div>
          </section>

          {/* 3. Khối Tầm Nhìn & Sứ Mệnh (Grid 2 cột thanh lịch) */}
          <section className="mb-14 sm:mb-20 lg:mb-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              {/* Cột 1: TẦM NHÌN */}
              <div
                className="reveal-on-scroll group relative p-5 sm:p-8 lg:p-10 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-outline-variant/30"
                style={{ transitionDelay: "80ms" }}
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-secondary-container/30 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-500" />
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-6 shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">visibility</span>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-secondary font-semibold block mb-2">
                    Định Hướng Tương Lai
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-primary mb-3 sm:mb-4 tracking-tight">
                    TẦM NHÌN
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant leading-relaxed font-body">
                    Trở thành thương hiệu bộ kit trồng cây tại nhà được yêu thích hàng đầu Việt Nam, giúp mọi người gần gũi với thiên nhiên và lan tỏa lối sống xanh.
                  </p>
                </div>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 flex items-center gap-2 text-primary text-xs font-semibold">
                  <span className="w-10 h-[2.5px] bg-primary rounded-full" />
                </div>
              </div>

              {/* Cột 2: SỨ MỆNH */}
              <div
                className="reveal-on-scroll group relative p-5 sm:p-8 lg:p-10 rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden bg-[#14422d] border border-[#1e543b]"
                style={{ transitionDelay: "220ms" }}
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-500" />
                <div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-emerald-200 mb-6 bg-emerald-800/60 shadow-xs">
                    <span className="material-symbols-outlined text-[28px]">handshake</span>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold block mb-2">
                    Trách Nhiệm &amp; Hành Động
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-white mb-3 sm:mb-4 tracking-tight">
                    SỨ MỆNH
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-emerald-50/90 leading-relaxed font-body">
                    Mang đến những bộ kit gieo hạt tiện lợi, giúp mọi người dễ dàng bắt đầu trồng và chăm sóc cây xanh tại nhà.
                  </p>
                </div>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                  <span className="w-10 h-[2.5px] bg-secondary-container rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* 4. Khối Giá Trị Cốt Lõi (Đúng 5 giá trị) */}
          <section className="mb-20 lg:mb-28">
            <div className="reveal-on-scroll text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>Nguyên tắc vững chắc</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-primary tracking-tight">
                5 Giá Trị Cốt Lõi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CORE_VALUES.map((item, idx) => (
                <div
                  key={item.num}
                  style={{ transitionDelay: `${(idx % 3) * 120 + 80}ms` }}
                  className={`reveal-on-scroll p-6 lg:p-7 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative group border border-outline-variant/30 ${item.isWide ? "md:col-span-2 lg:col-span-2" : ""
                    }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl lg:text-3xl font-black text-secondary/30 group-hover:text-primary transition-colors font-display">
                      {item.num}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${item.num === "05"
                        ? "bg-secondary-container text-primary"
                        : "bg-surface-container-low text-primary group-hover:bg-primary/10"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-primary mb-2.5">
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm text-on-surface-variant leading-relaxed font-body ${item.isWide ? "max-w-xl" : ""
                      }`}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Khối Thông Tin Liên Hệ */}
          <section className="mb-12 sm:mb-16">
            <div className="rounded-2xl sm:rounded-3xl bg-surface-container-low p-5 sm:p-8 lg:p-12 shadow-sm border border-outline-variant/30">
              <div className="reveal-on-scroll max-w-3xl mb-8 sm:mb-10">
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold block mb-2">
                  Đồng Hành Cùng Chúng Tôi
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading text-primary tracking-tight mb-2 sm:mb-3">
                  Thông Tin Liên Hệ
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant font-body">
                  Chúng tôi luôn sẵn sàng lắng nghe, tư vấn và đồng hành cùng bạn trên từng chặng đường gieo mầm xanh.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Điện thoại */}
                <div
                  className="reveal-on-scroll p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow"
                  style={{ transitionDelay: "80ms" }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/60 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">phone</span>
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Hotline hỗ trợ
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-primary mb-1 tracking-tight">
                      090.296.57.39
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      Hỗ trợ tư vấn chăm sóc cây và đặt hàng
                    </p>
                  </div>
                  <a
                    href="tel:0902965739"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    <span>Gọi ngay</span>
                  </a>
                </div>

                {/* Địa chỉ + Bản đồ */}
                <div
                  className="reveal-on-scroll p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow"
                  style={{ transitionDelay: "180ms" }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/60 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Địa chỉ vườn mầm
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-on-surface mb-1">
                      162 Nguyễn Thị Nhỏ, Phường Phú Thọ, TP. Hồ Chí Minh
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      Mở cửa đón bạn ghé thăm mỗi ngày
                    </p>
                  </div>
                  <a
                    href="https://www.google.com/maps/place/162+Nguy%E1%BB%85n+Th%E1%BB%8B+Nh%E1%BB%8F,+Ph%C3%BA+Th%E1%BB%8D,+H%E1%BB%93+Ch%C3%AD+Minh+70000,+Vi%E1%BB%87t+Nam/@10.7745001,106.6506433,17z/data=!3m1!4b1!4m6!3m5!1s0x31752ec0a4662df9:0x75779a6bb9ffcf2a!8m2!3d10.7745001!4d106.6532182!16s%2Fg%2F11y30xnd1c?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors text-xs sm:text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    <span>Xem trên Google Maps</span>
                  </a>
                </div>

                {/* Kênh Mạng Xã Hội */}
                <div
                  className="reveal-on-scroll p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow"
                  style={{ transitionDelay: "280ms" }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/60 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Kênh Trực Tuyến
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant mb-4">
                      Kết nối cộng đồng gieo mầm xanh cùng Nhà Có Cây:
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://www.facebook.com/profile.php?id=61595312774033"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[18px] text-primary">public</span>
                          <span>Fanpage Facebook</span>
                        </span>
                        <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                      </a>
                      <a
                        href="https://www.instagram.com/nhacocay.blog/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[18px] text-primary">photo_camera</span>
                          <span>Fanpage Instagram</span>
                        </span>
                        <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                      </a>
                      <a
                        href="https://www.facebook.com/groups/1605664581590325"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                          <span>Group Nhà Có Cây</span>
                        </span>
                        <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action CTA: Khám phá sản phẩm */}
          <section className="reveal-scale mb-8 text-center bg-gradient-to-r from-emerald-900 to-[#14422d] text-white p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                Gieo Mầm Cùng Chúng Tôi
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading">
                Bạn Đã Sẵn Sàng Vun Trồng Góc Xanh Của Mình?
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-emerald-100/90 font-body">
                Khám phá ngay các bộ kit trồng cây tiện lợi và thân thiện môi trường từ Nhà Có Cây
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExploreClick}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#14422d] font-bold text-sm hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  <span>Khám phá bộ kit trồng cây</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
