import React from "react"
import {
  HeroSection,
  CoreFeaturesSection,
  ProductsSection,
  JournalSection,
  CommunitySection,
} from "@/components/home"

import type { Product, DiaryPost } from "@/types"

interface HomePageProps {
  searchKeyword?: string
  onOpenNewPost: () => void
  onEditPost?: (post: DiaryPost) => void
  onOpenAuthModal?: () => void
  onNotify: (message: string, icon?: string) => void
  onSelectProduct?: (product: Product) => void
  postsVersion?: number
  onGoToJournals?: () => void
  onGoToForum?: () => void
}

export const HomePage: React.FC<HomePageProps> = ({
  searchKeyword = "",
  onOpenNewPost,
  onEditPost,
  onOpenAuthModal,
  onNotify,
  onSelectProduct,
  postsVersion,
  onGoToJournals,
  onGoToForum,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <HeroSection
        onExploreKits={() => scrollToSection("shop-section")}
        onJoinForum={() => scrollToSection("community-section")}
        onNotify={onNotify}
      />

      {/* 2. Core Features Showcase */}
      <CoreFeaturesSection />

      {/* 3. E-Commerce Section: Bộ Kit Trồng Cây Yêu Thích */}
      <ProductsSection
        searchKeyword={searchKeyword}
        onNotify={onNotify}
        onSelectProduct={onSelectProduct}
      />

      {/* 4. Interactive Plant Journal Dashboard */}
      <JournalSection
        onNotify={onNotify}
        onOpenAuthModal={onOpenAuthModal}
        onOpenNewPost={onOpenNewPost}
        onEditPost={onEditPost}
        postsVersion={postsVersion}
        onGoToJournals={onGoToJournals}
      />

      {/* 5. Community Forum Section */}
      <CommunitySection
        onOpenNewPost={onOpenNewPost}
        onEditPost={onEditPost}
        onNotify={onNotify}
        postsVersion={postsVersion}
        onGoToForum={onGoToForum}
      />

      {/* 6. Testimonials & Community Reviews
      <TestimonialsSection /> */}
    </div>
  )
}
