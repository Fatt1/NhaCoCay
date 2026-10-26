import { supabase, SUPABASE_BUCKET } from "@/config/supabase"

/**
 * Lấy đường dẫn relative path bên trong bucket từ Supabase Public URL
 * Ví dụ: https://.../storage/v1/object/public/nhacocay/products/prod_123.jpg -> products/prod_123.jpg
 */
export const getPathFromPublicUrl = (
  url: string,
  bucket: string = SUPABASE_BUCKET
): string | null => {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index !== -1) {
    return decodeURIComponent(url.substring(index + marker.length))
  }
  // Nếu url chính là path tương đối
  if (url.startsWith("products/") || url.startsWith("diaries/") || url.startsWith("temp/")) {
    return url
  }
  return null
}

/**
 * Upload một file ảnh sản phẩm trực tiếp vào thư mục products/ trên Supabase Storage
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
  const path = `products/prod_${timestamp}_${randomStr}_${cleanName}`

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

  if (error) {
    console.error("Lỗi upload file lên Supabase storage:", error)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Upload file tương thích ngược
 */
export const uploadFile = async (file: File, path?: string): Promise<string> => {
  if (!path) {
    return uploadProductImage(file)
  }

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

  if (error) {
    console.error("Lỗi upload file lên Supabase:", error)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Xóa một file ảnh trên Supabase Storage
 */
export const deleteStorageFile = async (urlOrPath: string): Promise<void> => {
  const path = getPathFromPublicUrl(urlOrPath) || urlOrPath
  if (!path) return

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path])
  if (error) {
    console.error("Lỗi khi xóa file trên Supabase Storage:", error)
  }
}

/**
 * Xóa danh sách các file ảnh trên Supabase Storage (dùng khi hủy form để dọn dẹp)
 */
export const deleteStorageFiles = async (urls: string[]): Promise<void> => {
  if (!urls || urls.length === 0) return

  const paths = urls
    .map((url) => getPathFromPublicUrl(url))
    .filter((path): path is string => !!path)

  if (paths.length === 0) return

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove(paths)
  if (error) {
    console.error("Lỗi khi dọn dẹp file trên Supabase Storage:", error)
  }
}

/**
 * Upload nhiều ảnh sản phẩm
 */
export const uploadProductImages = async (files: File[], productId: string): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "jpg"
    const path = `products/${productId}/img_${timestamp}_${index}.${extension}`
    return uploadFile(file, path)
  })
  return Promise.all(uploadPromises)
}

/**
 * Upload một file ảnh bài viết cộng đồng lên Supabase Storage
 */
export const uploadPostImage = async (
  file: File,
  userId: string = "community"
): Promise<string> => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
  const path = `posts/${userId}/img_${timestamp}_${randomStr}_${cleanName}`

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

  if (error) {
    console.error("Lỗi upload ảnh bài viết lên Supabase:", error)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Upload ảnh bài viết nhật ký mầm cây
 */
export const uploadPostImages = async (
  files: File[],
  userId: string,
  diaryId: string,
  postId: string
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "jpg"
    const path = `diaries/${userId}/${diaryId}/posts/${postId}/img_${timestamp}_${index}.${extension}`
    return uploadFile(file, path)
  })
  return Promise.all(uploadPromises)
}
