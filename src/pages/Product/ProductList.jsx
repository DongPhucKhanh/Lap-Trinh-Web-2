import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Search, Grid, List as ListIcon, ChevronDown, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Pagination from '../../components/Pagination/Pagination';
import QuickViewModal from '../../components/ProductCard/QuickViewModal';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './ProductList.css';

const ProductList = ({ isSalePage = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const initialSale = isSalePage || searchParams.get('sale') === 'true';

  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState({ 
    categoryId: initialCategory, 
    search: initialSearch, 
    sort: 'id', // Default sort by id in backend
    direction: 'desc',
    saleOnly: initialSale,
    maxPrice: 15000000
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 4;

  // Favorites
  const [favorites, setFavorites] = useState(new Set());

  // Expanded Categories
  const [expandedCats, setExpandedCats] = useState({});

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    // Sync URL when filter or page changes
    const params = new URLSearchParams();
    if (filter.search) params.set('search', filter.search);
    if (filter.categoryId) params.set('category', filter.categoryId);
    if (filter.saleOnly) params.set('sale', 'true');
    if (currentPage > 1) params.set('page', currentPage);
    navigate({ search: params.toString() }, { replace: true });
  }, [filter, currentPage, navigate]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    if (user) {
      api.get('/favorites').then(res => {
        setFavorites(new Set(res.data.map(p => p.id)));
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    // Add a small delay for price slider to avoid fetching too many times while sliding
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filter, currentPage]);

  const fetchProducts = () => {
    setLoading(true);
    const requiresLocalFilter = filter.saleOnly || filter.maxPrice < 15000000;
    const params = {
      page: requiresLocalFilter ? 0 : currentPage - 1,
      size: requiresLocalFilter ? 1000 : itemsPerPage,
      sort: filter.sort,
      direction: filter.direction
    };
    if (filter.search) params.keyword = filter.search;
    if (filter.categoryId) params.category = filter.categoryId;

    api.get('/products/search', { params })
      .then(res => {
        let content = res.data.content || res.data;
        
        // Client-side filtering
        if (requiresLocalFilter) {
          if (filter.saleOnly) {
            content = content.filter(p => p.productSale && p.productSale.pricesale);
          }
          if (filter.maxPrice < 15000000) {
            content = content.filter(p => {
              const actualPrice = p.productSale?.pricesale || p.price;
              return actualPrice <= filter.maxPrice;
            });
          }
          
          // Local pagination
          const start = (currentPage - 1) * itemsPerPage;
          const paginatedContent = content.slice(start, start + itemsPerPage);
          
          setProducts(paginatedContent);
          setTotalElements(content.length);
          setTotalPages(Math.ceil(content.length / itemsPerPage) || 1);
        } else {
          setProducts(content);
          setTotalPages(res.data.totalPages || 1);
          setTotalElements(res.data.totalElements || content.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilter(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'newest') setFilter(prev => ({...prev, sort: 'id', direction: 'desc'}));
    if (val === 'priceAsc') setFilter(prev => ({...prev, sort: 'price', direction: 'asc'}));
    if (val === 'priceDesc') setFilter(prev => ({...prev, sort: 'price', direction: 'desc'}));
    setCurrentPage(1);
  };

  const toggleFavorite = async (product) => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
      navigate('/login');
      return;
    }
    const isFav = favorites.has(product.id);
    try {
      if (isFav) {
        await api.delete(`/favorites/${product.id}`);
        setFavorites(prev => { const next = new Set(prev); next.delete(product.id); return next; });
        toast.success('Đã xóa khỏi yêu thích!');
      } else {
        await api.post(`/favorites/${product.id}`);
        setFavorites(prev => { const next = new Set(prev); next.add(product.id); return next; });
        toast.success('Đã thêm vào yêu thích!');
      }
    } catch (err) {
      toast.error('Lỗi khi thao tác yêu thích.');
    }
  };

  const breadcrumbItems = [
    { label: isSalePage ? 'Khuyến mãi' : 'Sản phẩm', link: null }
  ];

  return (
    <div className="product-list-page">
      <div className="page-header-banner">
        <h1>{isSalePage ? 'Khuyến Mãi Khủng' : 'Bộ Sưu Tập Giày Thể Thao'}</h1>
        <p>{isSalePage ? 'Săn ngay những deal cực sốc với giá tốt nhất' : 'Hàng trăm mẫu giày đang chờ bạn khám phá'}</p>
      </div>

      <div className="product-list-container">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="filter-block">
            <h3><Filter size={18} /> Tìm kiếm</h3>
            <div className="search-box">
              <input 
                type="text" 
                name="search" 
                placeholder="Tên đôi giày..." 
                value={filter.search}
                onChange={handleFilterChange}
              />
              <Search size={16} />
            </div>
          </div>

          <div className="filter-block">
            <h3>Danh mục</h3>
            <ul className="category-list">
              <li 
                className={filter.categoryId === '' ? 'active' : ''}
                onClick={() => { setFilter(prev => ({...prev, categoryId: ''})); setCurrentPage(1); }}
              >
                Tất cả đôi giày
              </li>
              {categories.filter(cat => !cat.parentId).map(parent => {
                const hasChildren = categories.some(cat => cat.parentId === parent.id);
                const isExpanded = expandedCats[parent.id];
                
                return (
                  <React.Fragment key={parent.id}>
                    <li className={`parent-category ${filter.categoryId === parent.id.toString() ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span 
                        style={{ flex: 1 }}
                        onClick={() => { setFilter(prev => ({...prev, categoryId: parent.id.toString()})); setCurrentPage(1); }}
                      >
                        {parent.name}
                      </span>
                      {hasChildren && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCats(prev => ({...prev, [parent.id]: !prev[parent.id]}));
                          }}
                          style={{ padding: '0 8px', cursor: 'pointer' }}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                      )}
                    </li>
                    {hasChildren && isExpanded && categories.filter(cat => cat.parentId === parent.id).map(child => (
                      <li 
                        key={child.id}
                        className={`child-category ${filter.categoryId === child.id.toString() ? 'active' : ''}`}
                        onClick={() => { setFilter(prev => ({...prev, categoryId: child.id.toString()})); setCurrentPage(1); }}
                      >
                        {child.name}
                      </li>
                    ))}
                  </React.Fragment>
                );
              })}
            </ul>
          </div>

          <div className="filter-block">
            <h3>Mức giá</h3>
            <div style={{ padding: '10px 0' }}>
              <input 
                type="range" 
                min="0" 
                max="15000000" 
                step="100000" 
                value={filter.maxPrice} 
                onChange={(e) => {
                  setFilter(prev => ({...prev, maxPrice: parseInt(e.target.value)}));
                  setCurrentPage(1);
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', color: '#555' }}>
                <span>0đ</span>
                <span>{filter.maxPrice >= 15000000 ? 'Tất cả' : `Dưới ${new Intl.NumberFormat('vi-VN').format(filter.maxPrice)}đ`}</span>
              </div>
            </div>
          </div>

          {!isSalePage && (
            <div className="filter-block">
              <h3>Lọc thêm</h3>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="saleOnly"
                  checked={filter.saleOnly}
                  onChange={handleFilterChange}
                />
                Chỉ hiện hàng Khuyến mãi
              </label>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="main-products">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="products-header">
            <span>Hiển thị <strong>{totalElements}</strong> kết quả</span>
            
            <div className="products-controls">
              <div className="view-modes">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon size={18} />
                </button>
              </div>

              <select name="sort" onChange={handleSortChange} className="sort-select-inline" defaultValue="newest">
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá: Thấp đến Cao</option>
                <option value="priceDesc">Giá: Cao xuống Thấp</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loader"></div>
          ) : products.length > 0 ? (
            <>
              <div className={`product-${viewMode}`}>
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    layout={viewMode}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="empty-msg">Không tìm thấy đôi giày nào phù hợp với bộ lọc.</div>
          )}
        </div>
      </div>
      
      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </div>
  );
};

export default ProductList;
