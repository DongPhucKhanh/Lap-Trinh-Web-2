import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, Heart, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [mainImgIndex, setMainImgIndex] = useState(0);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Use either id or slug (assuming backend can handle or we just fetch by ID for now since App.jsx maps /product/:id)
    api.get(`/products/${id || slug}`)
      .then(res => {
        setProduct(res.data);
        // Fetch related
        api.get('/products').then(prodRes => {
          const related = prodRes.data
            .filter(p => p.category?.id === res.data.category?.id && p.id !== res.data.id)
            .slice(0, 4);
          setRelatedProducts(related);
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, slug]);

  // Load wishlist & reviews
  useEffect(() => {
    if (product) {
      if (user) {
        api.get('/favorites')
          .then(res => {
            const isFav = res.data.some(p => p.id === product.id);
            setIsWishlisted(isFav);
          })
          .catch(err => console.error("Error fetching favorites", err));
      } else {
        setIsWishlisted(false);
      }
      
      api.get(`/reviews/product/${product.id}`)
        .then(res => {
          setReviews(res.data || []);
        })
        .catch(err => console.error("Error fetching reviews", err));
    }
  }, [product, user]);

  if (loading) return <div className="loader"></div>;
  
  if (!product) return (
    <div className="empty-msg">
      <h2>Không tìm thấy sản phẩm!</h2>
      <button className="btn-primary mt-4" onClick={() => navigate('/product')}>Quay lại danh sách</button>
    </div>
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
      navigate('/login');
      return;
    }
    
    try {
      if (isWishlisted) {
        await api.delete(`/favorites/${product.id}`);
        toast.success('Đã xóa khỏi danh sách yêu thích!');
      } else {
        await api.post(`/favorites/${product.id}`);
        toast.success('Đã thêm vào danh sách yêu thích!');
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  const mainImageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`)
    : 'https://placehold.co/600x400/f4f7f6/636e72?text=Snack';

  let gallery = [mainImageUrl];
  if (product.gallery) {
    const extraImages = product.gallery.split(',').filter(x => x).map(img => 
      img.startsWith('http') ? img : `http://localhost:8080/uploads/${img}`
    );
    gallery = [...gallery, ...extraImages];
  }

  const breadcrumbItems = [
    { label: 'Sản phẩm', link: '/product' },
    { label: product.category?.name || 'Danh mục', link: `/product?category=${product.category?.id}` },
    { label: product.name, link: null }
  ];

  return (
    <div className="product-detail-page">
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="detail-grid mt-4">
          {/* Image Section */}
          <div className="detail-image-sec">
            <div className="main-image-wrapper">
              <img src={gallery[mainImgIndex]} alt={product.name || product.title} className="main-image" />
            </div>
            {gallery.length > 1 && (
              <div className="gallery-thumbs">
                {gallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumb-item ${mainImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setMainImgIndex(idx)}
                  >
                    <img src={img} alt={`Gallery ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="detail-info-sec">
            <h1 className="detail-title">{product.name || product.title}</h1>
            
            <div className="detail-meta">
              <span className="detail-category">{product.category?.name || 'SnackHub'}</span>
              <span className="detail-status in-stock">Còn hàng</span>
            </div>

            <div className="detail-price">
              {product.productSale?.pricesale ? (
                <>
                  <span className="current-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.productSale.pricesale)}
                  </span>
                  <span className="original-price" style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.65em', marginLeft: '12px'}}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                  </span>
                </>
              ) : (
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)
              )}
            </div>

            <div className="detail-description">
              <p>{product.description || 'Chưa có mô tả ngắn gọn cho sản phẩm này.'}</p>
            </div>

            <div className="detail-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18}/></button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(q => q + 1)}><Plus size={18}/></button>
              </div>

              <button className="btn-add-cart" onClick={handleAddToCart}>
                <ShoppingCart size={20} /> Thêm Vào Giỏ Hàng
              </button>
              
              <button className="btn-icon-large" onClick={toggleWishlist} style={{ color: isWishlisted ? '#ef4444' : undefined }}>
                <Heart size={24} fill={isWishlisted ? '#ef4444' : 'none'} />
              </button>
            </div>
            
            <div className="guarantee-mini">
              <div className="g-item"><ShieldCheck size={18} /> Chính hãng</div>
              <div className="g-item"><Truck size={18} /> Giao 2H</div>
              <div className="g-item"><RotateCcw size={18} /> Đổi trả 7 ngày</div>
            </div>
          </div>
        </div>

        {/* Detailed Content / Tabs */}
        <div className="detail-tabs-section">
          <div className="tab-headers">
            <button className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Mô tả sản phẩm</button>
            <button className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>Thành phần & Bảo quản</button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Đánh giá ({reviews.length})</button>
          </div>
          <div className="tab-content">
            {activeTab === 'desc' && (
              <div className="html-content" dangerouslySetInnerHTML={{ __html: product.detail || '<p>Đang cập nhật chi tiết sản phẩm.</p>' }} />
            )}
            {activeTab === 'ingredients' && (
              <div className="text-content">
                <p><strong>Thành phần chính:</strong> {product.ingredients || 'Đang cập nhật'}</p>
                <p><strong>Trọng lượng/Thể tích:</strong> {product.weight || 'Đang cập nhật'}</p>
                <p><strong>Hướng dẫn bảo quản:</strong> Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Đậy kín sau khi sử dụng.</p>
                <p><strong>Hạn sử dụng:</strong> 6 tháng kể từ ngày sản xuất.</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-content">
                {reviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong>{r.userName}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <div style={{ marginBottom: '8px', color: '#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        <p style={{ margin: 0, color: '#475569' }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Chưa có đánh giá nào. Hãy là người mua đầu tiên để lại nhận xét nhé!</p>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                  <em>* Đánh giá chỉ có thể được viết sau khi khách hàng đã mua và nhận sản phẩm thành công thông qua mục Đơn hàng của tôi.</em>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-section">
            <div className="section-header">
              <h2>Sản Phẩm Cùng Danh Mục</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
