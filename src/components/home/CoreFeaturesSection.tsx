import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const CoreFeaturesSection: React.FC = () => {
  return (
    <section className="bg-surface-container-low relative border-y border-outline-variant/30 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <span className="text-xs text-primary uppercase tracking-wider font-semibold block">
            Quy trình thông minh & bền vững
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            Mọi thứ bạn cần cho góc xanh
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            Không cần kinh nghiệm làm vườn trước đó. Bộ kit được thiết kế trọn gói từ hạt giống đến công cụ thông minh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-outline-variant/30">
            <CardContent className="p-0 flex flex-col justify-between h-full gap-6">
              <div className="flex flex-col gap-4">
                <div className="size-14 rounded-2xl bg-secondary-container text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">inventory_2</span>
                </div>
                <h3 className="font-heading font-semibold text-xl text-on-surface">
                  Trọn Gói & Chuẩn Bị Tỉ Mỉ
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Chậu gốm mộc nung xốp thoáng khí, giá thể phối trộn chuyên sâu cho từng loài cây cùng hạt giống F1 tỉ lệ nảy mầm kiểm định vượt 95%.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  <span>Nguyên liệu 100% hữu cơ</span>
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-outline-variant/30">
            <CardContent className="p-0 flex flex-col justify-between h-full gap-6">
              <div className="flex flex-col gap-4">
                <div className="size-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">calendar_clock</span>
                </div>
                <h3 className="font-heading font-semibold text-xl text-on-surface">
                  Nhật Ký & Nhắc Lịch Thông Minh
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Không còn lo lắng việc quên tưới nước hay phơi nắng. Nhật ký tự động gợi ý lịch trình chăm sóc qua từng chu kỳ sinh trưởng của cây.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  <span>Đồng bộ thông báo tức thì</span>
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-outline-variant/30">
            <CardContent className="p-0 flex flex-col justify-between h-full gap-6">
              <div className="flex flex-col gap-4">
                <div className="size-14 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">diversity_3</span>
                </div>
                <h3 className="font-heading font-semibold text-xl text-on-surface">
                  Diễn Đàn Kết Nối Sôi Động
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Hơn 20.000 người yêu cây sẵn sàng sẻ chia kinh nghiệm. Bác sĩ cây cảnh đồng hành giải đáp bệnh lá, bắt sâu và tư vấn dinh dưỡng 24/7.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  <span>Chuyên gia phản hồi trong 15p</span>
                  <span className="material-symbols-outlined text-[16px]">medical_services</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
