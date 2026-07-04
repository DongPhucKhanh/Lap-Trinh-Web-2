import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Dashboard
import Dashboard from '../pages/Dashboard/Dashboard';

// Product
import ProductList from '../pages/Product/ProductList';
import ProductCreate from '../pages/Product/ProductCreate';
import ProductEdit from '../pages/Product/ProductEdit';
import ProductTrash from '../pages/Product/ProductTrash';
import ProductDetail from '../pages/Product/ProductDetail';

// Inventory
import Inventory from '../pages/Inventory/Inventory';

// Category
import CategoryList from '../pages/Category/CategoryList';
import CategoryCreate from '../pages/Category/CategoryCreate';
import CategoryEdit from '../pages/Category/CategoryEdit';
import CategoryTrash from '../pages/Category/CategoryTrash';

// Brand
import BrandList from '../pages/Brand/BrandList';
import BrandCreate from '../pages/Brand/BrandCreate';
import BrandEdit from '../pages/Brand/BrandEdit';
import BrandTrash from '../pages/Brand/BrandTrash';

// Order
import OrderList from '../pages/Order/OrderList';
import OrderDetail from '../pages/Order/OrderDetail';
import OrderTrash from '../pages/Order/OrderTrash';

// Customer
import CustomerList from '../pages/Customer/CustomerList';
import CustomerDetail from '../pages/Customer/CustomerDetail';

// Banner
import BannerList from '../pages/Banner/BannerList';
import BannerCreate from '../pages/Banner/BannerCreate';
import BannerEdit from '../pages/Banner/BannerEdit';
import BannerTrash from '../pages/Banner/BannerTrash';

// Post
import PostList from '../pages/Post/PostList';
import PostCreate from '../pages/Post/PostCreate';
import PostEdit from '../pages/Post/PostEdit';
import PostTrash from '../pages/Post/PostTrash';
import PostShow from '../pages/Post/PostShow';

// Topic
import TopicList from '../pages/Topic/TopicList';
import TopicCreate from '../pages/Topic/TopicCreate';
import TopicEdit from '../pages/Topic/TopicEdit';
import TopicTrash from '../pages/Topic/TopicTrash';

// Contact
import ContactList from '../pages/Contact/ContactList';
import ContactDetail from '../pages/Contact/ContactDetail';

// User
import UserList from '../pages/User/UserList';
import UserCreate from '../pages/User/UserCreate';
import UserEdit from '../pages/User/UserEdit';
import UserTrash from '../pages/User/UserTrash';

// Menu
import MenuList from '../pages/Menu/MenuList';
import MenuCreate from '../pages/Menu/MenuCreate';
import MenuEdit from '../pages/Menu/MenuEdit';

// Auth
import Login from '../pages/Auth/Login';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        
        <Route path="product">
          <Route index element={<ProductList />} />
          <Route path="create" element={<ProductCreate />} />
          <Route path="edit/:id" element={<ProductEdit />} />
          <Route path="trash" element={<ProductTrash />} />
          <Route path="detail/:id" element={<ProductDetail />} />
        </Route>

        <Route path="inventory" element={<Inventory />} />

        <Route path="category">
          <Route index element={<CategoryList />} />
          <Route path="create" element={<CategoryCreate />} />
          <Route path="edit/:id" element={<CategoryEdit />} />
          <Route path="trash" element={<CategoryTrash />} />
        </Route>

        <Route path="brand">
          <Route index element={<BrandList />} />
          <Route path="create" element={<BrandCreate />} />
          <Route path="edit/:id" element={<BrandEdit />} />
          <Route path="trash" element={<BrandTrash />} />
        </Route>

        <Route path="order">
          <Route index element={<OrderList />} />
          <Route path="detail/:id" element={<OrderDetail />} />
          <Route path="trash" element={<OrderTrash />} />
        </Route>

        <Route path="customer">
          <Route index element={<CustomerList />} />
          <Route path="detail/:id" element={<CustomerDetail />} />
        </Route>

        <Route path="banner">
          <Route index element={<BannerList />} />
          <Route path="create" element={<BannerCreate />} />
          <Route path="edit/:id" element={<BannerEdit />} />
          <Route path="trash" element={<BannerTrash />} />
        </Route>

        <Route path="post">
          <Route index element={<PostList />} />
          <Route path="create" element={<PostCreate />} />
          <Route path="edit/:id" element={<PostEdit />} />
          <Route path="show/:id" element={<PostShow />} />
          <Route path="trash" element={<PostTrash />} />
        </Route>

        <Route path="topic">
          <Route index element={<TopicList />} />
          <Route path="create" element={<TopicCreate />} />
          <Route path="edit/:id" element={<TopicEdit />} />
          <Route path="trash" element={<TopicTrash />} />
        </Route>

        <Route path="contact">
          <Route index element={<ContactList />} />
          <Route path="detail/:id" element={<ContactDetail />} />
        </Route>

        <Route path="user">
          <Route index element={<UserList />} />
          <Route path="create" element={<UserCreate />} />
          <Route path="edit/:id" element={<UserEdit />} />
          <Route path="trash" element={<UserTrash />} />
        </Route>

        <Route path="menu">
          <Route index element={<MenuList />} />
          <Route path="create" element={<MenuCreate />} />
          <Route path="edit/:id" element={<MenuEdit />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
