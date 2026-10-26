import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { PlantDiary, HandbookStep, HandbookStepStatus } from "@/types"

const DIARIES_COLLECTION = "plant_diaries"

/**
 * 6 bước cẩm nang sổ tay mặc định theo thiệp giấy kraft Nhà Có Cây (khớp với hình mẫu)
 */
export const DEFAULT_HANDBOOK_STEPS: HandbookStep[] = [
  {
    stepNumber: 1,
    description: "Ngâm hạt giống trong nước ấm pha lạnh theo tỷ lệ 2:3 khoảng 4-8 tiếng",
    status: "completed",
  },
  {
    stepNumber: 2,
    description: "Rửa sạch hạt và để ráo",
    status: "completed",
  },
  {
    stepNumber: 3,
    description:
      "Đặt viên nén vào chậu giấy, ngâm vào nước 5-10 phút, sau khi nở ra, gieo hạt giống vào lỗ nhỏ giữa bầu ươm",
    status: "completed",
  },
  {
    stepNumber: 4,
    description: "Tưới nước 2-3 lần/ngày, tránh tưới quá nhiều",
    status: "in_progress",
  },
  {
    stepNumber: 5,
    description: "Đặt chậu ở nơi thoáng mát, có ánh sáng nhưng tránh ánh nắng trực tiếp",
    status: "in_progress",
  },
  {
    stepNumber: 6,
    description:
      "Sau khi cây ra mầm (lá non) khoảng 5-8cm, sang chậu và trồng ra vườn, sau đó thu hoạch",
    status: "upcoming",
  },
]

/**
 * Tạo nhật ký mới cho người dùng lưu trực tiếp vào Firestore DB
 */
export const createDiary = async (
  userId: string,
  data: {
    plantName: string
    coverImage?: string
    startDate: string
    customSteps?: HandbookStep[]
  }
): Promise<PlantDiary> => {
  const newDocRef = doc(collection(db, DIARIES_COLLECTION))
  const now = new Date().toISOString()

  // Các bước khởi tạo mặc định (copy từ DEFAULT_HANDBOOK_STEPS)
  const initialSteps: HandbookStep[] = (data.customSteps || DEFAULT_HANDBOOK_STEPS).map(
    (step, idx) => ({
      stepNumber: step.stepNumber || idx + 1,
      description: step.description,
      status: idx === 0 ? "in_progress" : "upcoming",
    })
  )

  const newDiary: PlantDiary = {
    id: newDocRef.id,
    userId: userId || "guest_user",
    plantName: data.plantName,
    coverImage:
      data.coverImage ||
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
    startDate: data.startDate,
    handbookSteps: initialSteps,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(newDocRef, newDiary)
  return newDiary
}

/**
 * Xem danh sách tất cả nhật ký của người dùng từ Firestore DB theo userId
 */
export const getUserDiaries = async (userId: string): Promise<PlantDiary[]> => {
  if (!userId) return []

  const diariesRef = collection(db, DIARIES_COLLECTION)
  const q = query(diariesRef, where("userId", "==", userId))
  const snapshot = await getDocs(q)

  const list = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as PlantDiary)
  )

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return list
}

/**
 * Xem chi tiết 1 nhật ký cây từ Firestore DB
 */
export const getDiaryById = async (diaryId: string): Promise<PlantDiary | null> => {
  const docRef = doc(db, DIARIES_COLLECTION, diaryId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PlantDiary
  }
  return null
}

/**
 * Cập nhật trạng thái một bước trong 6 bước sổ tay của cây trên Firestore DB
 */
export const updateDiaryStepStatus = async (
  diaryId: string,
  stepNumber: number,
  status: HandbookStepStatus
): Promise<PlantDiary | null> => {
  const diary = await getDiaryById(diaryId)
  if (!diary) return null

  const updatedSteps = diary.handbookSteps.map((step) =>
    step.stepNumber === stepNumber ? { ...step, status } : step
  )
  const updatedAt = new Date().toISOString()

  const docRef = doc(db, DIARIES_COLLECTION, diaryId)
  await updateDoc(docRef, {
    handbookSteps: updatedSteps,
    updatedAt,
  })

  return {
    ...diary,
    handbookSteps: updatedSteps,
    updatedAt,
  }
}

/**
 * Xóa 1 nhật ký cây trên Firestore DB
 */
export const deleteDiary = async (diaryId: string): Promise<void> => {
  const docRef = doc(db, DIARIES_COLLECTION, diaryId)
  await deleteDoc(docRef)
}
