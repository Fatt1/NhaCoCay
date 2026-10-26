export type HandbookStepStatus = "completed" | "in_progress" | "upcoming"

export interface HandbookStep {
  stepNumber: number // 1 đến 6
  description: string
  status: HandbookStepStatus
}

export interface PlantDiary {
  id: string
  userId: string
  plantName: string
  coverImage: string
  startDate: string
  handbookSteps: HandbookStep[]
  createdAt: string
  updatedAt: string
}

export interface DiaryPost {
  id: string
  diaryId: string
  userId: string
  authorName: string
  title: string
  content: string
  coverImage?: string
  images?: string[]
  likesCount: number
  commentsCount: number
  createdAt: string
}

export interface PostComment {
  id: string
  postId: string
  userId: string
  authorName: string
  content: string
  likesCount: number
  parentId?: string | null // null nếu là comment gốc, chứa ID của comment cha nếu là trả lời
  replyToAuthorName?: string // Tên người được trả lời (ví dụ: "Nguyễn An")
  replyToUserId?: string // User ID của người được trả lời
  repliesCount?: number // Số lượt trả lời cho comment này
  replies?: PostComment[] // Danh sách các câu trả lời con (dùng khi render trên giao diện)
  createdAt: string
}
