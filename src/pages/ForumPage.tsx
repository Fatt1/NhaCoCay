import React, { useState, useEffect } from "react"
import { getPosts, deletePost } from "@/services"
import { useAuthStore } from "@/stores"
import type { DiaryPost } from "@/types"
import { PostCard } from "@/components/common"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ForumPageProps {
  onBack: () => void
  onOpenNewPost: () => void
  onEditPost?: (post: DiaryPost) => void
  onNotify?: (message: string, icon?: string) => void
  onOpenAuthModal?: () => void
  postsVersion?: number
  onRefreshPosts?: () => void
}

const getInitial = (name: string): string => {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words[words.length - 1].charAt(0).toUpperCase()
}

export const ForumPage: React.FC<ForumPageProps> = ({
  onBack,
  onOpenNewPost,
  onEditPost,
  onNotify,
  onOpenAuthModal,
  postsVersion = 0,
  onRefreshPosts,
}) => {
  const [posts, setPosts] = useState<DiaryPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFeedTab, setActiveFeedTab] = useState<"all" | "my_posts">("all")
  const { user } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getPosts()
      .then((data) => {
        if (isMounted) {
          setPosts(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error("Error fetching forum posts:", err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [postsVersion])

  const handleQuickPostClick = () => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để đăng bài viết!", "lock")
      onOpenAuthModal?.()
      return
    }
    onOpenNewPost()
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      onNotify?.("Đã xóa bài viết thành công!", "delete")
      onRefreshPosts?.()
    } catch (err) {
      console.error("Error deleting post:", err)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      onNotify?.("Đã xóa bài viết!", "delete")
      onRefreshPosts?.()
    }
  }

  const myPosts = posts.filter(
    (p) =>
      user &&
      (p.userId === user.uid ||
        p.authorName === user.fullName ||
        (user.email && p.authorName.toLowerCase().includes(user.email.split("@")[0].toLowerCase())))
  )

  const displayedPosts = activeFeedTab === "my_posts" ? myPosts : posts

  return (
    <div className="bg-surface min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
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
          <span className="text-on-surface font-semibold">Diễn Đàn Cộng Đồng</span>
        </nav>

        {/* Forum Header Banner (matching Image 1) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-2">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-block self-start">
              <span className="px-3.5 py-1 rounded-full bg-[#1b4332]/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                🌱 CỘNG ĐỒNG NHÀ CÓ CÂY • HƠN 35.000 NÔNG DÂN ĐÔ THỊ
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface tracking-tight leading-tight">
              Cộng Đồng Gieo Mầm &amp; Chia Sẻ Góc Xanh
            </h1>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Nơi giao lưu, hỏi đáp kỹ thuật gieo hạt, khoe những chậu mầm xinh và lan tỏa năng lượng
              bình yên cùng đất lá.
            </p>
          </div>

          <Button
            onClick={handleQuickPostClick}
            className="px-6 py-3.5 rounded-full bg-[#1b4332] hover:bg-[#112d20] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 h-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Viết Bài Thảo Luận</span>
          </Button>
        </div>

        {/* Quick Post Box (matching Image 1) */}
        <Card className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {getInitial(user?.fullName || "Bạn")}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={handleQuickPostClick}
              className="flex-1 bg-surface-container-low hover:bg-surface-container text-left px-5 py-3 rounded-full text-xs sm:text-sm text-outline hover:text-on-surface-variant transition-colors cursor-pointer border border-outline-variant/20 truncate"
            >
              Bạn đang trồng cây gì hôm nay? Chia sẻ khoảnh khắc với cộng đồng...
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleQuickPostClick}
              className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded-lg"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">image</span>
              <span>Ảnh / Video</span>
            </button>

            <Button
              size="sm"
              onClick={handleQuickPostClick}
              className="rounded-full bg-[#1b4332] hover:bg-[#112d20] text-white text-xs font-semibold px-4 h-8 flex items-center gap-1.5 cursor-pointer shadow-none"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Đăng Bài Mới</span>
            </Button>
          </div>
        </Card>

        {/* Feed Tab Selector (Tất cả & Bài viết của tôi) */}
        <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-2">
          <button
            type="button"
            onClick={() => setActiveFeedTab("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFeedTab === "all"
                ? "bg-[#183d2c] text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            Tất cả thảo luận ({posts.length})
          </button>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                onNotify?.("Vui lòng đăng nhập để xem bài viết của bạn!", "lock")
                onOpenAuthModal?.()
                return
              }
              setActiveFeedTab("my_posts")
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFeedTab === "my_posts"
                ? "bg-[#183d2c] text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Bài viết của tôi ({myPosts.length})</span>
          </button>
        </div>

        {/* Posts Feed using reusable PostCard */}
        <div className="w-full flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2].map((n) => (
                <Card
                  key={n}
                  className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 border border-outline-variant/30 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-11 rounded-full" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </Card>
              ))}
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 border border-outline-variant/30 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-outline">
                {activeFeedTab === "my_posts" ? "post_add" : "nature_people"}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-semibold text-lg text-on-surface">
                  {activeFeedTab === "my_posts"
                    ? "Bạn chưa có bài viết nào"
                    : "Chưa có bài viết nào"}
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  {activeFeedTab === "my_posts"
                    ? "Hãy gieo mầm chia sẻ kinh nghiệm chăm sóc cây và góc xanh của bạn với cộng đồng!"
                    : "Hãy là người đầu tiên gieo mầm chia sẻ kinh nghiệm chăm sóc cây cùng cộng đồng Nhà Có Cây!"}
                </p>
              </div>
              <Button
                onClick={handleQuickPostClick}
                className="rounded-full bg-primary text-on-primary text-xs font-semibold px-6 py-2.5 h-auto cursor-pointer"
              >
                + Viết bài ngay
              </Button>
            </div>
          ) : (
            displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onNotify={onNotify}
                onEditPost={onEditPost}
                onDeletePost={handleDeletePost}
                canEdit={activeFeedTab === "my_posts"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
