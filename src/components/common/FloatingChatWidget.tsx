import React, { useState, useEffect, useRef } from "react"

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">
      {/* Popup / Card phía trên */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-outline-variant/30 shadow-2xl p-4 sm:p-5 flex flex-col gap-3.5 origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-heading font-bold text-sm text-on-surface">Nhà Có Cây</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-on-surface-variant font-body">Trực tuyến hỗ trợ 24/7</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Đóng bảng chat"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Kết nối và trò chuyện nhanh cùng Nhà Có Cây qua các kênh chính thức:
          </p>

          {/* Links list */}
          <div className="flex flex-col gap-2">
            {/* Facebook Link */}
            <a
              href="https://www.facebook.com/profile.php?id=61595312774033"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm group border border-outline-variant/20 hover:border-primary/20 bg-surface-container-low/40"
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="w-8 h-8 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <span className="flex flex-col text-left">
                  <span className="text-on-surface font-semibold text-xs group-hover:text-primary transition-colors">
                    Fanpage Facebook
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Nhắn tin Messenger</span>
                </span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                arrow_outward
              </span>
            </a>

            {/* Instagram Link */}
            <a
              href="https://www.instagram.com/nhacocay.blog/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm group border border-outline-variant/20 hover:border-primary/20 bg-surface-container-low/40"
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FD1D1D]/10 to-[#E1306C]/10 text-[#E1306C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </span>
                <span className="flex flex-col text-left">
                  <span className="text-on-surface font-semibold text-xs group-hover:text-primary transition-colors">
                    Fanpage Instagram
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Xem ảnh & tin nhắn</span>
                </span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                arrow_outward
              </span>
            </a>
          </div>

          <div className="pt-1 border-t border-outline-variant/10 text-center">
            <span className="text-[10px] text-on-surface-variant">
              Phản hồi thường trong vòng vài phút 🌱
            </span>
          </div>
        </div>
      )}

      {/* Nút tròn chat nổi (Floating circular chat button) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-primary text-on-primary shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        aria-label="Tư vấn và trò chuyện cùng Nhà Có Cây"
      >
        {/* Pulse ring animation khi đóng */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping -z-10 pointer-events-none opacity-60" />
        )}

        {/* Online status indicator */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />

        {/* Dynamic Icon */}
        <span
          className={`material-symbols-outlined text-[26px] transition-transform duration-300 ${
            isOpen ? "rotate-90 scale-90" : "group-hover:scale-110"
          }`}
        >
          {isOpen ? "close" : "chat"}
        </span>
      </button>
    </div>
  )
}
