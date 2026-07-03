import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Search, Grid, List as ListIcon } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Pagination from '../../components/Pagination/Pagination';
import QuickViewModal from '../../components/ProductCard/QuickViewModal';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './ProductList.css';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const initialSale = searchParams.get('sale') === 'true';

  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState({ 
    categoryId: initialCategory, 
    search: initialSearch, 
    sort: 'id', // Default sort by id in backend
    direction: 'desc',
    saleOnly: initialSale
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 12;

  // Favorites
  const [favorites, setFavorites] = useState(new Set());

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
    fetchProducts();
  }, [filter, currentPage]);

  const fetchProducts = () => {
    setLoading(true);
    const params = {
      page: filter.saleOnly ? 0 : currentPage - 1,
      size: filter.saleOnly ? 1000 : itemsPerPage,
      sort: filter.sort,
      direction: filter.direction
    };
    if (filter.search) params.keyword = filter.search;
    if (filter.categoryId) params.category = filter.categoryId;

    api.get('/products/search', { params })
      .then(res => {
        let content = res.data.content || res.data;
        // Client-side filter for saleOnly since API might not support it directly
        if (filter.saleOnly) {
          content = content.filter(p => p.productSale && p.productSale.pricesale);
          
          // Local pagination for sale products
          const start = (currentPage - 1) * itemsPerPage;
          const paginatedContent = content.slice(start, start + itemsPerPage);
          
          setProducts(paginatedContent);
          setTotalElements(content.length);
          setTotalPages(Math.ceil(content.length / itemsPerPage));
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
    { label: 'Sản phẩm', link: null }
  ];

  return (
    <div className="product-list-page">
      <div className="page-header-banner">
        <h1>Bộ Sưu Tập Giày Thể Thao</h1>
        <p>Hàng trăm mẫu giày đang chờ bạn khám phá</p>
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
              {categories.map(cat => (
                <li 
                  key={cat.id}
                  className={filter.categoryId === cat.id.toString() ? 'active' : ''}
                  onClick={() => { setFilter(prev => ({...prev, categoryId: cat.id.toString()})); setCurrentPage(1); }}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>

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
