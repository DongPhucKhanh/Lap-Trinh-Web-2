import React, { useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart, cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (product && product.id) {
      api.get(`/product-variants/product/${product.id}`)
        .then(res => {
          const vData = res.data || [];
          setVariants(vData);
          if (vData.length > 0) {
            const firstColor = vData[0].color;
            setSelectedColor(firstColor);
            const sizesForFirstColor = vData.filter(v => v.color === firstColor && v.qty > 0);
            if (sizesForFirstColor.length > 0) {
              setSelectedSize(sizesForFirstColor[0].size);
            } else {
              setSelectedSize(vData.filter(v => v.color === firstColor)[0]?.size);
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [product]);

  if (!product) return null;

  const hasSale = product.productSale && product.productSale.pricesale;
  const originalPrice = parseFloat(product.price);
  const salePrice = hasSale ? parseFloat(product.productSale.pricesale) : null;
  const currentPrice = hasSale ? salePrice : originalPrice;

  let mainImageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : `http://localhost:8080/uploads/${product.image}`)
    : 'https://placehold.co/400x400/f4f7f6/636e72?text=Snack';
    
  if (selectedColor && variants.length > 0) {
    const variantWithImage = variants.find(v => v.color === selectedColor && v.image && v.image.trim() !== '');
    if (variantWithImage) {
      const firstImg = variantWithImage.image.split(',')[0];
      mainImageUrl = firstImg.startsWith('http') ? firstImg : `http://localhost:8080/uploads/${firstImg}`;
    }
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      onClose();
      return false;
    }

    if (variants.length > 0 && (!selectedColor || !selectedSize)) {
      toast.warning('Vui lòng chọn màu sắc và kích cỡ!');
      return false;
    }

    let maxQty = product.productStore?.qty || 0;
    let variantId = null;

    if (variants.length > 0) {
      const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
      if (!selectedVariant || selectedVariant.qty <= 0) {
        toast.warning('Sản phẩm với lựa chọn này đã hết hàng!');
        return false;
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
      return false;
    }

    addToCart({ ...product, selectedColor, selectedSize, variantId }, quantity);
    toast.success('Đã thêm vào giỏ hàng!');
    return true;
  };

  const handleBuyNow = () => {
    const success = handleAddToCart();
    if (success) {
      onClose();
      const cartItemId = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
      navigate('/checkout', { state: { selectedItems: [cartItemId] } });
    }
  };

  return ReactDOM.createPortal(
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={e => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="quickview-content">
          <div className="quickview-image">
            <img src={mainImageUrl} alt={product.name} />
          </div>
          
          <div className="quickview-info">
            <h2 className="quickview-title">{product.name}</h2>
            <div className="quickview-category">{product.category?.name || 'Giày thể thao'}</div>
            
            <div className="quickview-price-sec">
              {hasSale ? (
                <>
                  <span className="current-price">{currentPrice.toLocaleString('vi-VN')}đ</span>
                  <span className="original-price">{originalPrice.toLocaleString('vi-VN')}đ</span>
                </>
              ) : (
                <span className="current-price">{currentPrice.toLocaleString('vi-VN')}đ</span>
              )}
            </div>
            
            {/* Color Variants */}
            {variants.length > 0 && variants.some(v => v.color && v.color.trim() !== '') && (
              <div className="variant-section" style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  Màu sắc: <span style={{ color: '#666', fontWeight: 400 }}>{selectedColor}</span>
                </div>
                <div className="color-variants" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[...new Set(variants.map(v => v.color))].filter(c => c && c.trim() !== '').map((color, idx) => {
                    const outOfStock = !variants.some(v => v.color === color && v.qty > 0);
                    return (
                      <div 
                        key={`color-${idx}`} 
                        className={`qv-color-btn ${selectedColor === color ? 'selected' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                        style={{
                          padding: '5px 12px',
                          border: `1px solid ${selectedColor === color ? 'var(--primary)' : '#ddd'}`,
                          borderRadius: '4px',
                          cursor: outOfStock ? 'not-allowed' : 'pointer',
                          opacity: outOfStock ? 0.5 : 1,
                          backgroundColor: selectedColor === color ? 'rgba(255,107,107,0.05)' : 'white',
                          color: selectedColor === color ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          if (!outOfStock) {
                            setSelectedColor(color);
                            const sizesForColor = variants.filter(v => v.color === color && v.qty > 0);
                            if (sizesForColor.length > 0 && !sizesForColor.some(v => v.size === selectedSize)) {
                              setSelectedSize(sizesForColor[0].size);
                            }
                          }
                        }}
                      >
                        {color}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {variants.length > 0 && selectedColor && (
              <div className="variant-section" style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  Kích cỡ: <span style={{ color: '#666', fontWeight: 400 }}>{selectedSize}</span>
                </div>
                <div className="size-variants" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {variants.filter(v => v.color === selectedColor).map((v, idx) => {
                    const outOfStock = v.qty <= 0;
                    return (
                      <div 
                        key={`size-${idx}`} 
                        className={`qv-size-btn ${selectedSize === v.size ? 'selected' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                        style={{
                          minWidth: '40px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${selectedSize === v.size ? 'var(--primary)' : '#ddd'}`,
                          borderRadius: '4px',
                          cursor: outOfStock ? 'not-allowed' : 'pointer',
                          opacity: outOfStock ? 0.5 : 1,
                          backgroundColor: selectedSize === v.size ? 'var(--primary)' : 'white',
                          color: selectedSize === v.size ? 'white' : 'var(--text-main)',
                          fontSize: '0.85rem',
                          padding: '0 8px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          if (!outOfStock) setSelectedSize(v.size);
                        }}
                      >
                        {v.size}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="quickview-desc" style={{ marginTop: variants.length > 0 ? '0' : '15px' }}>
              {product.description || 'Sản phẩm êm ái, chất lượng tuyệt hảo.'}
            </p>
            
            <div className="quickview-stock">
              Tình trạng: <strong>{product.productStore && product.productStore.qty > 0 ? `Còn hàng (${product.productStore.qty})` : 'Hết hàng'}</strong>
            </div>

            <div className="quickview-actions" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '1rem', marginBottom: '15px' }}>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(q => q + 1)}><Plus size={16}/></button>
              </div>
              
              <button 
                className="btn-add-cart" 
                onClick={handleAddToCart}
                disabled={!(product.productStore && product.productStore.qty > 0)}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>

              <button 
                className="btn-buy-now" 
                onClick={handleBuyNow}
                disabled={!(product.productStore && product.productStore.qty > 0)}
              >
                Mua ngay
              </button>
            </div>
            
            <div className="quickview-footer">
              <Link to={`/product/${product.id}`} onClick={onClose} className="view-detail-link">
                Xem chi tiết sản phẩm ➔
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuickViewModal;
