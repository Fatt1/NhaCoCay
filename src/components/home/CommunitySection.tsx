import React, { useEffect, useState } from "react"
import { getPosts, deletePost } from "@/services"
import type { DiaryPost } from "@/types"
import { PostCard } from "@/components/common"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { navigateTo } from "@/lib/navigation"

interface CommunitySectionProps {
  onOpenNewPost?: () => void
  onEditPost?: (post: DiaryPost) => void
  onNotify?: (message: string, icon?: string) => void
  postsVersion?: number
  onRefreshPosts?: () => void
  onGoToForum?: () => void
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  onOpenNewPost,
  onEditPost,
  onNotify,
  postsVersion = 0,
  onRefreshPosts,
  onGoToForum,
}) => {
  const [posts, setPosts] = useState<DiaryPost[]>([])
  const [loading, setLoading] = useState(true)

  const handleGoToForum = () => {
    if (onGoToForum) {
      onGoToForum()
    } else {
      navigateTo("/forum")
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    let isMounted = true
    getPosts()
      .then((data) => {
        if (isMounted) {
          setPosts(data.slice(0, 2))
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [postsVersion])

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      onNotify?.("Đã xóa bài viết thành công!", "delete")
      onRefreshPosts?.()
    } catch {
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      onNotify?.("Đã xóa bài viết!", "delete")
      onRefreshPosts?.()
    }
  }

  return (
    <section className="py-12 md:py-20 bg-surface" id="community-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-6 sm:gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <span className="text-xs text-primary uppercase tracking-wider font-semibold block">
              Cộng Đồng Xanh
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Diễn Đàn Trồng Cây
            </h2>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              Hỏi đáp kỹ thuật, sẻ chia thành quả và trao đổi cành giâm cùng bạn hữu.
            </p>
          </div>
          <Button
            onClick={handleGoToForum}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 h-auto"
          >
            <span>Xem thêm</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Button>
        </div>

        {/* Centered Posts List using reusable PostCard */}
        <div className="w-full flex flex-col gap-5 sm:gap-6">
          {loading ? (
            <div className="flex flex-col gap-4 sm:gap-6">
              {[1, 2].map((n) => (
                <Card
                  key={n}
                  className="bg-surface-container-lowest rounded-3xl p-4 sm:p-7 border border-outline-variant/30 flex flex-col gap-4"
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
          ) : posts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 border border-outline-variant/30 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-outline">nature_people</span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-semibold text-lg text-on-surface">
                  Chưa có bài viết nào
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Hãy là người đầu tiên gieo mầm chia sẻ kinh nghiệm chăm sóc cây cùng cộng đồng Nhà Có Cây!
                </p>
              </div>
              <Button
                onClick={onOpenNewPost}
                className="rounded-full bg-primary text-on-primary text-xs font-semibold px-6 py-2.5 h-auto cursor-pointer"
              >
                + Viết bài ngay
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onNotify={onNotify}
                onEditPost={onEditPost}
                onDeletePost={handleDeletePost}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
