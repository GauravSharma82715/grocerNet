import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../assets/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("app_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(true);

  // Save cart whenever items change
  useEffect(() => {
    localStorage.setItem("app_cart", JSON.stringify(items));
  }, [items]);

  // Add product to cart
  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prev, { product, quantity }];
    });

    setIsCartOpen(true);
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Update product quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
    setIsCartOpen(false);
  };

  // Total number of products
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Total price
  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
