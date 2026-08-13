"use client";

import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import styles from "./Cart.module.css";
import { CartItem } from "../store/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setCartOpen } from "../store/cartSlice";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onUpdateQuantity, onCheckout }: CartProps) {
  const dispatch = useDispatch();
  const isCartOpen = useSelector((state: RootState) => state.cart.isCartOpen);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartClasses = `${styles.cart} ${isCartOpen ? styles.open : ""}`;

  return (
    <>
      {/* Mobile backdrop */}
      {isCartOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => dispatch(setCartOpen(false))}
        />
      )}
      
      <div className={cartClasses}>
        <div className={styles.title}>
          <ShoppingBag size={20} />
          Your Cart
          {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          
          <button 
            className={styles.closeBtn} 
            onClick={() => dispatch(setCartOpen(false))}
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} className={styles.emptyIcon} />
            <p>Your cart is empty</p>
            <span>Add items from the menu to get started</span>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName} title={item.name}>{item.name}</div>
                    <div className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className={styles.controls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <div className={styles.totalRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span className={styles.totalAmount}>${totalAmount.toFixed(2)}</span>
              </div>
              <button 
                className={styles.checkoutBtn} 
                onClick={() => {
                  onCheckout();
                  dispatch(setCartOpen(false));
                }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
