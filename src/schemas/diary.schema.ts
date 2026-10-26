import { z } from "zod"

export const createDiarySchema = z.object({
  plantName: z.string().trim().min(2, "Tên cây phải có ít nhất 2 ký tự"),
  coverImage: z.string().url("Ảnh bìa nhật ký không hợp lệ").optional().or(z.literal("")),
  startDate: z.string().min(1, "Ngày bắt đầu gieo trồng không được để trống"),
})

export type CreateDiaryFormData = z.infer<typeof createDiarySchema>

export const createPostSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề bài viết phải có ít nhất 3 ký tự").max(120, "Tiêu đề tối đa 120 ký tự"),
  content: z.string().trim().min(5, "Nội dung bài viết phải có ít nhất 5 ký tự"),
  coverImage: z.string().url("Ảnh bìa không hợp lệ").optional().or(z.literal("")),
  images: z.array(z.string().url()).max(5, "Tối đa 5 hình ảnh"),
})

export type CreatePostFormData = z.infer<typeof createPostSchema>

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Nội dung bình luận không được để trống"),
  parentId: z.string().optional().nullable(),
  replyToAuthorName: z.string().optional(),
  replyToUserId: z.string().optional(),
})

export type CreateCommentFormData = z.infer<typeof createCommentSchema>
