import { z } from "zod"

export const orderCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Họ và tên không được để trống")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  email: z
    .string()
    .trim()
    .min(1, "Email không được để trống")
    .email("Địa chỉ email không đúng định dạng (VD: example@gmail.com)"),
  address: z
    .string()
    .trim()
    .min(1, "Địa chỉ nhận hàng không được để trống")
    .min(5, "Vui lòng nhập địa chỉ cụ thể (số nhà, đường, phường, quận...)"),
  note: z.string().trim().optional(),
})

export type OrderFormData = z.infer<typeof orderCustomerSchema>
