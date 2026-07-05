import React, { useEffect, useState } from 'react';
import { Tag, Trash2, Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import voucherService from '../../services/voucherService';
import Pagination from '../../components/Pagination/Pagination';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(vouchers.length / itemsPerPage);
  const paginatedVouchers = vouchers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchVouchers = () => {
    setLoading(true);
    voucherService.getAll()
      .then(res => {
        setVouchers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá mã khuyến mãi này?')) {
      voucherService.delete(id)
        .then(() => fetchVouchers())
        .catch(err => alert('Có lỗi xảy ra: ' + (err.response?.data || err.message)));
    }
  };

  return (
    <div className="admin-page voucher-page">
      <div className="voucher-header">
        <h2 className="title-italic">QUẢN LÝ KHUYẾN MÃI</h2>
        <Link to="/admin/vouchers/create" className="btn-voucher-create">
          + TẠO VOUCHER MỚI
        </Link>
      </div>

      <div className="card-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? <div className="loader" style={{ margin: '3rem auto' }}></div> : (
          <div className="table-responsive">
            <table className="voucher-table">
              <thead>
                <tr>
                  <th>CHƯƠNG TRÌNH</th>
                  <th>MỨC GIẢM</th>
                  <th style={{textAlign: 'center'}}>ĐÃ DÙNG</th>
                  <th style={{textAlign: 'center'}}>TRẠNG THÁI</th>
                  <th style={{textAlign: 'right'}}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVouchers.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="voucher-title">VOUCHER ƯU ĐÃI</div>
                      <div className="voucher-code">MÃ: <span className="code-text">{v.code}</span></div>
                    </td>
                    <td>
                      <div className="voucher-discount">
                        {v.discountPercent ? `${v.discountPercent}%` : (v.maxDiscountAmount ? `${v.maxDiscountAmount.toLocaleString()}đ` : 'SALE')}
                      </div>
                      <div className="voucher-min-order">
                        Đơn từ {v.minOrderValue ? v.minOrderValue.toLocaleString() : '0'}đ
                      </div>
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <div className="voucher-usage">
                        {v.usedCount || 0} / {v.usageLimit ? v.usageLimit : '∞'}
                      </div>
                    </td>
                    <td style={{textAlign: 'center'}}>
                      {v.status === 1 ? (
                        <span className="badge-voucher active">ĐANG CHẠY</span>
                      ) : (
                        <span className="badge-voucher expired">HẾT HẠN</span>
                      )}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <div className="action-btns" style={{justifyContent: 'flex-end'}}>
                        <Link to={`/admin/vouchers/edit/${v.id}`} className="btn-voucher-action edit">SỬA</Link>
                        <button className="btn-voucher-action delete" onClick={() => handleDelete(v.id)}>XÓA</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted">Chưa có mã khuyến mãi nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherList;
