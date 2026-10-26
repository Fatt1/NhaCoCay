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
  orderBy,
  increment,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import type { DiaryPost, PostComment } from "@/types"

const POSTS_COLLECTION = "posts"

/**
 * Xem danh sách tất cả bài viết cộng đồng (sắp xếp mới nhất)
 */
export const getPosts = async (): Promise<DiaryPost[]> => {
  const postsRef = collection(db, POSTS_COLLECTION)
  const q = query(postsRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as DiaryPost)
}

/**
 * Xem danh sách bài viết theo từng nhật ký cây cụ thể
 */
export const getPostsByDiary = async (diaryId: string): Promise<DiaryPost[]> => {
  const postsRef = collection(db, POSTS_COLLECTION)
  const q = query(postsRef, where("diaryId", "==", diaryId), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as DiaryPost)
}

/**
 * Xem chi tiết một bài viết theo ID
 */
export const getPostById = async (postId: string): Promise<DiaryPost | null> => {
  const docRef = doc(db, POSTS_COLLECTION, postId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as DiaryPost
}

/**
 * Thêm mới một bài viết chia sẻ mầm cây
 */
export const createPost = async (
  postData: Omit<DiaryPost, "id" | "likesCount" | "commentsCount" | "createdAt">
): Promise<DiaryPost> => {
  const newDocRef = doc(collection(db, POSTS_COLLECTION))
  const newPost: DiaryPost = {
    ...postData,
    id: newDocRef.id,
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  }

  await setDoc(newDocRef, newPost)
  return newPost
}

/**
 * Chỉnh sửa nội dung hoặc hình ảnh bài viết
 */
export const updatePost = async (
  postId: string,
  postData: Partial<Pick<DiaryPost, "title" | "content" | "coverImage" | "images">>
): Promise<void> => {
  const docRef = doc(db, POSTS_COLLECTION, postId)
  await updateDoc(docRef, postData)
}

/**
 * Xóa một bài viết
 */
export const deletePost = async (postId: string): Promise<void> => {
  const docRef = doc(db, POSTS_COLLECTION, postId)
  await deleteDoc(docRef)
}

/**
 * Thả tim / Bỏ thả tim bài viết (Tự động toggle và cập nhật likesCount)
 */
export const toggleLikePost = async (
  postId: string,
  userId: string
): Promise<{ liked: boolean }> => {
  const likeDocRef = doc(db, POSTS_COLLECTION, postId, "likes", userId)
  const postDocRef = doc(db, POSTS_COLLECTION, postId)

  const likeSnap = await getDoc(likeDocRef)

  if (likeSnap.exists()) {
    // Đã like -> bỏ like
    await deleteDoc(likeDocRef)
    await updateDoc(postDocRef, { likesCount: increment(-1) })
    return { liked: false }
  } else {
    // Chưa like -> thả tim
    await setDoc(likeDocRef, { userId, createdAt: new Date().toISOString() })
    await updateDoc(postDocRef, { likesCount: increment(1) })
    return { liked: true }
  }
}

/**
 * Kiểm tra xem user hiện tại đã thích bài viết chưa
 */
export const checkIfPostLiked = async (postId: string, userId: string): Promise<boolean> => {
  if (!userId) return false
  const likeDocRef = doc(db, POSTS_COLLECTION, postId, "likes", userId)
  const likeSnap = await getDoc(likeDocRef)
  return likeSnap.exists()
}

/**
 * Thêm bình luận hoặc trả lời bình luận của bài viết
 */
export const addComment = async (
  postId: string,
  data: {
    userId: string
    authorName: string
    content: string
    parentId?: string | null
    replyToAuthorName?: string
    replyToUserId?: string
  }
): Promise<PostComment> => {
  const commentsCollectionRef = collection(db, POSTS_COLLECTION, postId, "comments")
  const newCommentRef = doc(commentsCollectionRef)

  const newComment: PostComment = {
    id: newCommentRef.id,
    postId,
    userId: data.userId,
    authorName: data.authorName,
    content: data.content,
    likesCount: 0,
    parentId: data.parentId || null,
    createdAt: new Date().toISOString(),
  }

  if (data.replyToAuthorName) {
    newComment.replyToAuthorName = data.replyToAuthorName
  }
  if (data.replyToUserId) {
    newComment.replyToUserId = data.replyToUserId
  }

  await setDoc(newCommentRef, newComment)

  // Cập nhật tăng số lượt bình luận trên bài viết
  try {
    const postDocRef = doc(db, POSTS_COLLECTION, postId)
    await updateDoc(postDocRef, { commentsCount: increment(1) })
  } catch (updateErr) {
    console.warn("Could not increment commentsCount:", updateErr)
  }

  return newComment
}

/**
 * Lấy danh sách bình luận của bài viết và tự động tổ chức lồng nhau (Replies tree)
 */
export const getPostComments = async (postId: string): Promise<PostComment[]> => {
  try {
    const commentsCollectionRef = collection(db, POSTS_COLLECTION, postId, "comments")
    const snapshot = await getDocs(commentsCollectionRef)

    const flatComments = snapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as PostComment
    )

    // Sắp xếp theo thời gian tạo tăng dần
    flatComments.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))

    // Gom nhóm các bình luận trả lời vào bình luận gốc
    const rootComments: PostComment[] = []
    const repliesMap = new Map<string, PostComment[]>()

    for (const c of flatComments) {
      if (c.parentId) {
        const existing = repliesMap.get(c.parentId) || []
        existing.push(c)
        repliesMap.set(c.parentId, existing)
      } else {
        rootComments.push(c)
      }
    }

    return rootComments.map((root) => ({
      ...root,
      replies: repliesMap.get(root.id) || [],
      repliesCount: (repliesMap.get(root.id) || []).length,
    }))
  } catch (err) {
    console.warn("Could not fetch comments for post", postId, err)
    return []
  }
}
