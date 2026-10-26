import React from "react"

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#edf3ee] border-t border-outline-variant/30 pt-10 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Mission */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">eco</span>
            </div>
            <span className="font-heading font-bold text-lg text-primary">Nhà Có Cây</span>
          </div>
          <p className="font-body text-sm text-on-surface-variant max-w-sm leading-relaxed">
            Kiến tạo không gian xanh an lành trong từng tổ ấm đô thị. Tự tay gieo mầm, chăm dưỡng thiên nhiên và tìm lại sự tĩnh tại mỗi ngày.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-outline-variant/30"
              aria-label="Eco"
            >
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-outline-variant/30"
              aria-label="Forum"
            >
              <span className="material-symbols-outlined text-[20px]">forum</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm border border-outline-variant/30"
              aria-label="Community"
            >
              <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-on-surface">Khám Phá</h4>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><a href="#shop-section" className="hover:text-primary transition-colors">Bộ Kit Trồng Cây</a></li>
            <li><a href="#shop-section" className="hover:text-primary transition-colors">Hạt Giống Hữu Cơ</a></li>
            <li><a href="#shop-section" className="hover:text-primary transition-colors">Đất & Phân Sinh Học</a></li>
            <li><a href="#shop-section" className="hover:text-primary transition-colors">Chậu Gốm Thủ Công</a></li>
          </ul>
        </div>

        {/* Community Links */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-on-surface">Cộng Đồng</h4>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><a href="#community-section" className="hover:text-primary transition-colors">Diễn Đàn Yêu Cây</a></li>
            <li><a href="#journal-section" className="hover:text-primary transition-colors">Nhật Ký Sinh Trưởng</a></li>
            <li><a href="#community-section" className="hover:text-primary transition-colors">Cẩm Nang Chăm Sóc</a></li>
            <li><a href="#about-section" className="hover:text-primary transition-colors">Về Chúng Tôi</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-on-surface">Bản Tin Mầm Xanh</h4>
          <p className="text-xs text-on-surface-variant">
            Nhận bài viết dưỡng cây hàng tuần và ưu đãi xanh sớm nhất.
          </p>
          <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
            <div className="flex rounded-full bg-surface-container-lowest p-1 shadow-sm border border-outline-variant/30">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="w-full px-4 py-2 bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Gửi email"
                className="rounded-full bg-primary px-4 py-2 text-on-primary hover:bg-primary-container transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 pt-6 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
        <p>© 2026 Nhà Có Cây. Gieo mầm hạnh phúc, gìn giữ màu xanh.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-primary transition-colors">Vận chuyển bền vững</a>
        </div>
      </div>
    </footer>
  )
}
