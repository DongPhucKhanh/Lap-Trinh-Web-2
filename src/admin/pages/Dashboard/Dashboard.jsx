import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import './Dashboard.css';

// --- Mock Data for Charts (SaaS Look) ---
const revenueData = [
  { name: 'T1', total: 1200000 }, { name: 'T2', total: 2100000 },
  { name: 'T3', total: 1800000 }, { name: 'T4', total: 2400000 },
  { name: 'T5', total: 2800000 }, { name: 'T6', total: 3200000 },
  { name: 'T7', total: 3800000 }
];

const orderData = [
  { name: 'T2', orders: 12 }, { name: 'T3', orders: 19 },
  { name: 'T4', orders: 15 }, { name: 'T5', orders: 22 },
  { name: 'T6', orders: 30 }, { name: 'T7', orders: 28 },
  { name: 'CN', orders: 35 }
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Polling ngầm mỗi 3 giây để cập nhật đơn hàng mới mà không cần F5
    const intervalId = setInterval(() => {
      dashboardService.getStats()
        .then(response => {
          setStats(response.data);
        })
        .catch(err => console.error("Polling error in dashboard:", err));
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 0: return <span className="saas-badge pending">Chờ xác nhận</span>;
      case 1: case 2: return <span className="saas-badge processing">Đang xử lý</span>;
      case 3: return <span className="saas-badge delivering">Đang giao</span>;
      case 4: case 5: return <span className="saas-badge completed">Thành công</span>;
      case 6: return <span className="saas-badge cancelled">Đã hủy</span>;
      default: return <span className="saas-badge">Khác</span>;
    }
  };

  if (loading) {
    return <div className="saas-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="saas-dashboard">
      <motion.div 
        className="saas-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="saas-title">Tổng quan kinh doanh</h1>
          <p className="saas-subtitle">Theo dõi các chỉ số quan trọng trong hôm nay.</p>
        </div>
      </motion.div>

      <motion.div 
        className="saas-bento-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Stat Card 1 */}
        <motion.div className="saas-card" variants={itemVariants}>
          <div className="saas-card-header">
            <span className="saas-card-label">Doanh Thu</span>
            <div className="saas-card-icon primary"><DollarSign size={20} /></div>
          </div>
          <h3 className="saas-card-value">{formatCurrency(stats.totalRevenue)}</h3>
          <div className="saas-card-growth saas-growth-positive">
            <ArrowUpRight size={16} /> <span>12.5%</span> 
            <span className="saas-growth-text">so với tháng trước</span>
          </div>
        </motion.div>

        {/* Stat Card 2 */}
        <motion.div className="saas-card" variants={itemVariants}>
          <div className="saas-card-header">
            <span className="saas-card-label">Đơn Hàng</span>
            <div className="saas-card-icon success"><ShoppingBag size={20} /></div>
          </div>
          <h3 className="saas-card-value">{stats.totalOrders}</h3>
          <div className="saas-card-growth saas-growth-positive">
            <ArrowUpRight size={16} /> <span>8.2%</span> 
            <span className="saas-growth-text">so với tháng trước</span>
          </div>
        </motion.div>

        {/* Stat Card 3 */}
        <motion.div className="saas-card" variants={itemVariants}>
          <div className="saas-card-header">
            <span className="saas-card-label">Sản Phẩm</span>
            <div className="saas-card-icon warning"><Package size={20} /></div>
          </div>
          <h3 className="saas-card-value">{stats.totalProducts}</h3>
          <div className="saas-card-growth saas-growth-neutral">
            <span>+2</span> <span className="saas-growth-text">sản phẩm mới thêm tuần này</span>
          </div>
        </motion.div>

        {/* Stat Card 4 */}
        <motion.div className="saas-card" variants={itemVariants}>
          <div className="saas-card-header">
            <span className="saas-card-label">Khách Hàng</span>
            <div className="saas-card-icon danger"><Users size={20} /></div>
          </div>
          <h3 className="saas-card-value">{stats.totalUsers}</h3>
          <div className="saas-card-growth saas-growth-positive">
            <ArrowUpRight size={16} /> <span>24 mới</span> 
            <span className="saas-growth-text">trong tháng này</span>
          </div>
        </motion.div>
      </motion.div>

      {/* CHARTS GRID */}
      <motion.div 
        className="saas-charts-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="saas-chart-card">
          <h3 className="saas-chart-title">Tăng trưởng doanh thu</h3>
          <div className="saas-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(val) => `${val/1000000}tr`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="saas-chart-card">
          <h3 className="saas-chart-title">Đơn hàng theo ngày</h3>
          <div className="saas-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* MODERN TABLE */}
      <motion.div 
        className="saas-table-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="saas-table-header">
          <h3 className="saas-table-title">Giao dịch gần đây</h3>
          <TrendingUp size={20} color="#64748b" />
        </div>
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Điện Thoại</th>
                <th>Ngày Đặt</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.deliveryName}</td>
                    <td>{order.deliveryPhone}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>{getStatusBadge(order.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                    Chưa có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
};

export default Dashboard;
