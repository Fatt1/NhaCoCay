import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      text: `"Đóng gói siêu kỹ lưỡng và chỉn chu. Chậu gốm Bát Tràng cầm chắc tay, men mộc rất mộc mạc đúng gu mình. Hạt cà chua bi nảy mầm sau đúng 4 ngày!"`,
      name: "Thảo Vy",
      role: "Kiến trúc sư nội thất, Hà Nội",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    },
    {
      text: `"Trước giờ trồng cây gì cũng bị héo, nhờ app nhật ký nhắc lịch tưới chuẩn giờ mà cây sen đá của mình lớn xanh mướt. Rất đáng đồng tiền!"`,
      name: "Hoàng Nam",
      role: "Lập trình viên, TP.HCM",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
    {
      text: `"Thích nhất là thẻ hướng dẫn kèm túi giá thể sinh học không có mùi hôi. Cả nhà mình cùng gieo hạt húng quế vào ngày cuối tuần rất thư thái."`,
      name: "Gia đình chị Mai",
      role: "Đà Nẵng",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    },
  ]

  return (
    <section className="py-20 bg-surface-container-low border-t border-outline-variant/30" id="about-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
          <span className="text-xs text-primary uppercase tracking-wider font-semibold block">
            Cảm Nhận Từ Trái Tim
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            Người Gieo Mầm Chia Sẻ
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            Cảm xúc chân thật từ những người bạn đã tự tay chăm dưỡng chậu cây đầu tiên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <Card
              key={i}
              className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col justify-between border border-outline-variant/30 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0 flex flex-col justify-between h-full gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center text-primary">
                    {[...Array(5)].map((_, s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="font-body text-sm text-on-surface-variant italic leading-relaxed">
                    {r.text}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 ring-2 ring-primary/10">
                      <AvatarImage src={r.avatar} alt={r.name} />
                      <AvatarFallback>{r.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-sm text-on-surface">{r.name}</h4>
                      <span className="text-xs text-on-surface-variant">{r.role}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
