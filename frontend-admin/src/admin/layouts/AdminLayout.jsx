import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-panel">
        <Header />
        <div className="content-wrapper">
          <Outlet /> {/* Các trang con sẽ được render tại đây */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
