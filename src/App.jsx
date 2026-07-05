import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from './components/ScrollToTop';
import Lenis from '@studio-freight/lenis';
import 'react-toastify/dist/ReactToastify.css';
import ChatBox from './components/ChatBox/ChatBox';
import './App.css';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <AppRoutes />
        <ChatBox />
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
