"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './Checkout.module.css';

interface CheckoutProps {
  onClose: () => void;
  onSubmit: (details: { name: string; address: string; phone: string }) => void;
}

export default function Checkout({ onClose, onSubmit }: CheckoutProps) {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit(formData);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.title}>Complete Your Order</h2>
            <p className={styles.subtitle}>Enter your delivery details below</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name"
              className={styles.input}
              placeholder="e.g. John Doe"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="address">Delivery Address</label>
            <textarea
              id="address"
              className={styles.input}
              placeholder="e.g. 123 Main Street, City, ZIP"
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              placeholder="e.g. 9876543210"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className={styles.loading}>Placing Order...</span>
            ) : (
              'Place Order →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
