import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize from localStorage or empty array
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('snackhub_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync with localStorage on every change
  useEffect(() => {
    localStorage.setItem('snackhub_cart', JSON.stringify(cart));
  }, [cart]);

  // Listen for logout events to clear the cart
  useEffect(() => {
    const handleLogout = () => clearCart();
    window.addEventListener('auth_logout', handleLogout);
    return () => window.removeEventListener('auth_logout', handleLogout);
  }, []);

  // Actions
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // Create a unique cart item ID based on product ID and selected variants
      const cartItemId = `${product.id}-${product.selectedColor || 'default'}-${product.selectedSize || 'default'}`;
      
      const existingItem = prevCart.find(item => item.cartItemId === cartItemId);
      if (existingItem) {
        return prevCart.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.productSale?.pricesale ? item.productSale.pricesale : item.price;
    return total + (price * item.quantity);
  }, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
