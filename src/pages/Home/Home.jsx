import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import HeroSection from './sections/HeroSection';
import BrandStorySection from './sections/BrandStorySection';
import FeaturesSection from './sections/FeaturesSection';
import CategorySection from './sections/CategorySection';
import ParallaxBannerSection from './sections/ParallaxBannerSection';
import BestSellerSection from './sections/BestSellerSection';
import NewProductsSection from './sections/NewProductsSection';
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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persistent flash sale end time (e.g. 48 hours from first visit)
  const getFlashSaleEndTime = () => {
    const savedTime = localStorage.getItem('flashSaleEndTime');
    if (savedTime && new Date(savedTime) > new Date()) {
      return new Date(savedTime);
    }
    // Set new end time: 48 hours from now
    const newTime = new Date();
    newTime.setHours(newTime.getHours() + 48);
    localStorage.setItem('flashSaleEndTime', newTime.toISOString());
    return newTime;
  };
  
  const [flashSaleEndTime] = useState(getFlashSaleEndTime());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, brandRes, postRes, bannerRes, reviewRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/brands').catch(() => ({ data: [] })),
          api.get('/posts').catch(() => ({ data: [] })),
          api.get('/banners').catch(() => ({ data: [] })),
          api.get('/reviews/latest').catch(() => ({ data: [] }))
        ]);
        
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
        setPosts(postRes.data || []);
        setBanners((bannerRes.data || []).filter(b => b.status === 1));
        setReviews(reviewRes.data || []);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Compute sections data
  const flashSaleProducts = products.filter(p => p.productSale && p.productSale.pricesale > 0).slice(0, 4);
  const newProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 4);
  
  // For BestSellers we prioritize isFeatured products, then fallback to rest.
  let bestSellers = [...products].filter(p => p.isFeatured).slice(0, 4);
  if (bestSellers.length < 4) {
    const remaining = [...products].filter(p => !p.isFeatured).slice(0, 4 - bestSellers.length);
    bestSellers = [...bestSellers, ...remaining];
  }

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
      <NewProductsSection products={newProducts} />
      <FlashSaleSection products={flashSaleProducts.length > 0 ? flashSaleProducts : comboProducts} flashSaleEndTime={flashSaleEndTime} />
      <ParallaxBannerSection />
      <BestSellerSection products={bestSellers} />
      <TestimonialSection reviews={reviews} />
      <ContactCTASection />
      <BlogNewsletterSection posts={latestPosts} />
    </div>
  );
};

export default Home;
