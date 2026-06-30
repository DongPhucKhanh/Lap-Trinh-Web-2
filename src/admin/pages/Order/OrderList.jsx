import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';

const OrderList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    orderService.getAll().then(res => { 
        // Sắp xếp đơn hàng mới nhất lên đầu
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setData(sorted); 
        setLoading(false); 
    }).catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá đơn hàng này?')) {
      orderService.delete(id).then(() => fetchData()).catch(err => alert('Lỗi: ' + err.message));
    }
  };

  const statuses = [
    { value: 0, label: 'Chờ xác nhận' },
    { value: 1, label: 'Đã xác nhận' },
    { value: 2, label: 'Đang chuẩn bị' },
    { value: 3, label: 'Đang giao' },
    { value: 4, label: 'Đã giao' },
    { value: 5, label: 'Hoàn thành' },
    { value: 6, label: 'Đã hủy' },
    { value: 7, label: 'Hoàn tiền' }
  ];

  const handleUpdateStatus = (id, newStatus) => {
    let payload = { status: Number(newStatus) };
    if (Number(newStatus) === 6 || Number(newStatus) === 7) {
      const reason = window.prompt("Vui lòng nhập lý do hủy/hoàn tiền để gửi thông báo cho khách hàng:");
      if (reason === null) return;
      if (!reason.trim()) {
        alert("Lý do không được để trống!");
        // Reset status on UI by fetching data again since the dropdown was changed
        fetchData();
        return;
      }
      payload.cancelReason = reason;
    }

    orderService.updateStatus(id, payload)
      .then(() => {
        alert('Cập nhật trạng thái thành công và đã gửi email!');
        fetchData();
      })
      .catch(err => {
        alert('Lỗi: ' + (err.response?.data || err.message));
        fetchData();
      });
  };

  const calculateTotal = (orderDetails) => {
    if (!orderDetails) return 0;
    return orderDetails.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2><FileText /> Quản Lý Đơn Hàng</h2>
      </div>
      <div className="table-container">
        {loading ? <div className="loader"></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Ngày đặt</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td><strong>#{item.id}</strong></td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</td>
                  <td>
                    <div><strong>{item.deliveryName}</strong></div>
                    <div style={{fontSize: '0.85rem', color: '#64748b'}}>{item.deliveryPhone}</div>
                  </td>
                  <td className="price-col">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal(item.orderDetails))}
                  </td>
                  <td>
                    <select 
                      value={item.status} 
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      {statuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={'/admin/order/detail/' + item.id} className="btn-icon text-blue" title="Xem chi tiết"><Eye size={18}/></Link>
                      <button className="btn-icon text-red" onClick={() => handleDelete(item.id)} title="Xóa"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="6" className="text-center py-4">Chưa có đơn hàng nào.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderList;
