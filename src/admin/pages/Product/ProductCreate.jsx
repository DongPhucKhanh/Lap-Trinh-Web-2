import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, Save, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import uploadService from '../../services/uploadService';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    detail: '',
    status: 1,
    isFeatured: false,
    category: { id: '' },
    brand: { id: '' }
  });

  const [storeData, setStoreData] = useState({
    qty: 0,
    priceroot: 0
  });

  const [saleData, setSaleData] = useState({
    active: false,
    pricesale: 0,
    dateBegin: '',
    dateEnd: ''
  });

  // Variant Matrix States
  const [colors, setColors] = useState([]); // [{ name: 'Đen', files: [], previews: [] }]
  const [sizes, setSizes] = useState([]); // ['39', '40']
  const [variantMatrix, setVariantMatrix] = useState({}); // {'Đen-39': 10}
  
  const [tempColor, setTempColor] = useState('');
  const [tempSize, setTempSize] = useState('');

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data));
    brandService.getAll().then(res => setBrands(res.data));
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value,
      slug: generateSlug(e.target.value)
    });
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Matrix Handlers
  const handleAddColor = () => {
    if (!tempColor.trim()) return;
    if (colors.find(c => c.name === tempColor.trim())) {
      alert('Màu này đã tồn tại!'); return;
    }
    setColors([...colors, { name: tempColor.trim(), files: [], previews: [] }]);
    setTempColor('');
  };

  const handleRemoveColor = (colorName) => {
    setColors(colors.filter(c => c.name !== colorName));
    const newMatrix = { ...variantMatrix };
    Object.keys(newMatrix).forEach(k => {
      if (k.startsWith(colorName + '-')) delete newMatrix[k];
    });
    setVariantMatrix(newMatrix);
  };

  const handleAddSize = () => {
    if (!tempSize.trim()) return;
    
    // Tách các size bằng dấu phẩy
    const inputSizes = tempSize.split(',').map(s => s.trim()).filter(s => s !== '');
    const newSizes = [];
    let hasDuplicate = false;
    
    inputSizes.forEach(s => {
      if (!sizes.includes(s) && !newSizes.includes(s)) {
        newSizes.push(s);
      } else {
        hasDuplicate = true;
      }
    });

    if (newSizes.length > 0) {
      setSizes([...sizes, ...newSizes]);
    } else if (hasDuplicate && inputSizes.length === 1) {
      alert('Size này đã tồn tại!');
    }
    
    setTempSize('');
  };

  const handleRemoveSize = (sizeName) => {
    setSizes(sizes.filter(s => s !== sizeName));
    const newMatrix = { ...variantMatrix };
    Object.keys(newMatrix).forEach(k => {
      if (k.endsWith('-' + sizeName)) delete newMatrix[k];
    });
    setVariantMatrix(newMatrix);
  };

  const handleColorImageChange = (colorName, e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    
    setColors(colors.map(c => {
      if (c.name === colorName) {
        return { ...c, files: [...c.files, ...files], previews: [...c.previews, ...previews] };
      }
      return c;
    }));
  };

  const removeColorImage = (colorName, imgIndex) => {
    setColors(colors.map(c => {
      if (c.name === colorName) {
        const newFiles = c.files.filter((_, i) => i !== imgIndex);
        const newPreviews = c.previews.filter((_, i) => i !== imgIndex);
        return { ...c, files: newFiles, previews: newPreviews };
      }
      return c;
    }));
  };

  const handleMatrixChange = (color, size, val) => {
    setVariantMatrix({
      ...variantMatrix,
      [`${color}-${size}`]: val
    });
  };

  const handleBulkMatrix = () => {
    const bulkVal = prompt("Nhập số lượng áp dụng cho tất cả phân loại:");
    if (bulkVal !== null && !isNaN(bulkVal)) {
      const newMatrix = { ...variantMatrix };
      const sizesToLoop = sizes.length > 0 ? sizes : [''];
      colors.forEach(c => {
        sizesToLoop.forEach(s => {
          newMatrix[`${c.name}-${s}`] = parseInt(bulkVal, 10);
        });
      });
      setVariantMatrix(newMatrix);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category.id) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    setLoading(true);
    
    try {
      let finalImage = '';
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        finalImage = uploadRes.filename;
      }

      let galleryNames = [];
      for (const file of galleryFiles) {
        const uploadRes = await uploadService.uploadImage(file);
        galleryNames.push(uploadRes.filename);
      }

      const payload = { 
        ...formData, 
        image: finalImage,
        gallery: galleryNames.join(',')
      };
      
      if (!payload.brand.id) {
        delete payload.brand;
      }
      
      payload.productStore = {
        qty: Number(storeData.qty),
        priceroot: Number(storeData.priceroot)
      };
      
      if (saleData.active && Number(saleData.pricesale) > 0) {
        payload.productSale = {
          pricesale: Number(saleData.pricesale),
          dateBegin: saleData.dateBegin ? saleData.dateBegin + "T00:00:00" : null,
          dateEnd: saleData.dateEnd ? saleData.dateEnd + "T23:59:59" : null
        };
      }

      const res = await api.post('/products', payload);
      const createdProductId = res.data.id;

      // Create variants matrix
      if (colors.length > 0 && createdProductId) {
        const colorImagesMap = {};
        for (const c of colors) {
          const uploadedNames = [];
          for (const f of c.files) {
            const upRes = await uploadService.uploadImage(f);
            uploadedNames.push(upRes.filename);
          }
          colorImagesMap[c.name] = uploadedNames.join(',');
        }

        const sizesToLoop = sizes.length > 0 ? sizes : [''];
        for (const c of colors) {
          for (const s of sizesToLoop) {
            const qty = parseInt(variantMatrix[`${c.name}-${s}`] || 0, 10);
            await api.post(`/product-variants/product/${createdProductId}`, {
              color: c.name,
              size: s,
              qty: qty,
              image: colorImagesMap[c.name]
            });
          }
        }
      }

      setLoading(false);
      navigate('/admin/product');
    } catch (err) {
      setLoading(false);
      alert('Lỗi: ' + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="flex-row">
          <Link to="/admin/product" className="btn-icon"><ArrowLeft size={20}/></Link>
          <h2><Package /> Thêm Sản Phẩm Mới</h2>
        </div>
      </div>

      <div className="form-container card-panel">
        <form onSubmit={handleSubmit}>
          
          <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: 'var(--primary)'}}>1. Thông tin cơ bản</h3>
          <div className="form-group">
            <label>Tên sản phẩm <span className="text-red">*</span></label>
            <input required type="text" value={formData.name} onChange={handleNameChange} />
          </div>
          
          <div className="form-group">
            <label>Đường dẫn (Slug) <span className="text-red">*</span></label>
            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Giá bán (VNĐ) <span className="text-red">*</span></label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label>Trạng thái</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Hiện</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
            
            <div className="form-group" style={{flex: 1, display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '30px'}}>
              <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} style={{width: '20px', height: '20px'}} />
              <label htmlFor="isFeatured" style={{marginBottom: 0, cursor: 'pointer', fontWeight: 'bold', color: '#e67e22'}}>⭐ Sản phẩm nổi bật</label>
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Danh mục <span className="text-red">*</span></label>
              <select required value={formData.category.id} onChange={e => setFormData({...formData, category: { id: parseInt(e.target.value) }})}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label>Thương hiệu</label>
              <select value={formData.brand.id} onChange={e => setFormData({...formData, brand: { id: parseInt(e.target.value) }})}>
                <option value="">-- Không có thương hiệu --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh chính (Đại diện)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} 
            />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{marginTop: '10px', maxHeight: '150px', borderRadius: '8px', border: '2px solid #e2e8f0'}} />}
          </div>
          
          <div className="form-group">
            <label>Ảnh phụ (Gallery)</label>
            <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px'}}>
              {galleryPreviews.map((src, idx) => (
                <div key={idx} style={{position: 'relative', width: '100px', height: '100px'}}>
                  <img src={src} alt="Gallery Preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  <button type="button" onClick={() => removeGalleryImage(idx)} style={{position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <X size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả ngắn gọn</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          
          <div className="form-group">
            <label>Mô tả chi tiết (Bài viết)</label>
            <ReactQuill theme="snow" value={formData.detail} onChange={val => setFormData({...formData, detail: val})} style={{height: '250px', marginBottom: '50px'}} />
          </div>

          <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px', color: 'var(--primary)'}}>2. Quản lý Biến thể (Màu sắc & Kích cỡ)</h3>
          
          {/* MATRIX UI */}
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
            
            {/* Nhóm phân loại 1: Màu sắc */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Nhóm phân loại 1: Màu sắc</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="text" placeholder="Thêm màu sắc (VD: Trắng, Đen)" value={tempColor} 
                  onChange={e => setTempColor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                  style={{ flex: 1, maxWidth: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="button" onClick={handleAddColor} className="btn-secondary" style={{ padding: '8px 15px' }}>Thêm màu</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {colors.map((c, idx) => (
                  <div key={idx} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                    <button type="button" onClick={() => handleRemoveColor(c.name)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}><Trash2 size={18}/></button>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Màu: <span style={{ color: 'var(--primary)' }}>{c.name}</span></h5>
                    
                    <label style={{ cursor: 'pointer', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#f1f5f9', fontSize: '0.9rem' }}>
                      <ImageIcon size={14} /> Thêm ảnh cho màu này
                      <input type="file" accept="image/*" multiple onChange={(e) => handleColorImageChange(c.name, e)} style={{ display: 'none' }} />
                    </label>
                    
                    {c.previews.length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {c.previews.map((src, imgIdx) => (
                          <div key={imgIdx} style={{position: 'relative', width: '80px', height: '80px'}}>
                            <img src={src} alt="Color Gallery" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1'}} />
                            <button type="button" onClick={() => removeColorImage(c.name, imgIdx)} style={{position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              <X size={12}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nhóm phân loại 2: Kích cỡ */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Nhóm phân loại 2: Kích cỡ (Tùy chọn)</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="text" placeholder="Thêm size (VD: 39, 40, S, M)" value={tempSize} 
                  onChange={e => setTempSize(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                  style={{ flex: 1, maxWidth: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="button" onClick={handleAddSize} className="btn-secondary" style={{ padding: '8px 15px' }}>Thêm size</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {sizes.map((s, idx) => (
                  <div key={idx} style={{ padding: '5px 10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s}
                    <X size={14} style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleRemoveSize(s)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0 }}>Bảng nhập số lượng</h4>
                  <button type="button" onClick={handleBulkMatrix} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '5px 10px' }}>Áp dụng hàng loạt</button>
                </div>
                <table className="admin-table" style={{ width: '100%', fontSize: '14px', minWidth: '400px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {colors.length > 0 && <th>Màu sắc</th>}
                      {sizes.length > 0 && <th>Kích cỡ</th>}
                      <th>Số lượng kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(colors.length > 0 ? colors : [{name: ''}]).map(c => {
                      const sizesToLoop = sizes.length > 0 ? sizes : [''];
                      return sizesToLoop.map((s, idx) => (
                        <tr key={`${c.name}-${s}`}>
                          {colors.length > 0 && idx === 0 && <td rowSpan={sizesToLoop.length} style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>{c.name}</td>}
                          {sizes.length > 0 && <td>{s}</td>}
                          <td>
                            <input 
                              type="number" min="0" 
                              value={variantMatrix[`${c.name}-${s}`] || ''} 
                              onChange={e => handleMatrixChange(c.name, s, e.target.value)}
                              placeholder="0"
                              style={{ width: '100px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <h3 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px', color: 'var(--primary)'}}>3. Kho hàng & Khuyến mãi</h3>
          
          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Số lượng tồn kho ban đầu <span className="text-red">*</span></label>
              <input required type="number" min="0" value={storeData.qty} onChange={e => setStoreData({...storeData, qty: e.target.value})} />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>Giá nhập (Giá gốc)</label>
              <input type="number" min="0" value={storeData.priceroot} onChange={e => setStoreData({...storeData, priceroot: e.target.value})} />
            </div>
          </div>

          <div className="form-group" style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
              <input type="checkbox" id="hasSale" checked={saleData.active} onChange={e => setSaleData({...saleData, active: e.target.checked})} style={{width: '18px', height: '18px'}} />
              <label htmlFor="hasSale" style={{marginBottom: 0, cursor: 'pointer', fontWeight: 'bold'}}>Thiết lập Khuyến mãi (Sale)</label>
            </div>
            
            {saleData.active && (
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Giá khuyến mãi <span className="text-red">*</span></label>
                  <input type="number" min="0" required={saleData.active} value={saleData.pricesale} onChange={e => setSaleData({...saleData, pricesale: e.target.value})} />
                </div>
                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Ngày bắt đầu</label>
                  <input type="date" value={saleData.dateBegin} onChange={e => setSaleData({...saleData, dateBegin: e.target.value})} />
                </div>
                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Ngày kết thúc</label>
                  <input type="date" value={saleData.dateEnd} onChange={e => setSaleData({...saleData, dateEnd: e.target.value})} />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions" style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
            <Link to="/admin/product" className="btn-secondary">Hủy</Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
