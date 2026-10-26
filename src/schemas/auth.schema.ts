import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email không được để trống").email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().trim().min(1, "Email không được để trống").email("Email không đúng định dạng"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không đúng định dạng Việt Nam"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export type RegisterFormData = z.infer<typeof registerSchema>
