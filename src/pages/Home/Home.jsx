import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import HeroSection from './sections/HeroSection';
import BrandStorySection from './sections/BrandStorySection';
import FeaturesSection from './sections/FeaturesSection';
import CategorySection from './sections/CategorySection';
import ParallaxBannerSection from './sections/ParallaxBannerSection';
import BestSellerSection from './sections/BestSellerSection';
import FlashSaleSection from './sections/FlashSaleSection';
import TestimonialSection from './sections/TestimonialSection';
import BlogNewsletterSection from './sections/BlogNewsletterSection';
import ContactCTASection from './sections/ContactCTASection';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [banners, setBanners] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock flash sale end time (tomorrow at midnight)
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(24, 0, 0, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, brandRes, postRes, bannerRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/brands').catch(() => ({ data: [] })),
          api.get('/posts').catch(() => ({ data: [] })),
          api.get('/banners').catch(() => ({ data: [] }))
        ]);
        
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
        setPosts(postRes.data || []);
        setBanners((bannerRes.data || []).filter(b => b.status === 1));
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Compute sections data
  const flashSaleProducts = products.filter(p => p.productSale && p.productSale.pricesale).slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.id - a.id).slice(0, 8);
  const comboProducts = products.filter(p => p.name.toLowerCase().includes('combo') || p.category?.name.toLowerCase().includes('combo')).slice(0, 4);
  const latestPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-light">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-light min-h-screen overflow-x-hidden">
      <HeroSection banners={banners} />
      <BrandStorySection />
      <FeaturesSection />
      <CategorySection categories={categories} />
      <FlashSaleSection products={flashSaleProducts.length > 0 ? flashSaleProducts : comboProducts} flashSaleEndTime={flashSaleEndTime} />
      <ParallaxBannerSection />
      <BestSellerSection products={bestSellers} />
      <TestimonialSection />
      <ContactCTASection />
      <BlogNewsletterSection posts={latestPosts} />
    </div>
  );
};

export default Home;
