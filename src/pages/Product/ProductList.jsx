import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, Search, Grid, List as ListIcon } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Pagination from '../../components/Pagination/Pagination';
import api from '../../services/api';
import './ProductList.css';

const ProductList = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSale = searchParams.get('sale') === 'true';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState({ 
    categoryId: initialCategory, 
    search: initialSearch, 
    sort: 'newest',
    saleOnly: initialSale
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Sync filter if URL changes
    setFilter(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('category') || '',
      saleOnly: searchParams.get('sale') === 'true'
    }));
  }, [location.search]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(err => console.error(err));
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        setProducts(res.data);
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

  // Filter and Sort Logic
  let displayedProducts = [...products];
  
  if (filter.search) {
    displayedProducts = displayedProducts.filter(p => p.name.toLowerCase().includes(filter.search.toLowerCase()));
  }
  
  if (filter.categoryId) {
    displayedProducts = displayedProducts.filter(p => p.category && p.category.id.toString() === filter.categoryId);
  }

  if (filter.saleOnly) {
    displayedProducts = displayedProducts.filter(p => p.productSale && p.productSale.pricesale);
  }
  
  if (filter.sort === 'priceAsc') {
    displayedProducts.sort((a, b) => {
      const priceA = (a.productSale && a.productSale.pricesale) ? a.productSale.pricesale : a.price;
      const priceB = (b.productSale && b.productSale.pricesale) ? b.productSale.pricesale : b.price;
      return priceA - priceB;
    });
  } else if (filter.sort === 'priceDesc') {
    displayedProducts.sort((a, b) => {
      const priceA = (a.productSale && a.productSale.pricesale) ? a.productSale.pricesale : a.price;
      const priceB = (b.productSale && b.productSale.pricesale) ? b.productSale.pricesale : b.price;
      return priceB - priceA;
    });
  } else {
    displayedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
  const paginatedProducts = displayedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const breadcrumbItems = [
    { label: 'Sản phẩm', link: null }
  ];

  return (
    <div className="product-list-page">
      <div className="page-header-banner">
        <h1>Thực Đơn Ăn Vặt</h1>
        <p>Hàng trăm món ngon đang chờ bạn khám phá</p>
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
                placeholder="Tên món ăn..." 
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
                Tất cả món ăn
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
            <span>Hiển thị <strong>{displayedProducts.length}</strong> kết quả</span>
            
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

              <select name="sort" value={filter.sort} onChange={handleFilterChange} className="sort-select-inline">
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá: Thấp đến Cao</option>
                <option value="priceDesc">Giá: Cao xuống Thấp</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loader"></div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className={`product-${viewMode}`}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} layout={viewMode} />
                ))}
              </div>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="empty-msg">Không tìm thấy món ăn nào phù hợp với bộ lọc.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
