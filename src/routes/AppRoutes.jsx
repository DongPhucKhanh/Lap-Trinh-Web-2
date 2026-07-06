import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import UserLayout from '../layouts/UserLayout';

// Pages
import Home from '../pages/Home/Home';
import ProductList from '../pages/Product/ProductList';
import ProductDetail from '../pages/Product/ProductDetail';
import CategoryPage from '../pages/Category/CategoryPage';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import PaymentResult from '../pages/Checkout/PaymentResult';
import PaymentGateway from '../pages/Payment/PaymentGateway';
import OrderHistory from '../pages/Order/OrderHistory';
import OrderDetail from '../pages/Order/OrderDetail';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import VerifyAccount from '../pages/Auth/VerifyAccount';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Profile/Settings';
import Wishlist from '../pages/Profile/Wishlist';
import ContactHistory from '../pages/Profile/ContactHistory';
import Contact from '../pages/Contact/Contact';
import About from '../pages/About/About';
import PostList from '../pages/Post/PostList';
import PostDetail from '../pages/Post/PostDetail';
import NotFound from '../pages/NotFound/NotFound';
import PolicyPage from '../pages/Policy/PolicyPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Payment Gateway - standalone, không có Header/Footer */}
      <Route path="payment-gateway" element={<PaymentGateway />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="product" element={<ProductList />} />
        <Route path="sale" element={<ProductList isSalePage={true} />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="category/:id" element={<CategoryPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment-result" element={<PaymentResult />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<About />} />
        <Route path="post" element={<PostList />} />
        <Route path="post/:id" element={<PostDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-account" element={<VerifyAccount />} />
        <Route path="policy/:type" element={<PolicyPage />} />
      </Route>

      <Route path="/user" element={<UserLayout />}>
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="order" element={<OrderHistory />} />
        <Route path="order/:id" element={<OrderDetail />} />
        <Route path="contact-history" element={<ContactHistory />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
