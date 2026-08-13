"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { toggleCart } from "../store/cartSlice";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const dispatch = useDispatch();
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          🍔 <span>Crave</span>Bites
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button 
            onClick={() => dispatch(toggleCart())}
            style={{ position: "relative", cursor: "pointer" }}
            aria-label="Toggle Cart"
          >
            <ShoppingCart size={22} color="var(--text-secondary)" />
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                background: "var(--primary)",
                color: "#fff",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                fontSize: "0.65rem",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
