import Hero from '@/components/layout/Hero'
import CategoriesSection from '@/components/sections/CategoriesSection'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import TrustBadges from '@/components/sections/TrustBadges'
import ReviewsCarousel from '@/components/sections/ReviewsCarousel'
import Footer from '@/components/sections/Footer'

export default function DemoStorefront() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <CategoriesSection />
      <FeaturedProducts />
      <ReviewsCarousel />
      <Footer />
    </>
  )
}
