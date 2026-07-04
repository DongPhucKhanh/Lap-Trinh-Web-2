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
  const { addToCart, cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    setLoading(true);
    // Use either id or slug (assuming backend can handle or we just fetch by ID for now since App.jsx maps /product/:id)
    api.get(`/products/${id || slug}`)
      .then(res => {
        setProduct(res.data);
        // Fetch variants
        api.get(`/product-variants/product/${res.data.id}`).then(vRes => {
          setVariants(vRes.data || []);
          if (vRes.data && vRes.data.length > 0) {
            const firstColor = vRes.data[0].color;
            setSelectedColor(firstColor);
            const sizesForFirstColor = vRes.data.filter(v => v.color === firstColor && v.qty > 0);
            if (sizesForFirstColor.length > 0) {
              setSelectedSize(sizesForFirstColor[0].size);
            } else {
              // If no size in stock for first color, just select first size anyway
              setSelectedSize(vRes.data.filter(v => v.color === firstColor)[0]?.size);
            }
          }
        }).catch(err => console.error('Error fetching variants', err));

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
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    if (variants.length > 0 && (!selectedColor || !selectedSize)) {
      toast.warning('Vui lòng chọn màu sắc và kích cỡ!');
      return;
    }

    let maxQty = product.productStore?.qty || 0;
    let variantId = null;

    if (variants.length > 0) {
      const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
      if (!selectedVariant || selectedVariant.qty <= 0) {
        toast.warning('Sản phẩm với lựa chọn này đã hết hàng!');
        return;
      }
      maxQty = selectedVariant.qty;
      variantId = selectedVariant.id;
    }

    const cartItemId = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    const existingQty = existingItem ? existingItem.quantity : 0;
    
    if (existingQty + quantity > maxQty) {
      if (existingQty > 0) {
        toast.warning(`Giỏ hàng của bạn đã có ${existingQty} sản phẩm loại này. Tồn kho chỉ còn ${maxQty}, không thể thêm ${quantity} nữa!`);
      } else {
        toast.warning(`Tồn kho chỉ còn ${maxQty} sản phẩm!`);
      }
      return;
    }

    addToCart({ ...product, selectedColor, selectedSize, variantId }, quantity);
    toast.success('Đã thêm vào giỏ hàng!');
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

  let defaultMainImageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`)
    : 'https://placehold.co/600x400/f4f7f6/636e72?text=Product';

  let defaultGallery = [defaultMainImageUrl];
  if (product.gallery) {
    const extraImages = product.gallery.split(',').filter(x => x).map(img => 
      img.startsWith('http') ? img : `http://localhost:8080/uploads/${img}`
    );
    defaultGallery = [...defaultGallery, ...extraImages];
  }

  let gallery = defaultGallery;

  // If a color is selected and it has its own images, override the gallery completely
  if (selectedColor && variants.length > 0) {
    const variantWithImage = variants.find(v => v.color === selectedColor && v.image && v.image.trim() !== '');
    if (variantWithImage) {
      gallery = variantWithImage.image.split(',').filter(x => x).map(img => 
        img.startsWith('http') ? img : `http://localhost:8080/uploads/${img}`
      );
    }
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
            {gallery.length > 1 && (
              <div className="gallery-thumbs-vertical">
                {gallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumb-item ${mainImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setMainImgIndex(idx)}
                    onMouseEnter={() => setMainImgIndex(idx)}
                  >
                    <img src={img} alt={`Gallery ${idx}`} />
                  </div>
                ))}
              </div>
            )}
            <div className="main-image-wrapper">
              <span className="badge-highly-rated">★ Highly Rated</span>
              <img src={gallery[mainImgIndex]} alt={product.name || product.title} className="main-image" />
              {gallery.length > 1 && (
                <>
                  <button className="img-nav-btn prev" onClick={() => setMainImgIndex(prev => prev === 0 ? gallery.length - 1 : prev - 1)}>&lt;</button>
                  <button className="img-nav-btn next" onClick={() => setMainImgIndex(prev => prev === gallery.length - 1 ? 0 : prev + 1)}>&gt;</button>
                </>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="detail-info-sec">
            <h1 className="detail-title">{product.name || product.title}</h1>
            <div className="detail-category">{product.category?.name || 'Giày thể thao nam'}</div>
            
            <div className="detail-price">
              {product.productSale?.pricesale ? (
                <>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.productSale.pricesale)}
                  <span style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.7em', marginLeft: '12px'}}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                  </span>
                </>
              ) : (
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)
              )}
            </div>

            {/* Color Variants */}
            {variants.length > 0 && variants.some(v => v.color && v.color.trim() !== '') && (
              <div className="variant-section mb-4">
                <div style={{ marginBottom: '10px', fontSize: '1rem', fontWeight: 600 }}>
                  Màu sắc: <span style={{ color: '#666', fontWeight: 400 }}>{selectedColor || 'Vui lòng chọn'}</span>
                </div>
                <div className="color-variants">
                  {[...new Set(variants.map(v => v.color))].filter(c => c && c.trim() !== '').map((color, idx) => {
                    const outOfStock = !variants.some(v => v.color === color && v.qty > 0);
                    const vImgStr = variants.find(v => v.color === color && v.image && v.image.trim() !== '')?.image;
                    const firstVImg = vImgStr ? vImgStr.split(',')[0] : null;
                    const thumbSrc = firstVImg 
                      ? (firstVImg.startsWith('http') ? firstVImg : `http://localhost:8080/uploads/${firstVImg}`) 
                      : defaultGallery[0];

                    return (
                      <div 
                        key={`color-${idx}`} 
                        className={`color-item ${selectedColor === color ? 'active' : ''} ${outOfStock ? 'out-of-stock' : ''}`} 
                        title={color}
                        onClick={() => {
                          if (!outOfStock) {
                            setSelectedColor(color);
                            setMainImgIndex(0); // Reset to show variant image
                            const firstAvailableSize = variants.find(v => v.color === color && v.qty > 0 && v.size && v.size.trim() !== '')?.size;
                            if (firstAvailableSize) setSelectedSize(firstAvailableSize);
                            else setSelectedSize(''); // Reset if no valid size
                          }
                        }}
                      >
                        <img src={thumbSrc} alt={color} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {variants.length > 0 && variants.some(v => v.color === selectedColor && v.size && v.size.trim() !== '') && (
              <div className="variant-section mb-4">
                <div className="size-selector-header">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Kích cỡ: <span style={{ color: '#666', fontWeight: 400 }}>{selectedSize || 'Vui lòng chọn'}</span></h3>
                  <button className="size-guide-btn">📏 Hướng dẫn chọn size</button>
                </div>
                <div className="sizes-grid">
                  {variants.filter(v => v.color === selectedColor && v.size && v.size.trim() !== '').map((v) => (
                    <button 
                      key={v.size} 
                      className={`size-btn ${selectedSize === v.size ? 'active' : ''}`}
                      disabled={v.qty <= 0}
                      onClick={() => setSelectedSize(v.size)}
                      title={v.qty > 0 ? `Còn ${v.qty} sản phẩm` : 'Hết hàng'}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18}/></button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => {
                  let maxQty = product.productStore?.qty || 0;
                  if (variants.length > 0) {
                    const sv = variants.find(v => v.color === selectedColor && v.size === selectedSize);
                    if (sv) maxQty = sv.qty;
                  }
                  setQuantity(q => (q < maxQty ? q + 1 : q));
                }}><Plus size={18}/></button>
              </div>

              <button 
                className="btn-add-cart" 
                onClick={handleAddToCart}
                disabled={variants.length > 0 ? !variants.some(v=>v.color===selectedColor && v.size===selectedSize && v.qty>0) : (!product.productStore?.qty || product.productStore.qty === 0)}
              >
                {(variants.length > 0 ? !variants.some(v=>v.color===selectedColor && v.size===selectedSize && v.qty>0) : (!product.productStore?.qty || product.productStore.qty === 0)) ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
              
              <button className="btn-favorite" onClick={toggleWishlist}>
                Yêu thích <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
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
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Đánh giá ({reviews.length})</button>
          </div>
          <div className="tab-content">
            {activeTab === 'desc' && (
              <div className="html-content" dangerouslySetInnerHTML={{ __html: product.detail || '<p>Đang cập nhật chi tiết sản phẩm.</p>' }} />
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
              <h2>Có Thể Bạn Cũng Thích</h2>
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
