import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { db } from "@/config/firebase"
import type { Product } from "@/types"

export const INITIAL_PRODUCTS: Omit<Product, "createdAt" | "updatedAt">[] = [
  {
    id: "prod_tomato_cherry_01",
    name: "Bộ Kit Trồng Cà Chua Bi Cherry Đỏ Ban Công",
    shortDescription:
      "Trải nghiệm tự tay gieo mầm từng hạt giống cà chua bi thơm ngọt ngay góc ban công nhỏ. Đầy đủ đất mộc, chậu đất nung và hạt F1 tuyển chọn tỉ lệ nảy mầm >95%.",
    description: `
      <h3>1. Chuẩn bị giá thể:</h3>
      <p>Ngâm viên nén xơ dừa hữu cơ vào 300ml nước ấm trong 5 phút để xơ bung tơi xốp, sau đó cho vào chậu gốm mộc.</p>
      <h3>2. Gieo mầm hạt:</h3>
      <p>Dùng que gỗ tạo 2-3 lỗ sâu tầm 0.5cm, rắc hạt và phủ lớp xơ mỏng lên trên bề mặt. Tưới ẩm sương nhẹ.</p>
      <h3>3. Đón nắng dịu:</h3>
      <p>Đặt chậu nơi thoáng mát, có ánh sáng gián tiếp. Sau 3-5 ngày hạt nhú mầm xanh tươi mát.</p>
    `,
    originalPrice: 220000,
    salePrice: 185000,
    stockQuantity: 150,
    coverImage: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=800&q=80",
    ],
    kitComponents: [
      {
        title: "Hạt giống F1",
        description: "1 gói hạt giống cà chua bi F1 thuần chủng (15-20 hạt)",
      },
      {
        title: "Viên nén xơ dừa",
        description: "2 viên nén xơ dừa hữu cơ ép giàu dinh dưỡng",
      },
      {
        title: "Chậu gốm mộc",
        description: "1 chậu gốm mộc nung thủ công thoát nước tốt",
      },
      {
        title: "Que gỗ & Thẻ tên",
        description: "Que gỗ định vị độ sâu và bảng ghi ngày gieo mầm",
      },
      {
        title: "Cẩm nang gieo trồng",
        description: "1 cẩm nang hướng dẫn chi tiết 6 bước chăm sóc",
      },
    ],
    specifications: {
      germinationRate: {
        label: "Tỷ lệ nảy mầm",
        value: "> 95% (95% - 98%)",
      },
      germinationTime: {
        label: "Thời gian nảy mầm",
        value: "5 - 7 ngày",
      },
      floweringTime: {
        label: "Thời gian ra hoa",
        value: "35 - 45 ngày",
      },
      plantCareNotes: {
        label: "Lưu ý cho cây",
        value: "Tưới gốc & đón nắng",
      },
    },
  },
  {
    id: "prod_strawberry_nz_02",
    name: "Bộ Kit Trồng Dâu Tây New Zealand Trái Ngọt",
    shortDescription:
      "Tự tay ươm mầm giống dâu tây New Zealand quả đỏ mọng, thơm nồng dịu mát thích hợp khí hậu ban công đô thị. Bộ kit đầy đủ dinh dưỡng hữu cơ và hướng dẫn 6 bước chi tiết.",
    description: `
      <h3>1. Kích hoạt hạt giống:</h3>
      <p>Hạt dâu tây nhỏ li ti, gieo trực tiếp lên bề mặt đất ẩm, không lấp đất quá dày.</p>
      <h3>2. Độ ẩm và ánh sáng:</h3>
      <p>Dùng bình xịt phun sương 2 lần mỗi ngày (sáng sớm và chiều mát), đặt ở vị trí có ánh sáng nhẹ tán xạ.</p>
      <h3>3. Bón thúc hoa và đậu quả:</h3>
      <p>Khi cây trưởng thành chuẩn bị ra hoa, bón bổ sung phân kali hữu cơ để trái đỏ bóng và ngọt đậm đà.</p>
    `,
    originalPrice: 250000,
    salePrice: 210000,
    stockQuantity: 100,
    coverImage: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=800&q=80",
    ],
    kitComponents: [
      {
        title: "Hạt giống F1",
        description: "1 gói hạt giống dâu tây New Zealand chọn lọc (25-30 hạt)",
      },
      {
        title: "Đất trồng hữu cơ",
        description: "1 túi đất sạch trộn đá perlite giữ ẩm và thoáng rễ",
      },
      {
        title: "Chậu đất nung nâu",
        description: "1 chậu đất nung đường kính 18cm kèm đĩa lót",
      },
      {
        title: "Dinh dưỡng trùn quế",
        description: "1 túi phân hữu cơ bón thúc giai đoạn ra hoa",
      },
      {
        title: "Cẩm nang hướng dẫn",
        description: "Sổ tay 6 bước đồng hành nuôi cây ra trái",
      },
    ],
    specifications: {
      germinationRate: {
        label: "Tỷ lệ nảy mầm",
        value: "> 90% (88% - 93%)",
      },
      germinationTime: {
        label: "Thời gian nảy mầm",
        value: "7 - 12 ngày",
      },
      floweringTime: {
        label: "Thời gian ra hoa",
        value: "45 - 60 ngày",
      },
      plantCareNotes: {
        label: "Lưu ý cho cây",
        value: "Ưa ẩm nhẹ, nắng 4h/ngày",
      },
    },
  },
]

/**
 * Seed 2 cây sản phẩm ban đầu vào Firestore nếu database chưa có sản phẩm nào
 */
export const seedInitialProducts = async (): Promise<Product[]> => {
  const productsRef = collection(db, "products")
  const snapshot = await getDocs(productsRef)

  // Nếu đã có sản phẩm thì trả về danh sách hiện tại
  if (!snapshot.empty) {
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product)
  }

  // Nếu chưa có, tiến hành nạp 2 cây mẫu
  const now = new Date().toISOString()
  const createdProducts: Product[] = []

  for (const item of INITIAL_PRODUCTS) {
    const docRef = doc(db, "products", item.id)
    const productData: Product = {
      ...item,
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(docRef, productData)
    createdProducts.push(productData)
  }

  return createdProducts
}
