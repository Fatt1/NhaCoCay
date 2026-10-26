export interface KitComponent {
  title: string
  description: string
}

export interface SpecificationItem {
  label: string
  value: string
}

export interface ProductSpecifications {
  germinationRate: SpecificationItem
  germinationTime: SpecificationItem
  floweringTime: SpecificationItem
  plantCareNotes: SpecificationItem
}

export interface Product {
  id: string
  name: string
  shortDescription: string
  description: string
  originalPrice: number
  salePrice: number
  stockQuantity: number
  coverImage: string
  images: string[]
  kitComponents: KitComponent[]
  specifications: ProductSpecifications
  createdAt: string
  updatedAt: string
}
