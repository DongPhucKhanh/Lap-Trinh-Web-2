import React, { useState } from 'react';
import { Tag, Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import voucherService from '../../services/voucherService';

const VoucherCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    status: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountPercent) {
      alert('Vui lòng nhập Mã code và Mức giảm %');
      return;
    }

    setLoading(true);
    const dataToSubmit = {
      ...formData,
      discountPercent: parseFloat(formData.discountPercent),
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      status: parseInt(formData.status)
    };

    voucherService.create(dataToSubmit)
      .then(() => {
        alert('Thêm mã khuyến mãi thành công!');
        navigate('/admin/vouchers');
      })
      .catch(err => {
        alert('Có lỗi xảy ra: ' + (err.response?.data || err.message));
        setLoading(false);
      });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><Tag /> Thêm Mã Khuyến Mãi</h2>
        <Link to="/admin/vouchers" className="btn-secondary">
          <ArrowLeft size={18} /> Quay lại
        </Link>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã Code (Code nhập) <span className="text-red">*</span></label>
            <input 
              type="text" 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              required 
              placeholder="VD: SUMMER2026"
            />
          </div>

          <div className="form-group">
            <label>Mức giảm theo phần trăm (%) <span className="text-red">*</span></label>
            <input 
              type="number" 
              name="discountPercent" 
              value={formData.discountPercent} 
              onChange={handleChange} 
              required 
              min="1" max="100"
              placeholder="VD: 15 (tương đương 15%)"
            />
          </div>

          <div className="form-group">
            <label>Số tiền giảm tối đa (VNĐ)</label>
            <input 
              type="number" 
              name="maxDiscountAmount" 
              value={formData.maxDiscountAmount} 
              onChange={handleChange} 
              placeholder="VD: 50000 (Để trống nếu không giới hạn)"
            />
          </div>

          <div className="form-group">
            <label>Giá trị đơn hàng tối thiểu (VNĐ)</label>
            <input 
              type="number" 
              name="minOrderValue" 
              value={formData.minOrderValue} 
              onChange={handleChange} 
              placeholder="VD: 200000 (Để trống nếu áp dụng mọi đơn)"
            />
          </div>

          <div className="form-group">
            <label>Giới hạn lượt sử dụng</label>
            <input 
              type="number" 
              name="usageLimit" 
              value={formData.usageLimit} 
              onChange={handleChange} 
              placeholder="VD: 100 (Để trống nếu không giới hạn)"
            />
          </div>

          <div className="form-group">
            <label>Ngày bắt đầu</label>
            <input 
              type="datetime-local" 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Ngày kết thúc</label>
            <input 
              type="datetime-local" 
              name="endDate" 
              value={formData.endDate} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Mã Khuyến Mãi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherCreate;
