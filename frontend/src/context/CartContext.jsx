import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('shopsphere_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    const saved = localStorage.getItem('shopsphere_shipping');
    return saved
      ? JSON.parse(saved)
      : {
          fullName: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'United States',
          phone: '',
        };
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('shopsphere_payment_method') || 'Cash on Delivery';
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('shopsphere_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('shopsphere_shipping', JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  useEffect(() => {
    localStorage.setItem('shopsphere_payment_method', paymentMethod);
  }, [paymentMethod]);

  // Add item to cart
  const addToCart = (product, qty = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.product === product._id);
    const maxStock = product.countInStock || 10;

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].qty;
      const newQty = Math.min(currentQty + qty, maxStock);
      
      const updated = [...cartItems];
      updated[existingIndex].qty = newQty;
      setCartItems(updated);
    } else {
      const newItem = {
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        countInStock: product.countInStock,
        vendor: product.vendor?.storeName || product.vendor?.name || 'Verified Seller',
        qty: Math.min(qty, maxStock),
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Update item quantity
  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product === productId) {
          const validQty = Math.min(qty, item.countInStock);
          return { ...item, qty: validQty };
        }
        return item;
      })
    );
  };

  // Remove item
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shopsphere_cart');
  };

  // Save Shipping Address
  const saveShippingAddress = (data) => {
    setShippingAddress(data);
  };

  // Save Payment Method
  const savePaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  // Computed Values
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );
  // Free shipping over ₹500 (or ₹150 threshold)
  const shippingPrice = itemsPrice > 150 || itemsPrice === 0 ? 0 : 15;
  // 8% estimated tax
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        shippingAddress,
        paymentMethod,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        saveShippingAddress,
        savePaymentMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
