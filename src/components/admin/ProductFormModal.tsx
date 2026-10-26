import React, { useState, useEffect, useRef } from "react"
import { productSchema } from "@/schemas"
import type { Product, KitComponent } from "@/types"
import {
  uploadProductImage,
  deleteStorageFile,
  deleteStorageFiles,
} from "@/services"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { TiptapEditor } from "@/components/admin/TiptapEditor"
import {
  UploadCloud,
  Star,
  Trash2,
  Plus,
  Sparkles,
  Layers,
  Activity,
  DollarSign,
  AlertCircle,
  Check,
  Eye,
  Pencil,
} from "lucide-react"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>
  initialData?: Product | null
}

const DEFAULT_KIT_COMPONENTS: KitComponent[] = [
  { title: "Hạt giống F1", description: "1 gói hạt giống thuần chủng tuyển chọn (15-20 hạt)" },
  { title: "Viên nén xơ dừa", description: "2 viên nén xơ dừa hữu cơ ép giàu dinh dưỡng" },
  { title: "Chậu đất nung/gốm", description: "1 chậu gốm mộc nung thủ công thoát nước tốt" },
  { title: "Que gỗ định vị", description: "Que gỗ định vị độ sâu và bảng ghi ngày gieo mầm" },
  { title: "Cẩm nang gieo trồng", description: "1 cẩm nang hướng dẫn chi tiết 6 bước chăm sóc" },
]

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  // Basic Info
  const [name, setName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")

  // Price & Stock
  const [originalPrice, setOriginalPrice] = useState<string>("")
  const [salePrice, setSalePrice] = useState<string>("")
  const [stockQuantity, setStockQuantity] = useState<string>("")

  // Images (Supabase Storage URLs)
  const [images, setImages] = useState<string[]>([])
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Kit Components
  const [kitComponents, setKitComponents] = useState<KitComponent[]>(DEFAULT_KIT_COMPONENTS)
  const [newCompTitle, setNewCompTitle] = useState("")
  const [newCompDesc, setNewCompDesc] = useState("")
  const [isAddingComponent, setIsAddingComponent] = useState(false)

  // Edit Kit Component state
  const [editingCompIndex, setEditingCompIndex] = useState<number | null>(null)
  const [editCompTitle, setEditCompTitle] = useState("")
  const [editCompDesc, setEditCompDesc] = useState("")

  // Specifications
  const [germinationRate, setGerminationRate] = useState("")
  const [germinationTime, setGerminationTime] = useState("")
  const [floweringTime, setFloweringTime] = useState("")
  const [plantCareNotes, setPlantCareNotes] = useState("")

  // Errors & Loading
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setShortDescription(initialData.shortDescription || "")
      setDescription(initialData.description || "")
      setOriginalPrice(initialData.originalPrice?.toString() || "")
      setSalePrice(initialData.salePrice?.toString() || "")
      setStockQuantity(initialData.stockQuantity?.toString() || "")
      setImages(
        initialData.images && initialData.images.length > 0
          ? initialData.images
          : [initialData.coverImage].filter(Boolean)
      )
      setKitComponents(
        initialData.kitComponents && initialData.kitComponents.length > 0
          ? initialData.kitComponents
          : DEFAULT_KIT_COMPONENTS
      )
      setGerminationRate(initialData.specifications?.germinationRate?.value || "> 95%")
      setGerminationTime(initialData.specifications?.germinationTime?.value || "5 - 7 ngày")
      setFloweringTime(initialData.specifications?.floweringTime?.value || "35 - 45 ngày")
      setPlantCareNotes(initialData.specifications?.plantCareNotes?.value || "Tưới gốc & đón nắng nhẹ 4h/ngày")
    } else {
      setName("")
      setShortDescription("")
      setDescription("")
      setOriginalPrice("")
      setSalePrice("")
      setStockQuantity("")
      setImages([])
      setKitComponents(DEFAULT_KIT_COMPONENTS)
      setGerminationRate("> 95%")
      setGerminationTime("5 - 7 ngày")
      setFloweringTime("35 - 45 ngày")
      setPlantCareNotes("Tưới gốc & đón nắng nhẹ 4h/ngày")
    }
    setErrors({})
    setIsAddingComponent(false)
    setNewCompTitle("")
    setNewCompDesc("")
    setEditingCompIndex(null)
    setEditCompTitle("")
    setEditCompDesc("")
    setNewlyUploadedUrls([])
  }, [initialData, isOpen])

  if (!isOpen) return null

  // Handle close and cleanup any uncommitted uploaded images
  const handleCloseModal = () => {
    if (newlyUploadedUrls.length > 0) {
      deleteStorageFiles(newlyUploadedUrls).catch(console.error)
      setNewlyUploadedUrls([])
    }
    onClose()
  }

  // Calculate discount percentage
  const numOriginalPrice = parseFloat(originalPrice) || 0
  const numSalePrice = parseFloat(salePrice) || 0
  const discountPercent =
    numOriginalPrice > 0 && numSalePrice > 0 && numSalePrice < numOriginalPrice
      ? Math.round(((numOriginalPrice - numSalePrice) / numOriginalPrice) * 100)
      : 0

  // Upload directly to Supabase Storage in products folder
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 8) {
      setErrors((prev) => ({ ...prev, images: "Tối đa 8 hình ảnh cho mỗi sản phẩm" }))
      return
    }

    try {
      setIsUploading(true)
      const uploadTasks = Array.from(files).map(async (file) => {
        return await uploadProductImage(file)
      })

      const uploadedUrls = await Promise.all(uploadTasks)
      setImages((prev) => [...prev, ...uploadedUrls])
      setNewlyUploadedUrls((prev) => [...prev, ...uploadedUrls])
      setErrors((prev) => {
        const next = { ...prev }
        delete next.images
        delete next.coverImage
        return next
      })
    } catch (err) {
      console.error("Lỗi upload ảnh lên Supabase Storage:", err)
      setErrors((prev) => ({
        ...prev,
        images: "Có lỗi khi tải ảnh lên Supabase Storage. Vui lòng kiểm tra kết nối!",
      }))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    const targetImg = images[index]
    if (targetImg && newlyUploadedUrls.includes(targetImg)) {
      deleteStorageFile(targetImg).catch(console.error)
      setNewlyUploadedUrls((prev) => prev.filter((u) => u !== targetImg))
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return
    const target = images[index]
    const remaining = images.filter((_, idx) => idx !== index)
    setImages([target, ...remaining])
  }

  const handleAddComponent = () => {
    if (!newCompTitle.trim()) return
    setKitComponents((prev) => [
      ...prev,
      { title: newCompTitle.trim(), description: newCompDesc.trim() || "Thành phần chuẩn trong bộ kit" },
    ])
    setNewCompTitle("")
    setNewCompDesc("")
    setIsAddingComponent(false)
  }

  const handleStartEditComponent = (index: number) => {
    setEditingCompIndex(index)
    setEditCompTitle(kitComponents[index].title)
    setEditCompDesc(kitComponents[index].description)
  }

  const handleSaveEditComponent = () => {
    if (editingCompIndex === null) return
    if (!editCompTitle.trim()) return
    setKitComponents((prev) =>
      prev.map((item, idx) =>
        idx === editingCompIndex
          ? {
              title: editCompTitle.trim(),
              description: editCompDesc.trim() || item.description,
            }
          : item
      )
    )
    setEditingCompIndex(null)
    setEditCompTitle("")
    setEditCompDesc("")
  }

  const handleCancelEditComponent = () => {
    setEditingCompIndex(null)
    setEditCompTitle("")
    setEditCompDesc("")
  }

  const handleRemoveComponent = (index: number) => {
    setKitComponents((prev) => prev.filter((_, idx) => idx !== index))
    if (editingCompIndex === index) {
      setEditingCompIndex(null)
      setEditCompTitle("")
      setEditCompDesc("")
    } else if (editingCompIndex !== null && editingCompIndex > index) {
      setEditingCompIndex(editingCompIndex - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const coverImg = images[0] || ""

    const rawFormData = {
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      originalPrice: numOriginalPrice,
      salePrice: numSalePrice,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      coverImage: coverImg,
      images: images,
      kitComponents: kitComponents,
      specifications: {
        germinationRate: {
          label: "Tỷ lệ nảy mầm",
          value: germinationRate.trim(),
        },
        germinationTime: {
          label: "Thời gian nảy mầm",
          value: germinationTime.trim(),
        },
        floweringTime: {
          label: "Thời gian ra hoa",
          value: floweringTime.trim(),
        },
        plantCareNotes: {
          label: "Lưu ý cho cây",
          value: plantCareNotes.trim(),
        },
      },
    }

    // Validate with Zod
    const result = productSchema.safeParse(rawFormData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".")
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(result.data)
      setNewlyUploadedUrls([]) // Đã lưu thành công, không dọn dẹp
      onClose()
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err)
      setErrors({ form: "Có lỗi xảy ra khi lưu sản phẩm lên Firestore, vui lòng thử lại!" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 w-screen h-screen max-w-none max-h-none sm:max-w-none rounded-none sm:rounded-none border-none p-0 gap-0 bg-background text-foreground flex flex-col overflow-hidden data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 duration-150">
        {/* Sticky Header with solid background */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-card sticky top-0 z-10 shrink-0">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between pr-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs border border-primary/20">
                🌱
              </div>
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2.5">
                  <DialogTitle className="text-base md:text-lg font-heading font-extrabold text-foreground truncate">
                    {initialData ? "Chỉnh Sửa Bộ Kit Trồng Cây" : "Thêm Mới Bộ Kit Trồng Cây"}
                  </DialogTitle>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30 hidden sm:inline-flex">
                    {initialData ? "Chế độ sửa" : "Tạo mới"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Tải ảnh lên Firebase Storage, chỉnh sửa các món trong bộ kit, thông số sinh trưởng và giá bán
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body with solid opaque card container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col bg-muted/20">
          <div className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
            {errors.form && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5 font-medium shadow-2xs">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Thông Tin Cơ Bản + Upload Ảnh + Thành Phần + Specs (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Card 1: Thông Tin Cơ Bản */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary" />
                      <span>Thông Tin Cơ Bản</span>
                    </h3>
                    <span className="text-[11px] text-muted-foreground">* Bắt buộc điền</span>
                  </div>

                  {/* Tên sản phẩm */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Tên sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                      }}
                      placeholder="Ví dụ: Bộ Kit Trồng Cà Chua Bi Cherry Đỏ Ban Công"
                      className={`rounded-lg bg-background text-xs h-9.5 ${
                        errors.name ? "border-rose-500 ring-1 ring-rose-500" : "border-border"
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                  </div>

                  {/* Mô tả ngắn */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Mô tả ngắn <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {shortDescription.length}/200
                      </span>
                    </div>
                    <Textarea
                      value={shortDescription}
                      onChange={(e) => {
                        setShortDescription(e.target.value)
                        if (errors.shortDescription)
                          setErrors((prev) => ({ ...prev, shortDescription: "" }))
                      }}
                      placeholder="Trải nghiệm tự tay gieo mầm từng hạt giống cà chua bi thơm ngọt ngay góc ban công nhỏ..."
                      rows={2}
                      maxLength={250}
                      className={`rounded-lg bg-background text-xs resize-none ${
                        errors.shortDescription ? "border-rose-500 ring-1 ring-rose-500" : "border-border"
                      }`}
                    />
                    {errors.shortDescription && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.shortDescription}</p>
                    )}
                  </div>

                  {/* Mô tả chi tiết dùng Tiptap */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Mô tả chi tiết &amp; Hướng dẫn gieo trồng (Tiptap) <span className="text-rose-500">*</span>
                      </label>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Rich Text Editor
                      </Badge>
                    </div>

                    <TiptapEditor
                      content={description}
                      onChange={(html) => {
                        setDescription(html)
                        if (errors.description)
                          setErrors((prev) => ({ ...prev, description: "" }))
                      }}
                      placeholder="Nhập nội dung các bước gieo hạt, chuẩn bị giá thể xơ dừa, ánh sáng và chăm sóc mầm cây..."
                    />
                    {errors.description && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Card 2: Upload Ảnh Trực Tiếp Lên Supabase Storage */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <UploadCloud className="size-3.5 text-primary" />
                        <span>Hình Ảnh Sản Phẩm (Supabase Storage)</span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Ảnh tải lên được lưu trữ trực tiếp tại thư mục <strong>products/</strong> trên Supabase Storage. Ảnh đầu tiên là <strong>Ảnh Bìa</strong>.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-bold">
                      {images.length}/8 Ảnh
                    </Badge>
                  </div>

                  {/* File Upload Box */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading || images.length >= 8}
                    />

                    <div
                      onClick={() => {
                        if (!isUploading && images.length < 8) {
                          fileInputRef.current?.click()
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                        isUploading
                          ? "bg-muted/50 border-border pointer-events-none"
                          : images.length >= 8
                          ? "bg-muted/50 border-border opacity-60 cursor-not-allowed"
                          : "bg-muted/20 hover:bg-muted/50 border-border hover:border-primary hover:shadow-xs"
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                          <span className="material-symbols-outlined text-3xl animate-spin">
                            progress_activity
                          </span>
                          <span className="text-xs font-bold">Đang tải ảnh lên Firebase Storage...</span>
                        </div>
                      ) : (
                        <>
                          <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                            <UploadCloud className="size-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-bold text-foreground">
                              Nhấp để chọn ảnh từ máy tính hoặc kéo thả vào đây
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Hỗ trợ định dạng JPG, PNG, WEBP (Tự động lưu trữ trên Firebase Cloud)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {errors.images && <p className="text-[11px] text-rose-500 font-medium">{errors.images}</p>}
                  {errors.coverImage && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.coverImage}</p>
                  )}

                  {/* Danh sách ảnh đã upload */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted shadow-2xs"
                        >
                          <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Star className="size-2.5 fill-current" />
                              <span>Ảnh Bìa</span>
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(idx)}
                                title="Đặt làm ảnh bìa"
                                className="size-8 rounded-full bg-white text-foreground flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer shadow-sm transition-transform active:scale-90"
                              >
                                <Star className="size-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Xóa ảnh này"
                              className="size-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 cursor-pointer shadow-sm transition-transform active:scale-90"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Thành Phần Đi Kèm Trong Bộ Kit */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Layers className="size-3.5 text-primary" />
                        <span>Thành Phần Đi Kèm Trong Bộ Kit</span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Các phụ kiện đi kèm trọn gói trong bộ kit giao tới khách hàng ({kitComponents.length} món).
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingComponent(true)
                        setEditingCompIndex(null)
                      }}
                      className="rounded-lg text-xs h-8 cursor-pointer gap-1.5 border-border hover:bg-muted"
                    >
                      <Plus className="size-3.5" />
                      <span>Thêm Món</span>
                    </Button>
                  </div>

                  {/* Form thêm món mới */}
                  {isAddingComponent && (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-primary/30 flex flex-col gap-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Plus className="size-3.5" />
                          <span>Thêm thành phần mới vào bộ kit</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">Nhấn Lưu hoặc Enter để hoàn tất</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="text"
                          value={newCompTitle}
                          onChange={(e) => setNewCompTitle(e.target.value)}
                          placeholder="Tên phụ kiện (ví dụ: Bình tưới phun sương mini)"
                          className="rounded-lg text-xs bg-background h-9 border-border sm:w-1/3"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddComponent()
                            } else if (e.key === "Escape") {
                              setIsAddingComponent(false)
                            }
                          }}
                        />
                        <Input
                          type="text"
                          value={newCompDesc}
                          onChange={(e) => setNewCompDesc(e.target.value)}
                          placeholder="Mô tả phụ kiện (ví dụ: 1 bình tưới vòi sen mini 250ml)"
                          className="rounded-lg text-xs bg-background h-9 border-border sm:w-2/3"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddComponent()
                            } else if (e.key === "Escape") {
                              setIsAddingComponent(false)
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingComponent(false)
                            setNewCompTitle("")
                            setNewCompDesc("")
                          }}
                          className="text-xs h-8 cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddComponent}
                          disabled={!newCompTitle.trim()}
                          className="rounded-lg text-xs h-8 cursor-pointer font-bold gap-1"
                        >
                          <Check className="size-3.5" />
                          <span>Lưu Phụ Kiện</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Danh sách thành phần */}
                  <div className="flex flex-col gap-2">
                    {kitComponents.map((comp, idx) => {
                      const isEditing = editingCompIndex === idx

                      if (isEditing) {
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-primary/5 border border-primary/40 flex flex-col gap-2.5 shadow-xs transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <Pencil className="size-3.5" />
                                <span>Chỉnh sửa món #{idx + 1}</span>
                              </span>
                              <span className="text-[11px] text-muted-foreground">Nhấn Lưu hoặc Enter để hoàn tất</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                type="text"
                                value={editCompTitle}
                                onChange={(e) => setEditCompTitle(e.target.value)}
                                placeholder="Tên thành phần"
                                className="rounded-lg text-xs bg-background h-9 border-border sm:w-1/3"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleSaveEditComponent()
                                  } else if (e.key === "Escape") {
                                    handleCancelEditComponent()
                                  }
                                }}
                              />
                              <Input
                                type="text"
                                value={editCompDesc}
                                onChange={(e) => setEditCompDesc(e.target.value)}
                                placeholder="Mô tả chi tiết thành phần"
                                className="rounded-lg text-xs bg-background h-9 border-border sm:w-2/3"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleSaveEditComponent()
                                  } else if (e.key === "Escape") {
                                    handleCancelEditComponent()
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEditComponent}
                                className="text-xs h-7.5 px-3 cursor-pointer text-muted-foreground hover:text-foreground"
                              >
                                Hủy
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveEditComponent}
                                disabled={!editCompTitle.trim()}
                                className="rounded-lg text-xs h-7.5 px-3.5 cursor-pointer font-bold gap-1.5"
                              >
                                <Check className="size-3.5" />
                                <span>Lưu Chỉnh Sửa</span>
                              </Button>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={idx}
                          className="group flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/70 gap-3 hover:bg-muted/40 hover:border-primary/40 transition-all"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="size-5.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {comp.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                {comp.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingComponent(false)
                                handleStartEditComponent(idx)
                              }}
                              className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center cursor-pointer transition-colors"
                              title="Chỉnh sửa món này"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(idx)}
                              className="size-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors"
                              title="Xóa món này"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Card 4: Thông Số Sinh Trưởng & Chăm Sóc */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Activity className="size-3.5 text-primary" />
                        <span>Thông Số Sinh Trưởng &amp; Chăm Sóc (Specifications)</span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Thông số hiển thị chuẩn hóa tại trang chi tiết sản phẩm.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      Bắt buộc
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tỷ lệ nảy mầm */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Tỷ lệ nảy mầm <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={germinationRate}
                        onChange={(e) => setGerminationRate(e.target.value)}
                        placeholder="Ví dụ: > 95% (95% - 98%)"
                        className="rounded-lg bg-background text-xs h-9 border-border"
                      />
                      {errors["specifications.germinationRate.value"] && (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {errors["specifications.germinationRate.value"]}
                        </p>
                      )}
                    </div>

                    {/* Thời gian nảy mầm */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Thời gian nảy mầm <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={germinationTime}
                        onChange={(e) => setGerminationTime(e.target.value)}
                        placeholder="Ví dụ: 5 - 7 ngày"
                        className="rounded-lg bg-background text-xs h-9 border-border"
                      />
                      {errors["specifications.germinationTime.value"] && (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {errors["specifications.germinationTime.value"]}
                        </p>
                      )}
                    </div>

                    {/* Thời gian ra hoa */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Thời gian ra hoa / thu hoạch <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={floweringTime}
                        onChange={(e) => setFloweringTime(e.target.value)}
                        placeholder="Ví dụ: 35 - 45 ngày"
                        className="rounded-lg bg-background text-xs h-9 border-border"
                      />
                      {errors["specifications.floweringTime.value"] && (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {errors["specifications.floweringTime.value"]}
                        </p>
                      )}
                    </div>

                    {/* Lưu ý cho cây */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Lưu ý cho cây <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={plantCareNotes}
                        onChange={(e) => setPlantCareNotes(e.target.value)}
                        placeholder="Ví dụ: Tưới gốc & đón nắng nhẹ 4h/ngày"
                        className="rounded-lg bg-background text-xs h-9 border-border"
                      />
                      {errors["specifications.plantCareNotes.value"] && (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {errors["specifications.plantCareNotes.value"]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Giá & Kho Hàng + Live Card Preview (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-card rounded-xl p-5 border border-border shadow-xs flex flex-col gap-4 sticky top-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="size-3.5 text-primary" />
                      <span>Giá &amp; Kho Hàng</span>
                    </h3>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      Kinh Doanh
                    </Badge>
                  </div>

                  {/* Giá niêm yết gốc */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Giá Niêm Yết Gốc (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => {
                          setOriginalPrice(e.target.value)
                          if (errors.originalPrice)
                            setErrors((prev) => ({ ...prev, originalPrice: "" }))
                        }}
                        placeholder="220000"
                        className={`rounded-lg bg-background text-xs h-9.5 pr-8 font-semibold ${
                          errors.originalPrice ? "border-rose-500 ring-1 ring-rose-500" : "border-border"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                        ₫
                      </span>
                    </div>
                    {errors.originalPrice && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.originalPrice}</p>
                    )}
                  </div>

                  {/* Giá ưu đãi */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Giá Bán Thực Tế (VNĐ) <span className="text-rose-500">*</span>
                      </label>
                      {discountPercent > 0 && (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-extrabold px-1.5 py-0.2">
                          Tiết kiệm -{discountPercent}%
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        value={salePrice}
                        onChange={(e) => {
                          setSalePrice(e.target.value)
                          if (errors.salePrice) setErrors((prev) => ({ ...prev, salePrice: "" }))
                        }}
                        placeholder="185000"
                        className={`rounded-lg bg-background text-xs h-9.5 pr-8 font-bold text-emerald-700 ${
                          errors.salePrice ? "border-rose-500 ring-1 ring-rose-500" : "border-border"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                        ₫
                      </span>
                    </div>
                    {errors.salePrice && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.salePrice}</p>
                    )}
                  </div>

                  {/* Số lượng trong kho */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Số Lượng Trong Kho <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => {
                          setStockQuantity(e.target.value)
                          if (errors.stockQuantity)
                            setErrors((prev) => ({ ...prev, stockQuantity: "" }))
                        }}
                        placeholder="150"
                        className={`rounded-lg bg-background text-xs h-9.5 pr-14 font-semibold ${
                          errors.stockQuantity ? "border-rose-500 ring-1 ring-rose-500" : "border-border"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                        bộ kit
                      </span>
                    </div>
                    {errors.stockQuantity && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.stockQuantity}</p>
                    )}
                  </div>

                  {/* Real-time Product Card Preview */}
                  <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Eye className="size-3.5 text-primary" />
                      <span>Xem Trước Thẻ Sản Phẩm</span>
                    </span>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-3 shadow-2xs">
                      <div className="size-14 rounded-lg bg-muted overflow-hidden shrink-0 border border-border relative">
                        {images.length > 0 ? (
                          <img
                            src={images[0]}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            🌱
                          </div>
                        )}
                        {discountPercent > 0 && (
                          <span className="absolute bottom-0 right-0 bg-rose-600 text-white text-[8px] font-bold px-1 rounded-tl">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {name || "Tên bộ kit gieo mầm..."}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-extrabold text-emerald-700">
                            {numSalePrice ? `${numSalePrice.toLocaleString("vi-VN")}₫` : "---₫"}
                          </span>
                          {numOriginalPrice > numSalePrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {numOriginalPrice.toLocaleString("vi-VN")}₫
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full inline-block mt-0.5 font-medium border border-emerald-200">
                          {stockQuantity ? `Còn ${stockQuantity} bộ` : "Hết hàng"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer Controls with solid background */}
          <div className="sticky bottom-0 bg-card border-t border-border p-4 px-6 z-10 shadow-lg mt-auto shrink-0">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {initialData ? `Đang chỉnh sửa: ${initialData.name}` : "Đang tạo bộ kit mới"}
                </span>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting || isUploading}
                  className="rounded-lg px-5 text-xs h-9 cursor-pointer border-border hover:bg-muted"
                >
                  Hủy &amp; Đóng
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="rounded-lg font-bold text-xs px-6 h-9 shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>{initialData ? "Cập Nhật Bộ Kit" : "Lưu Sản Phẩm Mới"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
