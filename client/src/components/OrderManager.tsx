"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { addToCart, updateQuantity, clearCart } from "../store/cartSlice";
import { useToast } from "./Toast";
import Menu, { MenuItem } from "./Menu";
import Cart from "./Cart";
import Checkout from "./Checkout";
import OrderStatus from "./OrderStatus";

const ORDER_STORAGE_KEY = "cravebites_active_order";

interface OrderManagerProps {
  initialMenu: MenuItem[];
}

export default function OrderManager({ initialMenu }: OrderManagerProps) {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);


  useEffect(() => {
    const saved = localStorage.getItem(ORDER_STORAGE_KEY);
    if (saved) setPlacedOrderId(saved);
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    dispatch(addToCart(item));
    showToast(`${item.name} added to cart!`, "success");
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (delta < 0 && item && item.quantity === 1) {
      showToast("Item removed from cart", "info");
    }
    dispatch(updateQuantity({ id, delta }));
  };

  const handlePlaceOrder = async (customerDetails: {
    name: string;
    address: string;
    phone: string;
  }) => {
    try {
      const payload = {
        items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        customerDetails,
      };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const order = await res.json();
        localStorage.setItem(ORDER_STORAGE_KEY, order.id);
        setPlacedOrderId(order.id);
        dispatch(clearCart());
        setShowCheckout(false);
        setShowOrderPanel(true);
        showToast("Order placed successfully! 🎉", "success");
      } else {
        showToast("Failed to place order. Try again.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    }
  };

  const handleNewOrder = () => {
    localStorage.removeItem(ORDER_STORAGE_KEY);
    setPlacedOrderId(null);
    setShowOrderPanel(false);
    showToast("Ready for a new order!", "info");
  };

  return (
    <>

      {placedOrderId && (
        <div style={{
          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
          border: "1px solid #fed7aa",
          borderRadius: "12px",
          padding: "0.75rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🛵</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#9a3412" }}>
                You have an active order!
              </p>
              <p style={{ fontSize: "0.75rem", color: "#c2410c" }}>
                Order ID: {placedOrderId}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOrderPanel(true)}
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Track Order →
          </button>
        </div>
      )}


      <div className="main-grid">
        <div className="animate-fade-in">
          <Menu items={initialMenu} onAddToCart={handleAddToCart} />
        </div>
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={() => setShowCheckout(true)}
        />
      </div>


      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(false)}
          onSubmit={handlePlaceOrder}
        />
      )}


      {showOrderPanel && placedOrderId && (
        <>

          <div
            onClick={() => setShowOrderPanel(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              zIndex: 998,
            }}
          />

          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "min(440px, 95vw)",
            background: "#ffffff",
            zIndex: 999,
            overflowY: "auto",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.15)",
            animation: "slideInRight 0.3s cubic-bezier(0.4,0,0.2,1) both",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #e5e7eb",
            }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", letterSpacing: "-0.02em" }}>
                📦 Order Status
              </div>
              <button
                onClick={() => setShowOrderPanel(false)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "#f3f4f6", border: "1px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: "1.1rem", color: "#6b7280",
                }}
              >
                ✕
              </button>
            </div>

            <OrderStatus orderId={placedOrderId} onNewOrder={handleNewOrder} />
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
}
