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
                  Đầy Đủ Cho Hành Trình Gieo Trồng
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Mỗi bộ kit được chuẩn bị sẵn hạt giống, viên nén xơ dừa, chậu trồng và hướng dẫn gieo hạt chi tiết. Tất cả những gì bạn cần để bắt đầu khu vườn nhỏ đều được gói gọn trong một bộ kit tiện lợi.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  <span>Dễ dàng bắt đầu tại nhà</span>
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
                  Đồng Hành Cùng Từng Mầm Xanh
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Từ lúc gieo hạt đến khi cây lớn lên và nở hoa, bạn có thể theo dõi từng giai đoạn phát triển và tham khảo hướng dẫn chăm sóc phù hợp. Dù chưa có kinh nghiệm làm vườn, bạn vẫn có thể tự tay vun trồng những bông hoa đầu tiên.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  <span>Từng bước chăm hoa thật dễ dàng</span>
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
                  Khám Phá Khu Vườn Theo Cách Riêng
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Từ hoa Sao Nhái dịu dàng, Cát Tường duyên dáng đến Hướng Dương rực rỡ, Nhà Có Cây mang đến nhiều lựa chọn để bạn tìm thấy giống hoa yêu thích. Tự tay gieo trồng, kiên nhẫn chăm sóc và biến góc nhỏ của mình thành một khu vườn đầy màu sắc
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Separator />
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  <span>Gieo sắc hoa, tô điểm không gian sống</span>
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
