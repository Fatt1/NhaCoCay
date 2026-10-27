import React, { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import {
  toggleLikePost,
  getPostComments,
  addComment,
  toggleLikeComment,
  updateComment,
  deleteComment,
} from "@/services"
import { useAuthStore } from "@/stores"
import type { DiaryPost, PostComment } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface PostCardProps {
  post: DiaryPost
  onNotify?: (message: string, icon?: string) => void
  showCommentsByDefault?: boolean
  className?: string
  onEditPost?: (post: DiaryPost) => void
  onDeletePost?: (postId: string) => void
  canEdit?: boolean
}

const getInitial = (name: string): string => {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words[words.length - 1].charAt(0).toUpperCase()
}

const getAvatarBgClass = (name: string): string => {
  const colors = [
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-teal-100 text-teal-800",
    "bg-sky-100 text-sky-800",
    "bg-rose-100 text-rose-800",
    "bg-indigo-100 text-indigo-800",
  ]
  let hash = 0
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const formatTimeAgo = (dateStr: string): string => {
  try {
    const now = Date.now()
    const diff = now - new Date(dateStr).getTime()
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 1) return "Vừa xong"
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    return `${days} ngày trước`
  } catch {
    return "Gần đây"
  }
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onNotify,
  showCommentsByDefault = false,
  className = "",
  onEditPost,
  onDeletePost,
  canEdit,
}) => {
  const { user } = useAuthStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likesCount || 0)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0)
  const [commentToDelete, setCommentToDelete] = useState<{
    id: string
    parentId?: string | null
    isReply?: boolean
  } | null>(null)
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false)
  const [comments, setComments] = useState<PostComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [showComments, setShowComments] = useState(showCommentsByDefault)
  const [mainCommentInput, setMainCommentInput] = useState("")

  // State for replying to a specific comment (Image 2 style)
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string
    authorName: string
    userId?: string
  } | null>(null)
  const [replyInput, setReplyInput] = useState("")

  // State chỉnh sửa bình luận / câu trả lời
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  // Danh sách hình ảnh bài viết (loại bỏ link rỗng)
  const imagesList = useMemo(() => {
    return post.images && post.images.length > 0
      ? post.images.filter((img) => img && img.trim() !== "")
      : post.coverImage && post.coverImage.trim() !== ""
        ? [post.coverImage]
        : []
  }, [post.images, post.coverImage])

  // Trạng thái phóng to ảnh (Lightbox Preview)
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null)

  // Điều khiển bằng phím Escape và Mũi tên trái / phải
  useEffect(() => {
    if (previewImageIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewImageIndex(null)
      } else if (e.key === "ArrowLeft") {
        setPreviewImageIndex((prev) =>
          prev !== null ? (prev - 1 + imagesList.length) % imagesList.length : 0
        )
      } else if (e.key === "ArrowRight") {
        setPreviewImageIndex((prev) =>
          prev !== null ? (prev + 1) % imagesList.length : 0
        )
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewImageIndex, imagesList.length])

  // Quản lý trạng thái hiển thị bình luận con (ẩn mặc định, chỉ mở khi người dùng bấm vào)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})

  const toggleShowReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  useEffect(() => {
    let isMounted = true
    setLoadingComments(true)
    getPostComments(post.id)
      .then((data) => {
        if (isMounted) {
          setComments(data)
          const totalCount = data.reduce(
            (sum, c) => sum + 1 + (c.replies ? c.replies.length : 0),
            0
          )
          setCommentsCount(totalCount)
          setLoadingComments(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoadingComments(false)
      })
    return () => {
      isMounted = false
    }
  }, [post.id])

  const handleToggleLike = async () => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để thả tim bài viết!", "lock")
      return
    }
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    try {
      await toggleLikePost(post.id, user.uid)
      if (nextLiked) {
        onNotify?.("Đã thả tim bài viết!", "favorite")
      }
    } catch {
      setIsLiked(!nextLiked)
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    }
  }

  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Gửi bình luận gốc (Root comment)
  const handleSendMainComment = async () => {
    const text = mainCommentInput.trim()
    if (!text || isSubmittingComment) return

    const commenterId = user?.uid || "guest_" + Math.random().toString(36).substring(2, 9)
    const commenterName = user?.fullName || "Bạn làm vườn"

    setIsSubmittingComment(true)
    try {
      const newCmt = await addComment(post.id, {
        userId: commenterId,
        authorName: commenterName,
        content: text,
      })

      setComments((prev) => [...prev, newCmt])
      setCommentsCount((prev) => prev + 1)
      setMainCommentInput("")
      setShowComments(true)
      onNotify?.("Đã gửi bình luận!", "forum")
    } catch (err: any) {
      console.warn("Firestore error, applying optimistic comment:", err)
      const fallbackCmt: PostComment = {
        id: "cmt_" + Date.now(),
        postId: post.id,
        userId: commenterId,
        authorName: commenterName,
        content: text,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      }
      setComments((prev) => [...prev, fallbackCmt])
      setCommentsCount((prev) => prev + 1)
      setMainCommentInput("")
      setShowComments(true)
      onNotify?.("Đã gửi bình luận!", "forum")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Gửi câu trả lời (Reply comment dạng mention như Hình 2)
  const handleSendReply = async (parentId: string) => {
    const text = replyInput.trim()
    if (!text || isSubmittingComment) return

    const commenterId = user?.uid || "guest_" + Math.random().toString(36).substring(2, 9)
    const commenterName = user?.fullName || "Bạn làm vườn"

    setIsSubmittingComment(true)
    try {
      const newReply = await addComment(post.id, {
        userId: commenterId,
        authorName: commenterName,
        content: text,
        parentId,
        replyToAuthorName: replyTarget?.authorName,
        replyToUserId: replyTarget?.userId,
      })

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      )
      setCommentsCount((prev) => prev + 1)

      setReplyInput("")
      setReplyTarget(null)
      setShowComments(true)
      // Tự động mở bình luận con để thấy câu trả lời vừa gửi
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }))
      onNotify?.("Đã gửi câu trả lời!", "forum")
    } catch (err: any) {
      console.warn("Firestore error on reply, applying optimistic reply:", err)
      const fallbackReply: PostComment = {
        id: "reply_" + Date.now(),
        postId: post.id,
        userId: commenterId,
        authorName: commenterName,
        content: text,
        parentId,
        replyToAuthorName: replyTarget?.authorName,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), fallbackReply] }
            : c
        )
      )
      setCommentsCount((prev) => prev + 1)
      setReplyInput("")
      setReplyTarget(null)
      setShowComments(true)
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }))
      onNotify?.("Đã gửi câu trả lời!", "forum")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Thả tim / Bỏ thích bình luận hoặc câu trả lời
  const handleToggleLikeComment = async (commentId: string, _parentId?: string | null) => {
    if (!user) {
      onNotify?.("Vui lòng đăng nhập để thích bình luận!", "lock")
      return
    }

    // Cập nhật optimistic giao diện ngay lập tức
    setComments((prev) => {
      const updateList = (list: PostComment[]): PostComment[] => {
        return list.map((c) => {
          if (c.id === commentId) {
            const likedList = Array.isArray(c.likedUserIds) ? [...c.likedUserIds] : []
            const hasLiked = likedList.includes(user.uid)
            const nextLiked = hasLiked
              ? likedList.filter((id) => id !== user.uid)
              : [...likedList, user.uid]
            const nextCount = hasLiked
              ? Math.max(0, (c.likesCount || 0) - 1)
              : (c.likesCount || 0) + 1

            return {
              ...c,
              likedUserIds: nextLiked,
              likesCount: nextCount,
            }
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateList(c.replies) }
          }
          return c
        })
      }
      return updateList(prev)
    })

    try {
      await toggleLikeComment(post.id, commentId, user.uid)
    } catch (err) {
      console.warn("Could not sync like comment to Firestore:", err)
    }
  }

  // Bắt đầu trả lời một bình luận hoặc một câu trả lời cụ thể
  const handleStartReply = (parentId: string, authorName: string, userId?: string) => {
    if (replyTarget?.parentId === parentId && replyTarget.authorName === authorName) {
      setReplyTarget(null)
    } else {
      setReplyTarget({
        parentId,
        authorName,
        userId,
      })
      // Tự động mở danh sách bình luận con để tiện theo dõi
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }))
    }
  }

  // Bắt đầu chỉnh sửa bình luận
  const handleStartEdit = (cmt: PostComment) => {
    setEditingCommentId(cmt.id)
    setEditingContent(cmt.content)
  }

  // Hủy chỉnh sửa bình luận
  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent("")
  }

  // Lưu nội dung chỉnh sửa bình luận
  const handleSaveEdit = async (commentId: string, _parentId?: string | null) => {
    const text = editingContent.trim()
    if (!text) return

    const nowIso = new Date().toISOString()
    setComments((prev) => {
      const updateList = (list: PostComment[]): PostComment[] => {
        return list.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              content: text,
              isEdited: true,
              updatedAt: nowIso,
            }
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateList(c.replies) }
          }
          return c
        })
      }
      return updateList(prev)
    })

    setEditingCommentId(null)
    setEditingContent("")
    onNotify?.("Đã cập nhật bình luận!", "check_circle")

    try {
      await updateComment(post.id, commentId, text)
    } catch (err) {
      console.warn("Could not sync comment update to Firestore:", err)
    }
  }

  // Bật modal xác nhận xóa bình luận hoặc câu trả lời bằng AlertDialog của shadcn
  const handleDeleteComment = (commentId: string, parentId?: string | null, isReply = false) => {
    setCommentToDelete({
      id: commentId,
      parentId,
      isReply: !!parentId || isReply,
    })
  }

  // Thực hiện xóa bình luận khi người dùng xác nhận trong AlertDialog
  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return
    const { id: commentId, parentId, isReply } = commentToDelete

    // Tính toán số lượng bình luận bị trừ (nếu là comment gốc thì trừ cả các replies con)
    let countToDelete = 1
    if (!parentId && !isReply) {
      const targetCmt = comments.find((c) => c.id === commentId)
      if (targetCmt && targetCmt.replies) {
        countToDelete += targetCmt.replies.length
      }
    }

    // Cập nhật giao diện ngay lập tức (optimistic)
    setCommentsCount((prev) => Math.max(0, prev - countToDelete))
    setComments((prev) => {
      if (!parentId) {
        return prev.filter((c) => c.id !== commentId)
      }
      return prev.map((c) => {
        if (c.id === parentId) {
          const filteredReplies = (c.replies || []).filter((r) => r.id !== commentId)
          return {
            ...c,
            replies: filteredReplies,
            repliesCount: Math.max(0, (c.repliesCount || 1) - 1),
          }
        }
        return c
      })
    })

    setCommentToDelete(null)
    onNotify?.("Đã xóa bình luận thành công!", "delete")

    try {
      await deleteComment(post.id, commentId)
    } catch (err) {
      console.warn("Could not sync delete comment to Firestore:", err)
    }
  }

  const totalCommentsCount = Math.max(0, commentsCount)

  return (
    <>
      <Card
        className={`bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-sm border border-outline-variant/30 flex flex-col gap-4 ${className}`}
      >
        <CardContent className="p-0 flex flex-col gap-4">
          {/* Post Author Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback
                  className={`font-bold text-sm ${getAvatarBgClass(post.authorName)}`}
                >
                  {getInitial(post.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-base text-on-surface leading-tight">
                  {post.authorName}
                </span>
                <span className="text-xs text-on-surface-variant mt-0.5">
                  {formatTimeAgo(post.createdAt)} •
                </span>
              </div>
            </div>
            {(() => {
              const isUserAuthor =
                canEdit ??
                (user
                  ? post.userId === user.uid ||
                  post.authorName === user.fullName ||
                  user.role === "admin" ||
                  (user.email && post.authorName.toLowerCase().includes(user.email.split("@")[0].toLowerCase()))
                  : false)

              if (isUserAuthor && (onEditPost || onDeletePost)) {
                return (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onEditPost && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPost(post)}
                        className="h-8 px-3 rounded-full text-xs font-semibold text-neutral-700 hover:text-primary hover:bg-emerald-50 hover:border-primary/40 border-neutral-200/80 gap-1.5 cursor-pointer transition-colors shadow-none"
                        title="Sửa bài viết"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
                        <span>Sửa</span>
                      </Button>
                    )}
                    {onDeletePost && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeletePostDialog(true)}
                        className="h-8 px-3 rounded-full text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-neutral-200/80 gap-1.5 cursor-pointer transition-colors shadow-none"
                        title="Xóa bài viết"
                      >
                        <span className="material-symbols-outlined text-[16px] text-red-500">delete</span>
                        <span>Xóa</span>
                      </Button>
                    )}
                  </div>
                )
              }

              return (
                <button
                  type="button"
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                  aria-label="Tùy chọn bài viết"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              )
            })()}
          </div>

          {/* Post Title */}
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-on-surface leading-snug">
            {post.title}
          </h3>

          {/* Post Content */}
          <div
            className="post-content font-body text-sm text-on-surface-variant leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Post Images Layout (Hỗ trợ hiển thị tối ưu cho 1, 2, 3, 4, 5+ ảnh) */}
          {imagesList.length >= 5 && (
            <div className="flex flex-col gap-2 rounded-2xl overflow-hidden select-none">
              {/* Hàng 1: 2 ảnh lớn (50% - 50%) */}
              <div className="grid grid-cols-2 gap-2 h-[200px] sm:h-[260px]">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className="relative h-full overflow-hidden cursor-pointer group bg-neutral-100 rounded-xl"
                    onClick={() => setPreviewImageIndex(idx)}
                  >
                    <img
                      src={imagesList[idx]}
                      alt={`Ảnh minh họa ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-white text-[28px] drop-shadow-md">
                        zoom_in
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hàng 2: 3 ảnh bên dưới (33.3% - 33.3% - 33.3%) */}
              <div className="grid grid-cols-3 gap-2 h-[130px] sm:h-[180px]">
                {[2, 3, 4].map((idx) => {
                  const isLastVisible = idx === 4
                  const remainingCount = imagesList.length - 5
                  return (
                    <div
                      key={idx}
                      className="relative h-full overflow-hidden cursor-pointer group bg-neutral-100 rounded-xl"
                      onClick={() => setPreviewImageIndex(idx)}
                    >
                      <img
                        src={imagesList[idx]}
                        alt={`Ảnh minh họa ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Hiển thị badge +N nếu tổng số ảnh > 5 như giao diện mẫu */}
                      {isLastVisible && remainingCount > 0 ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl tracking-wide select-none group-hover:bg-black/75 transition-colors">
                          +{remainingCount}
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-white text-[24px] drop-shadow-md">
                            zoom_in
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {imagesList.length === 4 && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden select-none">
              {imagesList.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square sm:aspect-[4/3] overflow-hidden cursor-pointer group bg-neutral-100 rounded-xl"
                  onClick={() => setPreviewImageIndex(idx)}
                >
                  <img
                    src={url}
                    alt={`Ảnh minh họa ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-white text-[26px] drop-shadow-md">
                      zoom_in
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {imagesList.length === 3 && (
            <div className="flex flex-col gap-2 rounded-2xl overflow-hidden select-none">
              <div
                className="h-[220px] sm:h-[280px] w-full overflow-hidden cursor-pointer group relative bg-neutral-100 rounded-xl"
                onClick={() => setPreviewImageIndex(0)}
              >
                <img
                  src={imagesList[0]}
                  alt="Ảnh minh họa 1"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-white text-[28px] drop-shadow-md">
                    zoom_in
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 h-[150px] sm:h-[190px]">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="relative h-full overflow-hidden cursor-pointer group bg-neutral-100 rounded-xl"
                    onClick={() => setPreviewImageIndex(idx)}
                  >
                    <img
                      src={imagesList[idx]}
                      alt={`Ảnh minh họa ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-white text-[24px] drop-shadow-md">
                        zoom_in
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {imagesList.length === 2 && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden max-h-[340px] sm:max-h-[400px] select-none">
              {imagesList.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] sm:aspect-square overflow-hidden cursor-pointer group bg-neutral-100 rounded-xl"
                  onClick={() => setPreviewImageIndex(idx)}
                >
                  <img
                    src={url}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-white text-[26px] drop-shadow-md">
                      zoom_in
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {imagesList.length === 1 && (
            <div
              className="rounded-2xl overflow-hidden max-h-[480px] sm:max-h-[540px] select-none cursor-pointer group relative bg-neutral-100"
              onClick={() => setPreviewImageIndex(0)}
            >
              <img
                src={imagesList[0]}
                alt={post.title}
                className="w-full h-full max-h-[480px] sm:max-h-[540px] object-cover rounded-2xl group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="material-symbols-outlined text-white text-[32px] drop-shadow-md">
                  zoom_in
                </span>
              </div>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex flex-col gap-3 pt-1">
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${isLiked ? "text-error" : "text-on-surface-variant hover:text-error"
                    }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  <span>{likesCount}</span>
                </button>

                {/* Comment Count / Toggle Button (Bấm vào mới hiện ra các bình luận) */}
                <button
                  type="button"
                  onClick={() => setShowComments((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  <span>{totalCommentsCount} bình luận</span>
                </button>
              </div>


            </div>
          </div>

          {/* Comments Section */}
          {!showComments && (
            <div className="flex flex-col gap-2 pt-1">
              {totalCommentsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowComments(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  <span>Hiển thị ({totalCommentsCount}) bình luận</span>
                </button>
              )}

              {/* Quick Comment Bar when collapsed */}
              <div className="flex items-center gap-2.5 pt-1">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={`text-xs font-bold ${getAvatarBgClass(
                      user?.fullName || "Bạn"
                    )}`}
                  >
                    {getInitial(user?.fullName || "B")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant/30 focus-within:border-primary">
                  <input
                    type="text"
                    value={mainCommentInput}
                    onChange={(e) => setMainCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMainComment()}
                    placeholder="Viết bình luận cho bài viết... (Nhấn Enter để gửi)"
                    className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none"
                  />
                  <Button
                    size="sm"
                    disabled={isSubmittingComment || !mainCommentInput.trim()}
                    onClick={handleSendMainComment}
                    className="rounded-full bg-primary text-on-primary text-xs font-semibold px-4 h-8 hover:bg-primary-container shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingComment ? "..." : "Gửi"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showComments && (
            <div className="flex flex-col gap-4 mt-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-xs font-bold text-on-surface">
                  Bình luận ({totalCommentsCount})
                </span>
                <button
                  type="button"
                  onClick={() => setShowComments(false)}
                  className="text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Thu gọn
                </button>
              </div>

              {loadingComments ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : comments.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="flex flex-col gap-2 bg-surface-container-low/40 p-3.5 rounded-2xl"
                    >
                      {/* Root Comment */}
                      <div className="flex items-start gap-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback
                            className={`text-xs font-bold ${getAvatarBgClass(cmt.authorName)}`}
                          >
                            {getInitial(cmt.authorName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-on-surface">
                                {cmt.authorName}
                              </span>
                              {cmt.userId === post.userId && (
                                <Badge className="bg-[#1b4332] text-white text-[10px] px-1.5 py-0 rounded-full font-medium border-none shadow-none">
                                  Tác giả
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[11px] text-on-surface-variant">
                                {formatTimeAgo(cmt.createdAt)}
                              </span>
                              {user && (user.uid === cmt.userId || user.role === "admin") && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="p-1 rounded-full text-on-surface-variant/70 hover:text-on-surface hover:bg-neutral-200/60 transition-colors cursor-pointer outline-none shrink-0 flex items-center justify-center"
                                      title="Tùy chọn bình luận"
                                    >
                                      <span className="material-symbols-outlined text-[18px] leading-none">
                                        more_horiz
                                      </span>
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36 bg-white border border-neutral-200 shadow-md rounded-xl p-1">
                                    {user.uid === cmt.userId && (
                                      <DropdownMenuItem
                                        onClick={() => handleStartEdit(cmt)}
                                        className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg px-2.5 py-1.5 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        <span>Chỉnh sửa</span>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteComment(cmt.id, cmt.parentId, false)}
                                      className="flex items-center gap-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg px-2.5 py-1.5 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                      <span>Xóa</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>

                          {/* Content or Inline Edit Box */}
                          {editingCommentId === cmt.id ? (
                            <div className="flex flex-col gap-2 mt-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit(cmt.id, cmt.parentId)
                                  if (e.key === "Escape") handleCancelEdit()
                                }}
                                className="w-full text-xs bg-surface-container-lowest border border-primary/50 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface shadow-xs"
                                placeholder="Chỉnh sửa bình luận của bạn..."
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="text-[11px] font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(cmt.id, cmt.parentId)}
                                  className="h-7 text-[11px] px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-semibold cursor-pointer"
                                >
                                  Lưu thay đổi
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-on-surface leading-relaxed mt-0.5 whitespace-pre-wrap">
                              {cmt.content}
                            </p>
                          )}

                          {/* Action Row: Thumbs-up icon, Reply, Edited, Like count badge, Edit/Delete */}
                          <div className="flex items-center gap-3.5 mt-2 flex-wrap">
                            {/* Like Icon Button */}
                            {(() => {
                              const isLikedByMe =
                                !!user &&
                                Array.isArray(cmt.likedUserIds) &&
                                cmt.likedUserIds.includes(user.uid)
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleToggleLikeComment(cmt.id, cmt.parentId)}
                                  className={`inline-flex items-center justify-center transition-transform active:scale-90 cursor-pointer p-0.5 ${
                                    isLikedByMe
                                      ? "text-blue-600 font-bold"
                                      : "text-on-surface-variant hover:text-blue-600"
                                  }`}
                                  title={isLikedByMe ? "Bỏ thích" : "Thích"}
                                >
                                  <span
                                    className="material-symbols-outlined text-[17px]"
                                    style={isLikedByMe ? { fontVariationSettings: "'FILL' 1" } : {}}
                                  >
                                    thumb_up
                                  </span>
                                </button>
                              )
                            })()}

                            {/* Reply Button */}
                            <button
                              type="button"
                              onClick={() => handleStartReply(cmt.id, cmt.authorName, cmt.userId)}
                              className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            >
                              Trả lời
                            </button>

                            {/* Edited status */}
                            {cmt.isEdited && (
                              <span className="text-[10px] text-on-surface-variant/70 italic select-none">
                                Đã chỉnh sửa
                              </span>
                            )}

                            {/* Round Blue Like Badge (Image 2 style) */}
                            {cmt.likesCount > 0 && (
                              <span className="inline-flex items-center gap-1.5 select-none">
                                <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs shrink-0">
                                  <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                                  </svg>
                                </span>
                                <span className="text-xs font-semibold text-slate-700">{cmt.likesCount}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nested Replies */}
                      {cmt.replies && cmt.replies.length > 0 && (
                        <div className="flex flex-col gap-2 pl-6 sm:pl-8 mt-1">
                          {/* Nút Hiển thị / Ẩn bình luận */}
                          <button
                            type="button"
                            onClick={() => toggleShowReplies(cmt.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-fit py-1 cursor-pointer group select-none"
                          >
                            <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-transform">
                              {expandedReplies[cmt.id] ? "expand_less" : "subdirectory_arrow_right"}
                            </span>
                            <span>
                              {expandedReplies[cmt.id]
                                ? "Ẩn bình luận"
                                : `Hiển thị (${cmt.replies.length}) bình luận`}
                            </span>
                          </button>

                          {/* Danh sách bình luận con (chỉ hiện khi người dùng bấm vào) */}
                          {expandedReplies[cmt.id] && (
                            <div className="flex flex-col gap-2 border-l-2 border-outline-variant/30 pl-3 sm:pl-4 mt-0.5 animate-in fade-in duration-200">
                              {cmt.replies.map((reply) => {
                                const isPostAuthor =
                                  reply.userId === post.userId ||
                                  reply.authorName === post.authorName
                                const isReplyLikedByMe =
                                  !!user &&
                                  Array.isArray(reply.likedUserIds) &&
                                  reply.likedUserIds.includes(user.uid)

                                return (
                                  <div
                                    key={reply.id}
                                    className="flex items-start gap-2.5 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 shadow-2xs"
                                  >
                                    <Avatar className="size-7 shrink-0">
                                      <AvatarFallback
                                        className={`text-[10px] font-bold ${getAvatarBgClass(
                                          reply.authorName
                                        )}`}
                                      >
                                        {getInitial(reply.authorName)}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-xs text-on-surface">
                                            {reply.authorName}
                                          </span>
                                          {isPostAuthor && (
                                            <Badge className="bg-[#1b4332] text-white text-[10px] px-1.5 py-0 rounded-full font-medium border-none shadow-none">
                                              Tác giả
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[10px] text-on-surface-variant">
                                            {formatTimeAgo(reply.createdAt)}
                                          </span>
                                          {user && (user.uid === reply.userId || user.role === "admin") && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button
                                                  type="button"
                                                  className="p-0.5 rounded-full text-on-surface-variant/70 hover:text-on-surface hover:bg-neutral-200/60 transition-colors cursor-pointer outline-none shrink-0 flex items-center justify-center"
                                                  title="Tùy chọn câu trả lời"
                                                >
                                                  <span className="material-symbols-outlined text-[16px] leading-none">
                                                    more_horiz
                                                  </span>
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="w-36 bg-white border border-neutral-200 shadow-md rounded-xl p-1">
                                                {user.uid === reply.userId && (
                                                  <DropdownMenuItem
                                                    onClick={() => handleStartEdit(reply)}
                                                    className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg px-2.5 py-1.5 cursor-pointer"
                                                  >
                                                    <span className="material-symbols-outlined text-[15px]">edit</span>
                                                    <span>Chỉnh sửa</span>
                                                  </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                  onClick={() => handleDeleteComment(reply.id, cmt.id, true)}
                                                  className="flex items-center gap-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg px-2.5 py-1.5 cursor-pointer"
                                                >
                                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                                  <span>Xóa</span>
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                      </div>

                                      {/* Content or Inline Edit Box for Reply */}
                                      {editingCommentId === reply.id ? (
                                        <div className="flex flex-col gap-2 mt-1.5">
                                          <input
                                            type="text"
                                            autoFocus
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") handleSaveEdit(reply.id, cmt.id)
                                              if (e.key === "Escape") handleCancelEdit()
                                            }}
                                            className="w-full text-xs bg-surface-container-low border border-primary/50 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface shadow-xs"
                                            placeholder="Chỉnh sửa câu trả lời của bạn..."
                                          />
                                          <div className="flex items-center gap-2 justify-end">
                                            <button
                                              type="button"
                                              onClick={handleCancelEdit}
                                              className="text-[11px] font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                            >
                                              Hủy
                                            </button>
                                            <Button
                                              size="sm"
                                              onClick={() => handleSaveEdit(reply.id, cmt.id)}
                                              className="h-7 text-[11px] px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-semibold cursor-pointer"
                                            >
                                              Lưu thay đổi
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-on-surface leading-relaxed mt-0.5 whitespace-pre-wrap">
                                          {reply.content}
                                        </p>
                                      )}

                                      {/* Action Row for Reply */}
                                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                        {/* Like Icon Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleLikeComment(reply.id, cmt.id)}
                                          className={`inline-flex items-center justify-center transition-transform active:scale-90 cursor-pointer p-0.5 ${
                                            isReplyLikedByMe
                                              ? "text-blue-600 font-bold"
                                              : "text-on-surface-variant hover:text-blue-600"
                                          }`}
                                          title={isReplyLikedByMe ? "Bỏ thích" : "Thích"}
                                        >
                                          <span
                                            className="material-symbols-outlined text-[15px]"
                                            style={isReplyLikedByMe ? { fontVariationSettings: "'FILL' 1" } : {}}
                                          >
                                            thumb_up
                                          </span>
                                        </button>

                                        {/* Reply Button (mentions reply author) */}
                                        <button
                                          type="button"
                                          onClick={() => handleStartReply(cmt.id, reply.authorName, reply.userId)}
                                          className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                                        >
                                          Trả lời
                                        </button>

                                        {/* Edited status */}
                                        {reply.isEdited && (
                                          <span className="text-[10px] text-on-surface-variant/70 italic select-none">
                                            Đã chỉnh sửa
                                          </span>
                                        )}

                                        {/* Round Blue Like Badge */}
                                        {reply.likesCount > 0 && (
                                          <span className="inline-flex items-center gap-1.5 select-none">
                                            <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs shrink-0">
                                              <svg className="w-2 h-2 fill-white" viewBox="0 0 24 24">
                                                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                                              </svg>
                                            </span>
                                            <span className="text-[11px] font-semibold text-slate-700">{reply.likesCount}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}

                              {cmt.replies.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => toggleShowReplies(cmt.id)}
                                  className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant hover:text-primary transition-colors w-fit pt-1 cursor-pointer select-none"
                                >
                                  <span className="material-symbols-outlined text-[14px]">expand_less</span>
                                  <span>Ẩn bớt bình luận</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reply Input Box (Hiển thị ngay dưới bình luận này dạng mention như Hình 2) */}
                      {replyTarget?.parentId === cmt.id && (
                        <div className="flex items-center gap-2.5 pl-6 sm:pl-8 pt-2 mt-1">
                          <Avatar className="size-7 shrink-0">
                            <AvatarFallback
                              className={`text-[10px] font-bold ${getAvatarBgClass(
                                user?.fullName || "Bạn"
                              )}`}
                            >
                              {getInitial(user?.fullName || "B")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 flex items-center gap-1.5 bg-surface-container-lowest rounded-full px-3 py-1.5 border border-primary/40 focus-within:ring-2 focus-within:ring-primary/30 shadow-xs">
                            {/* Mention Tag Pill (xanh lam như Hình 2) */}
                            <span className="bg-[#1877f2]/15 text-[#1877f2] font-semibold text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1 shrink-0 select-none">
                              @{replyTarget.authorName}
                              <button
                                type="button"
                                onClick={() => setReplyTarget(null)}
                                className="hover:text-red-500 font-bold ml-0.5 text-xs cursor-pointer"
                                title="Hủy trả lời"
                              >
                                ✕
                              </button>
                            </span>

                            <input
                              type="text"
                              autoFocus
                              value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSendReply(cmt.id)
                                if (e.key === "Escape") setReplyTarget(null)
                              }}
                              placeholder="Nhập câu trả lời..."
                              className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none min-w-0"
                            />

                            <Button
                              size="sm"
                              onClick={() => handleSendReply(cmt.id)}
                              className="rounded-full bg-primary text-on-primary text-[11px] font-semibold px-3 h-7 hover:bg-primary-container shrink-0 cursor-pointer"
                            >
                              Gửi
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant text-center py-2">
                  Chưa có bình luận nào. Hãy là người đầu tiên để lại lời chúc mầm xanh!
                </p>
              )}

              {/* Main Comment Input Box (cho bình luận gốc) */}
              <div className="flex items-center gap-2.5 pt-2">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={`text-xs font-bold ${getAvatarBgClass(
                      user?.fullName || "Bạn"
                    )}`}
                  >
                    {getInitial(user?.fullName || "B")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant/30 focus-within:border-primary">
                  <input
                    type="text"
                    value={mainCommentInput}
                    onChange={(e) => setMainCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMainComment()}
                    placeholder="Viết bình luận cho bài viết... (Nhấn Enter để gửi)"
                    className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none"
                  />
                  <Button
                    size="sm"
                    disabled={isSubmittingComment || !mainCommentInput.trim()}
                    onClick={handleSendMainComment}
                    className="rounded-full bg-primary text-on-primary text-xs font-semibold px-4 h-8 hover:bg-primary-container shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingComment ? "..." : "Gửi"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox / Xem ảnh phóng to toàn màn hình & Chuyển qua lại các ảnh */}
      {previewImageIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] bg-black/92 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
            onClick={() => setPreviewImageIndex(null)}
          >
            {/* Thanh điều khiển trên cùng */}
            <div
              className="flex items-center justify-between px-4 sm:px-8 py-4 text-white z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/15 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-xs tracking-wider">
                  {previewImageIndex + 1} / {imagesList.length}
                </span>
                <span className="text-xs text-white/70 hidden sm:inline">
                  Dùng phím mũi tên ← → để chuyển ảnh, ESC để đóng
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewImageIndex(null)}
                className="size-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng xem ảnh (ESC)"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Vùng hiển thị ảnh chính */}
            <div
              className="relative flex-1 flex items-center justify-center px-4 sm:px-16 py-2 overflow-hidden"
              onClick={() => setPreviewImageIndex(null)}
            >
              {/* Nút Xem ảnh trước (Previous) */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewImageIndex(
                      (prev) => (prev! - 1 + imagesList.length) % imagesList.length
                    )
                  }}
                  className="absolute left-3 sm:left-6 z-20 size-11 sm:size-14 rounded-full bg-black/50 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105 cursor-pointer shadow-lg border border-white/10"
                  title="Ảnh trước (←)"
                >
                  <span className="material-symbols-outlined text-[28px] sm:text-[34px]">
                    chevron_left
                  </span>
                </button>
              )}

              {/* Ảnh to rõ nét */}
              <img
                src={imagesList[previewImageIndex]}
                alt={`Xem ảnh ${previewImageIndex + 1}`}
                className="max-h-[72vh] sm:max-h-[80vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-xl shadow-2xl transition-all duration-200 select-none"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Nút Xem ảnh kế tiếp (Next) */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewImageIndex((prev) => (prev! + 1) % imagesList.length)
                  }}
                  className="absolute right-3 sm:right-6 z-20 size-11 sm:size-14 rounded-full bg-black/50 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105 cursor-pointer shadow-lg border border-white/10"
                  title="Ảnh tiếp theo (→)"
                >
                  <span className="material-symbols-outlined text-[28px] sm:text-[34px]">
                    chevron_right
                  </span>
                </button>
              )}
            </div>

            {/* Dải hình ảnh thu nhỏ ở chân trang (Thumbnails strip) */}
            {imagesList.length > 1 && (
              <div
                className="px-4 py-3 z-20 flex items-center justify-center gap-2 overflow-x-auto max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-2xl max-w-full overflow-x-auto border border-white/10">
                  {imagesList.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewImageIndex(idx)}
                      className={`size-12 sm:size-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${previewImageIndex === idx
                          ? "border-emerald-400 scale-105 opacity-100 shadow-md ring-2 ring-emerald-400/40"
                          : "border-transparent opacity-50 hover:opacity-85 hover:scale-100"
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}

      {/* Shadcn AlertDialog Xác nhận xóa bình luận */}
      <AlertDialog
        open={!!commentToDelete}
        onOpenChange={(open) => {
          if (!open) setCommentToDelete(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <span className="material-symbols-outlined text-2xl">warning</span>
              Xác nhận xóa {commentToDelete?.isReply ? "câu trả lời" : "bình luận"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {commentToDelete?.isReply
                ? "Bạn có chắc chắn muốn xóa câu trả lời này không? Hành động này không thể hoàn tác."
                : "Bạn có chắc chắn muốn xóa bình luận này không? Tất cả các câu trả lời liên quan cũng sẽ bị xóa và hành động này không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommentToDelete(null)}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteComment}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Shadcn AlertDialog Xác nhận xóa bài viết */}
      <AlertDialog
        open={showDeletePostDialog}
        onOpenChange={setShowDeletePostDialog}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <span className="material-symbols-outlined text-2xl">warning</span>
              Xác nhận xóa bài viết
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết{" "}
              <span className="font-semibold text-on-surface">
                &ldquo;{post.title}&rdquo;
              </span>{" "}
              không? Toàn bộ nội dung, hình ảnh và các bình luận của bài viết này sẽ bị xóa và hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeletePostDialog(false)}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeletePostDialog(false)
                onDeletePost?.(post.id)
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
