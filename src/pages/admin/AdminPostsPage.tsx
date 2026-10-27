import React, { useState, useMemo } from "react"
import type { DiaryPost } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  X,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  MessageSquareText,
  Clock,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"

export interface AdminPostsPageProps {
  posts: DiaryPost[]
  loadingPosts: boolean
  postSearch: string
  onPostSearchChange: (search: string) => void
  postImageFilter: "all" | "with_image" | "text_only"
  onPostImageFilterChange: (filter: "all" | "with_image" | "text_only") => void
  deletingPostId: string | null
  onDeletePost: (post: DiaryPost) => Promise<void>
}

const getInitials = (name: string): string => {
  if (!name) return "?"
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words[words.length - 1].charAt(0).toUpperCase()
}

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const mins = String(d.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${mins}`
  } catch {
    return dateStr || "N/A"
  }
}

const formatRelativeTime = (dateStr: string): string => {
  try {
    const now = Date.now()
    const diff = now - new Date(dateStr).getTime()
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 1) return "Vừa xong"
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ngày trước`
    return formatDate(dateStr).split(" ")[0]
  } catch {
    return "Gần đây"
  }
}

const stripHtml = (html: string): string => {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export const AdminPostsPage: React.FC<AdminPostsPageProps> = ({
  posts,
  loadingPosts,
  postSearch,
  onPostSearchChange,
  postImageFilter,
  onPostImageFilterChange,
  deletingPostId,
  onDeletePost,
}) => {
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<DiaryPost | null>(null)
  const [postToDeleteConfirm, setPostToDeleteConfirm] = useState<DiaryPost | null>(null)

  // Metrics
  const totalPostsCount = posts.length
  const withImageCount = useMemo(() => {
    return posts.filter(
      (p) =>
        (p.images && p.images.length > 0) ||
        (p.coverImage && p.coverImage.trim() !== "")
    ).length
  }, [posts])
  const textOnlyCount = totalPostsCount - withImageCount
  const totalLikes = useMemo(() => posts.reduce((sum, p) => sum + (p.likesCount || 0), 0), [posts])
  const totalComments = useMemo(() => posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0), [posts])

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const term = postSearch.trim().toLowerCase()
      const plainContent = stripHtml(p.content).toLowerCase()
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.authorName.toLowerCase().includes(term) ||
        plainContent.includes(term)

      const hasImg =
        (p.images && p.images.length > 0) ||
        (p.coverImage && p.coverImage.trim() !== "")

      const matchesFilter =
        postImageFilter === "all" ||
        (postImageFilter === "with_image" && hasImg) ||
        (postImageFilter === "text_only" && !hasImg)

      return matchesSearch && matchesFilter
    })
  }, [posts, postSearch, postImageFilter])

  const handleConfirmDelete = async () => {
    if (!postToDeleteConfirm) return
    const target = postToDeleteConfirm
    setPostToDeleteConfirm(null)
    if (selectedPostForDetail?.id === target.id) {
      setSelectedPostForDetail(null)
    }
    await onDeletePost(target)
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tổng Bài Viết
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {totalPostsCount}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquareText className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Có Ảnh Minh Họa
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
                {withImageCount}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ImageIcon className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tổng Lượt Thích
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-600 tracking-tight">
                {totalLikes}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tổng Bình Luận
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight">
                {totalComments}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MessageCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input using Shadcn Input */}
          <div className="w-full sm:w-80 relative">
            <Input
              type="text"
              value={postSearch}
              onChange={(e) => onPostSearchChange(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, tác giả hoặc nội dung..."
              className="rounded-xl text-xs h-10 pl-9.5 bg-card border-border shadow-2xs"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            {postSearch && (
              <button
                type="button"
                onClick={() => onPostSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Image Filter Chips */}
          <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-border shadow-2xs">
            <button
              type="button"
              onClick={() => onPostImageFilterChange("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                postImageFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Tất cả ({totalPostsCount})
            </button>
            <button
              type="button"
              onClick={() => onPostImageFilterChange("with_image")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                postImageFilter === "with_image"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Có ảnh ({withImageCount})
            </button>
            <button
              type="button"
              onClick={() => onPostImageFilterChange("text_only")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                postImageFilter === "text_only"
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Chỉ văn bản ({textOnlyCount})
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
          Hiển thị <span className="font-bold text-foreground">{filteredPosts.length}</span> bài viết
        </div>
      </div>

      {/* Main Posts Data Table */}
      <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loadingPosts ? (
            <div className="p-16 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl animate-spin text-primary">
                progress_activity
              </span>
              <span>Đang tải danh sách bài viết từ cộng đồng...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60">
                <MessageSquareText className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-foreground">Không tìm thấy bài viết nào</h3>
                <p className="text-xs text-muted-foreground">
                  {postSearch
                    ? `Không có kết quả nào phù hợp với từ khóa "${postSearch}".`
                    : "Chưa có bài viết nào được đăng tải trên diễn đàn cộng đồng."}
                </p>
              </div>
              {postSearch && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onPostSearchChange("")}
                  className="rounded-xl text-xs font-semibold mt-1 cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border">
                  <TableHead className="w-[360px]">Bài Viết &amp; Nội Dung</TableHead>
                  <TableHead className="w-[180px]">Tác Giả</TableHead>
                  <TableHead className="w-[150px]">Thời Gian</TableHead>
                  <TableHead className="w-[120px] text-center">Tương Tác</TableHead>
                  <TableHead className="w-[150px] text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => {
                  const isDeleting = deletingPostId === post.id
                  const allImages = (post.images && post.images.length > 0)
                    ? post.images
                    : post.coverImage && post.coverImage.trim() !== ""
                    ? [post.coverImage]
                    : []
                  const thumbnail = allImages[0]
                  const plainText = stripHtml(post.content)

                  return (
                    <TableRow
                      key={post.id}
                      className="border-border/60 hover:bg-muted/40 align-top transition-colors"
                    >
                      {/* Cột 1: Ảnh & Tiêu đề & Snippet */}
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {thumbnail ? (
                            <div className="relative size-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border shadow-2xs group cursor-pointer"
                              onClick={() => setSelectedPostForDetail(post)}
                            >
                              <img
                                src={thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {allImages.length > 1 && (
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded-sm">
                                  +{allImages.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="size-14 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 text-muted-foreground/50">
                              <MessageSquareText className="size-5" />
                            </div>
                          )}

                          <div className="flex flex-col gap-1 min-w-0">
                            <h4
                              onClick={() => setSelectedPostForDetail(post)}
                              className="font-heading font-bold text-xs sm:text-sm text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                              title={post.title}
                            >
                              {post.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {plainText || "(Không có nội dung văn bản)"}
                            </p>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {allImages.length > 0 && (
                                <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 gap-1 text-emerald-700 bg-emerald-50/60 border-emerald-200 font-medium">
                                  <ImageIcon className="size-2.5" />
                                  <span>{allImages.length} ảnh</span>
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground/60 font-mono">
                                #{post.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Tác giả */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 border border-border shrink-0">
                            <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
                              {getInitials(post.authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground truncate">
                              {post.authorName || "Ẩn danh"}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate font-mono">
                              {post.userId ? `ID: ${post.userId.slice(0, 8)}...` : "Khách"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 3: Thời gian */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            {formatRelativeTime(post.createdAt)}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 font-mono">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Cột 4: Tương tác */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold" title="Lượt thích">
                            <Heart className="size-3.5 fill-rose-500 text-rose-500" />
                            <span>{post.likesCount || 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold" title="Bình luận">
                            <MessageCircle className="size-3.5 text-blue-500" />
                            <span>{post.commentsCount || 0}</span>
                          </span>
                        </div>
                      </TableCell>

                      {/* Cột 5: Thao tác */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Xem trước */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPostForDetail(post)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Xem chi tiết bài viết"
                          >
                            <Eye className="size-3.5" />
                            <span className="hidden sm:inline ml-1">Xem</span>
                          </Button>

                          {/* Xóa bài viết */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setPostToDeleteConfirm(post)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                            title="Xóa bài viết này khỏi hệ thống"
                          >
                            {isDeleting ? (
                              <span className="material-symbols-outlined text-[16px] animate-spin">
                                progress_activity
                              </span>
                            ) : (
                              <>
                                <Trash2 className="size-3.5" />
                                <span className="hidden sm:inline ml-1">Xóa</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================= POST PREVIEW DIALOG ================= */}
      <Dialog
        open={!!selectedPostForDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedPostForDetail(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7">
          {selectedPostForDetail && (
            <>
              <DialogHeader className="text-left space-y-3 pb-2 border-b border-border">
                <div className="flex items-center justify-between gap-3 pr-6">
                  <Badge variant="outline" className="text-[11px] font-semibold text-primary bg-primary/10 border-primary/20">
                    🌱 Bài Viết Diễn Đàn
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ID: {selectedPostForDetail.id}
                  </span>
                </div>

                <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-foreground leading-snug">
                  {selectedPostForDetail.title}
                </DialogTitle>

                {/* Author Info & Date */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 border border-border">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {getInitials(selectedPostForDetail.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        {selectedPostForDetail.authorName}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(selectedPostForDetail.createdAt)} ({formatRelativeTime(selectedPostForDetail.createdAt)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <Heart className="size-3 fill-rose-500 text-rose-500" />
                      <span>{selectedPostForDetail.likesCount || 0}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <MessageCircle className="size-3 text-blue-500" />
                      <span>{selectedPostForDetail.commentsCount || 0}</span>
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Post Content */}
              <div className="py-4 space-y-4">
                <div
                  className="prose prose-sm max-w-none text-foreground font-body leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: selectedPostForDetail.content }}
                />

                {/* Images Preview Gallery */}
                {(() => {
                  const images = (selectedPostForDetail.images && selectedPostForDetail.images.length > 0)
                    ? selectedPostForDetail.images
                    : selectedPostForDetail.coverImage && selectedPostForDetail.coverImage.trim() !== ""
                    ? [selectedPostForDetail.coverImage]
                    : []

                  if (images.length === 0) return null

                  return (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" />
                        Hình ảnh đính kèm ({images.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {images.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-muted"
                          >
                            <img
                              src={url}
                              alt={`Hình ảnh ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <ExternalLink className="size-5 text-white drop-shadow-md" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Dialog Footer Actions */}
              <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPostForDetail(null)}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setPostToDeleteConfirm(selectedPostForDetail)}
                  className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xóa Bài Viết Này</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      <Dialog
        open={!!postToDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setPostToDeleteConfirm(null)
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-3">
            <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="size-6 text-rose-600" />
            </div>
            <DialogTitle className="text-center text-lg font-bold font-heading text-foreground">
              Xác Nhận Xóa Bài Viết?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa bài viết{" "}
              <span className="font-bold text-foreground">
                "{postToDeleteConfirm?.title}"
              </span>{" "}
              của tác giả{" "}
              <span className="font-semibold text-foreground">
                "{postToDeleteConfirm?.authorName}"
              </span>{" "}
              khỏi cơ sở dữ liệu hệ thống? Toàn bộ bình luận và tương tác liên quan cũng sẽ không thể khôi phục.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPostToDeleteConfirm(null)}
              className="w-full rounded-xl text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="w-full rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
            >
              Đồng Ý Xóa Vĩnh Viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
