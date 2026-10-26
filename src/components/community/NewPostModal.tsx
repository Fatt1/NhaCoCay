import React, { useState, useRef, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useAuthStore } from "@/stores"
import {
  createPost,
  updatePost,
  uploadPostImage,
  deleteStorageFile,
  deleteStorageFiles,
} from "@/services"
import type { DiaryPost } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UploadedImage {
  id: string
  url: string
  name: string
  size: string
}

interface NewPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
  postToEdit?: DiaryPost | null
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  postToEdit,
}) => {
  const { user } = useAuthStore()
  const [title, setTitle] = useState("")
  const [images, setImages] = useState<UploadedImage[]>([])
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveTime, setAutoSaveTime] = useState("14:32")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder:
          "Kể câu chuyện về mầm cây của bạn, chia sẻ các bước bạn đã làm, ánh sáng, tần suất tưới nước hoặc đính kèm thắc mắc cần các 'bác sĩ cây' hỗ trợ...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, "0")
      const mm = String(now.getMinutes()).padStart(2, "0")
      setAutoSaveTime(`${hh}:${mm}`)
    },
  })

  // Update current time and prefill data on open / edit
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, "0")
      const mm = String(now.getMinutes()).padStart(2, "0")
      setAutoSaveTime(`${hh}:${mm}`)
      setNewlyUploadedUrls([])

      if (postToEdit) {
        setTitle(postToEdit.title || "")
        editor?.commands.setContent(postToEdit.content || "")
        const existingImages = (postToEdit.images || []).filter(Boolean)
        if (existingImages.length > 0) {
          setImages(
            existingImages.map((url, idx) => ({
              id: "edit_img_" + idx,
              url,
              name: `anh_cay_${idx + 1}.jpg`,
              size: "1.8 MB",
            }))
          )
        } else if (postToEdit.coverImage && postToEdit.coverImage.trim()) {
          setImages([
            {
              id: "edit_img_0",
              url: postToEdit.coverImage,
              name: "anh_bia.jpg",
              size: "1.8 MB",
            },
          ])
        } else {
          setImages([])
        }
      } else {
        setTitle("")
        editor?.commands.clearContent()
        setImages([])
      }
    }
  }, [isOpen, postToEdit, editor])

  if (!isOpen) return null

  // Handle close and cleanup any uncommitted uploaded images
  const handleCloseModal = () => {
    if (newlyUploadedUrls.length > 0) {
      deleteStorageFiles(newlyUploadedUrls).catch(console.error)
      setNewlyUploadedUrls([])
    }
    onClose()
  }

  // Handle uploading files directly to Supabase Storage
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = 5 - images.length
    if (remainingSlots <= 0) {
      alert("Bạn chỉ có thể tải lên tối đa 5 hình ảnh!")
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    try {
      setIsUploading(true)
      const uploadPromises = filesToProcess.map(async (file) => {
        const publicUrl = await uploadPostImage(file, user?.uid || "community")
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB"
        let shortName = file.name
        if (shortName.length > 18) {
          shortName = shortName.substring(0, 15) + "..."
        }
        return {
          id: "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          url: publicUrl,
          name: shortName,
          size: sizeInMB,
        }
      })

      const uploadedItems = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedItems].slice(0, 5))
      setNewlyUploadedUrls((prev) => [
        ...prev,
        ...uploadedItems.map((item) => item.url),
      ])
    } catch (err) {
      console.error("Lỗi khi tải ảnh bài viết lên Supabase Storage:", err)
      alert("Có lỗi xảy ra khi tải ảnh lên Supabase Storage. Vui lòng thử lại!")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Set image as cover
  const handleSetCover = (index: number) => {
    if (index === 0) return
    setImages((prev) => {
      const target = prev[index]
      const remaining = prev.filter((_, idx) => idx !== index)
      return [target, ...remaining]
    })
  }

  // Remove image
  const handleRemoveImage = (id: string) => {
    const target = images.find((img) => img.id === id)
    if (target && newlyUploadedUrls.includes(target.url)) {
      deleteStorageFile(target.url).catch(console.error)
      setNewlyUploadedUrls((prev) => prev.filter((u) => u !== target.url))
    }
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const contentHtml = editor?.getHTML() || ""
    const contentText = editor?.getText() || ""

    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!")
      return
    }
    if (!contentText.trim()) {
      alert("Vui lòng nhập nội dung bài viết!")
      return
    }

    try {
      setIsSubmitting(true)
      const cover = images.length > 0 ? images[0].url : ""
      const imageList = images.map((img) => img.url)

      if (postToEdit) {
        // Cập nhật bài viết hiện có
        await updatePost(postToEdit.id, {
          title,
          content: contentHtml,
          coverImage: cover,
          images: imageList,
        })
        setNewlyUploadedUrls([])
        onClose()
        onSuccess?.("Cập nhật bài viết thành công!")
      } else {
        // Tạo mới bài viết
        await createPost({
          diaryId: "general_community",
          userId: user?.uid || "guest_user",
          authorName: user?.fullName || "Người gieo mầm",
          title,
          content: contentHtml,
          coverImage: cover,
          images: imageList,
        })

        setTitle("")
        editor?.commands.clearContent()
        setImages([])
        setNewlyUploadedUrls([])
        onClose()
        onSuccess?.("Bài viết đã được đăng tải thành công (+15 🌱)!")
      }
    } catch (err) {
      console.error("Error submitting post:", err)
      onSuccess?.(postToEdit ? "Có lỗi xảy ra khi cập nhật bài viết." : "Có lỗi xảy ra khi đăng bài.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add emoji into editor
  const handleInsertEmoji = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-surface rounded-3xl max-w-4xl w-full shadow-2xl relative my-auto border border-outline-variant/30 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-on-surface leading-tight">
                {postToEdit ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {postToEdit
                  ? "Cập nhật tiêu đề, nội dung và hình ảnh bài viết của bạn"
                  : "Chia sẻ quá trình chăm sóc và giao lưu cùng cộng đồng Nhà Có Cây"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="size-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
            aria-label="Đóng popup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-5 bg-[#fbfdfa]">
          {/* Card 1: Tiêu đề bài viết */}
          <Card className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-neutral-800 flex items-center gap-1">
                  <span>Tiêu đề bài viết</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-neutral-400 font-medium">
                  {title.length}/120
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                maxLength={120}
                placeholder="Tiêu đề bài viết (Ví dụ: Cây cà chua bi 15 ngày tuổi bị xoắn lá nhẹ, xin kinh nghiệm khắc phục."
                required
                className="w-full bg-[#f8faf8] border border-neutral-200/80 rounded-xl px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </CardContent>
          </Card>

          {/* Card 2: Nội dung Tiptap Rich Text Editor */}
          <Card className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
              {/* Tiptap Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {/* Bold */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                      editor?.isActive("bold")
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="In đậm (Bold)"
                  >
                    B
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`size-8 rounded-lg flex items-center justify-center italic font-serif text-sm transition-colors cursor-pointer ${
                      editor?.isActive("italic")
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="In nghiêng (Italic)"
                  >
                    I
                  </button>

                  <div className="h-4 w-px bg-neutral-200 mx-1" />

                  {/* Heading 1 */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-2 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                      editor?.isActive("heading", { level: 1 })
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="Tiêu đề cấp 1 (H1)"
                  >
                    H1
                  </button>

                  {/* Heading 2 */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                      editor?.isActive("heading", { level: 2 })
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="Tiêu đề cấp 2 (H2)"
                  >
                    H2
                  </button>

                  {/* Heading 3 */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-2 h-8 rounded-lg flex items-center justify-center font-semibold text-xs transition-colors cursor-pointer ${
                      editor?.isActive("heading", { level: 3 })
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="Tiêu đề cấp 3"
                  >
                    H3
                  </button>

                  <div className="h-4 w-px bg-neutral-200 mx-1" />

                  {/* Blockquote */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    className={`size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      editor?.isActive("blockquote")
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="Trích dẫn (Quote)"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_quote</span>
                  </button>

                  {/* Bullet list */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      editor?.isActive("bulletList")
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="Danh sách gạch đầu dòng"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  </button>

                  {/* Numbered list */}
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      editor?.isActive("orderedList")
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title="Danh sách số thứ tự"
                  >
                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                  </button>

                  <div className="h-4 w-px bg-neutral-200 mx-1" />

                  {/* Link icon */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Nhập liên kết web (URL):")
                      if (url) {
                        editor?.chain().focus().insertContent(` ${url} `).run()
                      }
                    }}
                    className="size-8 rounded-lg flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Chèn liên kết"
                  >
                    <span className="material-symbols-outlined text-[18px]">link</span>
                  </button>

                  {/* Image icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-8 rounded-lg flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Thêm hình ảnh"
                  >
                    <span className="material-symbols-outlined text-[18px]">image</span>
                  </button>

                  {/* Emoji quick buttons */}
                  <div className="flex items-center gap-1">
                    {["🌱", "🍅", "🌸", "🌿", "💧"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handleInsertEmoji(em)}
                        className="size-7 rounded-md hover:bg-neutral-100 flex items-center justify-center text-sm cursor-pointer transition-colors"
                        title={`Chèn biểu tượng ${em}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-save indicator matching screenshot */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Tự động lưu lúc {autoSaveTime}</span>
                </div>
              </div>

              {/* Tiptap Editor Content Area */}
              <div className="min-h-[160px] py-1 text-sm text-neutral-800 cursor-text">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: 3. Hình ảnh mầm cây thực tế */}
          <Card className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-heading font-bold text-base text-neutral-800 flex items-center gap-1.5">
                    <span>3. Hình ảnh mầm cây thực tế</span>
                    <span className="text-xs font-normal text-neutral-400">(Không bắt buộc)</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Đính kèm hình ảnh mầm cây của bạn nếu có (tối đa 5 ảnh). Nếu không có ảnh, bài viết vẫn đăng bình thường.
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded-full border-none shrink-0"
                >
                  {images.length} / 5 ảnh
                </Badge>
              </div>

              {/* Images Grid matching screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs bg-neutral-100 select-none"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Badges / Buttons */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                      {idx === 0 ? (
                        <span className="bg-black/75 backdrop-blur-xs text-amber-300 font-semibold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <span>★</span>
                          <span>Ảnh bìa chính</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="bg-white/90 hover:bg-white text-neutral-800 font-medium text-[11px] px-2.5 py-1 rounded-md shadow-sm transition-all cursor-pointer"
                        >
                          Đặt làm bìa
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="size-7 rounded-md bg-white/90 hover:bg-red-50 hover:text-red-600 text-neutral-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    {/* Bottom File Information Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white flex items-center justify-between text-xs z-10">
                      <span className="truncate max-w-[130px] font-mono text-[11px] opacity-90">
                        {img.name}
                      </span>
                      <span className="text-[11px] font-mono opacity-80 shrink-0">
                        {img.size}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Upload Dropzone Card (matching screenshot dashed box) */}
                {images.length < 5 && (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`aspect-square border-2 border-dashed border-neutral-300 hover:border-primary/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all bg-neutral-50/50 hover:bg-emerald-50/30 group ${
                      isUploading ? "opacity-60 pointer-events-none cursor-wait" : "cursor-pointer"
                    }`}
                  >
                    <div className="size-11 rounded-full bg-neutral-100 group-hover:bg-primary/10 flex items-center justify-center text-neutral-500 group-hover:text-primary transition-colors mb-2">
                      {isUploading ? (
                        <span className="material-symbols-outlined text-[24px] animate-spin text-primary">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-neutral-800 group-hover:text-primary transition-colors">
                      {isUploading ? "Đang tải ảnh lên..." : "Tải thêm ảnh"}
                    </span>
                    <span className="text-xs text-neutral-400 mt-1 max-w-[150px] leading-tight">
                      {isUploading
                        ? "Đang lưu trữ trên Supabase..."
                        : "Kéo thả hoặc bấm để chọn ảnh (PNG, JPG)"}
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                onChange={handleFilesSelected}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting || isUploading}
              className="rounded-full px-5 py-2 text-xs font-semibold border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-full px-7 py-2 text-xs font-semibold bg-[#183d2c] hover:bg-[#112d20] text-white shadow-md transition-all cursor-pointer h-auto"
            >
              {isSubmitting
                ? "Đang lưu bài viết..."
                : isUploading
                ? "Đang tải ảnh..."
                : postToEdit
                ? "Lưu Thay Đổi"
                : "Đăng Bài Viết"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
