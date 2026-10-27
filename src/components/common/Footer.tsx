import React, { useState } from "react"

interface FooterProps {
  onNotify?: (message: string, icon?: string) => void
}

export const Footer: React.FC<FooterProps> = ({ onNotify }) => {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      onNotify?.("Vui lòng nhập địa chỉ email của bạn!", "warning")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      onNotify?.("Địa chỉ email không hợp lệ, vui lòng kiểm tra lại!", "error")
      return
    }

    onNotify?.("Bạn đã gửi thành công!", "check_circle")
    setEmail("")
  }

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
            Nhà Có Cây mang đến những bộ kit gieo hạt tiện lợi, giúp bạn dễ dàng bắt đầu hành trình trồng cây ngay tại nhà. Với mong muốn đưa thiên nhiên đến gần hơn với cuộc sống, Nhà Có Cây hy vọng mỗi hạt giống được gieo trồng sẽ mang đến niềm vui, sự bình yên và góp phần lan tỏa lối sống xanh.
          </p>

        </div>

        {/* Explore Links */}
        <div className="space-y-3">
          <h4 className="text-sm uppercase tracking-wider font-bold text-on-surface">Khám Phá</h4>
          <ul className="space-y-2.5 text-sm text-on-surface-variant">
            <li><a href="/kits" className="hover:text-primary transition-colors">Bộ Kit Trồng Cây</a></li>
            <li><a href="/forum" className="hover:text-primary transition-colors">Diễn Đàn Nhà Có Cây</a></li>
            <li><a href="/journal" className="hover:text-primary transition-colors">Nhật Ký Cây</a></li>
            <li><a href="/about" className="hover:text-primary transition-colors">Về Chúng Tôi</a></li>
          </ul>
        </div>

        {/* Operating Hours & Contact */}
        <div className="space-y-3">
          <h4 className="text-sm uppercase tracking-wider font-bold text-on-surface">Giờ hoạt động</h4>
          <ul className="space-y-2.5 text-sm text-on-surface-variant">
            <li><span>Sáng: 8:00 - 12:00</span></li>
            <li><span>Chiều: 13:30 - 21:00</span></li>
            <li><a href="tel:0902965739" className="hover:text-primary transition-colors">SĐT: 090.296.57.39</a></li>
            <li><a href="https://www.google.com/maps/place/162+Nguy%E1%BB%85n+Th%E1%BB%8B+Nh%E1%BB%8F,+Ph%C3%BA+Th%E1%BB%8D,+H%E1%BB%93+Ch%C3%AD+Minh+70000,+Vi%E1%BB%87t+Nam/@10.7745001,106.6506433,17z/data=!3m1!4b1!4m6!3m5!1s0x31752ec0a4662df9:0x75779a6bb9ffcf2a!8m2!3d10.7745001!4d106.6532182!16s%2Fg%2F11y30xnd1c?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Địa chỉ: 162 Nguyễn Thị Nhỏ, Phường Phú Thọ, TP. Hồ Chí Minh</a></li>
          </ul>
        </div>


        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-sm uppercase tracking-wider font-bold text-on-surface">Bản Tin Mầm Xanh</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Nhận thông tin sản phẩm và ưu đãi mới nhất từ Nhà Có Cây
          </p>
          <form className="space-y-2" onSubmit={handleSubmit}>
            <div className="flex rounded-full bg-surface-container-lowest p-1 shadow-sm border border-outline-variant/30">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="w-full px-4 py-2 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
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
        <p>© 2026 Nhà Có Cây.</p>
        {/* <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-primary transition-colors">Vận chuyển bền vững</a>
        </div> */}
      </div>
    </footer>
  )
}
