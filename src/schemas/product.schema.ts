import { z } from "zod"

export const kitComponentSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề thành phần không được để trống"),
  description: z.string().trim().min(1, "Mô tả thành phần không được để trống"),
})

export const specificationItemSchema = z.object({
  label: z.string().trim().min(1, "Nhãn thuộc tính không được để trống"),
  value: z.string().trim().min(1, "Giá trị thông số không được để trống"),
})

export const productSpecificationsSchema = z.object({
  germinationRate: specificationItemSchema,
  germinationTime: specificationItemSchema,
  floweringTime: specificationItemSchema,
  plantCareNotes: specificationItemSchema,
})

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
    shortDescription: z.string().trim().min(5, "Mô tả ngắn phải có ít nhất 5 ký tự"),
    description: z.string().trim().min(10, "Mô tả chi tiết phải có ít nhất 10 ký tự"),
    originalPrice: z.coerce.number().positive("Giá niêm yết gốc phải lớn hơn 0"),
    salePrice: z.coerce.number().positive("Giá ưu đãi phải lớn hơn 0"),
    stockQuantity: z.coerce.number().int().nonnegative("Số lượng kho phải là số nguyên không âm"),
    coverImage: z.string().trim().min(1, "Vui lòng nhập hoặc chọn ảnh bìa sản phẩm"),
    images: z.array(z.string().trim().min(1, "URL ảnh không hợp lệ")).min(1, "Cần ít nhất 1 hình ảnh sản phẩm"),
    kitComponents: z.array(kitComponentSchema).min(1, "Cần ít nhất 1 thành phần trong bộ kit"),
    specifications: productSpecificationsSchema,
  })
  .refine((data) => data.salePrice <= data.originalPrice, {
    message: "Giá ưu đãi / khuyến mãi không được lớn hơn giá gốc",
    path: ["salePrice"],
  })

export type ProductFormData = z.infer<typeof productSchema>
