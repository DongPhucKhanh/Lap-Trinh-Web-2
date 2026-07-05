import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Slideshow.css';
import api from '../../services/api';

const Slideshow = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch banners from Admin
    api.get('/banners')
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Lọc ra banner đang active (status === 1)
          const activeBanners = res.data.filter(b => b.status === 1);
          setBanners(activeBanners);
        } else {
          setBanners([]); // No mock data, strictly admin data
        }
      })
      .catch(err => {
        console.error("Lỗi lấy banner:", err);
        setBanners([]);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (banners.length === 0) return null;

  return (
    <div className="slideshow-container">
      {banners.map((banner, index) => {
        const imageUrl = banner.image.startsWith('http') ? banner.image : `http://localhost:8080/uploads/${banner.image}`;
        return (
          <div 
            key={banner.id} 
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                {/* <h2>{banner.name || banner.title}</h2>
                <p>{banner.description}</p> */}
                <Link to={banner.link || '/product'} className="btn-primary">Xem Ngay</Link>
              </div>
            </div>
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button className="slide-nav prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="slide-nav next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>

          <div className="slide-dots">
            {banners.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Slideshow;
