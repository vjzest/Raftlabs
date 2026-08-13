"use client";

import { useEffect, useState } from 'react';
import { Package, ChefHat, Bike, CheckCircle } from 'lucide-react';
import styles from './OrderStatus.module.css';

interface OrderStatusProps {
  orderId: string;
  onNewOrder: () => void;
}

const steps = [
  { id: 'Order Received', icon: Package, label: 'Order Received' },
  { id: 'Preparing', icon: ChefHat, label: 'Preparing' },
  { id: 'Out for Delivery', icon: Bike, label: 'Out for Delivery' },
  { id: 'Delivered', icon: CheckCircle, label: 'Delivered' },
];

export default function OrderStatus({ orderId, onNewOrder }: OrderStatusProps) {
  const [status, setStatus] = useState<string>('Order Received');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Use Server-Sent Events for true real-time push updates
    const eventSource = new EventSource(`${apiUrl}/orders/${orderId}/stream`);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setStatus(data.status);
          // When delivered: close SSE and clear localStorage
          if (data.status === 'Delivered') {
            eventSource.close();
            setConnected(false);
            localStorage.removeItem('cravebites_active_order');
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE message', err);
      }
    };

    eventSource.onerror = () => {
      // SSE failed, fall back to polling
      setConnected(false);
      eventSource.close();

      // Fallback: poll every 3 seconds
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${apiUrl}/orders/${orderId}`);
          if (res.ok) {
            const data = await res.json();
            setStatus(data.status);
            if (data.status === 'Delivered') {
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Polling fallback error', err);
        }
      }, 3000);

      return () => clearInterval(interval);
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Track Your Order</h2>
        <div className={`${styles.liveIndicator} ${connected ? styles.live : styles.polling}`}>
          <span className={styles.dot}></span>
          {connected ? 'Live' : 'Tracking'}
        </div>
      </div>

      <p className={styles.orderId}>Order ID: <code>{orderId}</code></p>

      <div className={styles.timeline}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          let stepClass = styles.step;
          if (isActive) stepClass += ` ${styles.active}`;
          if (isCompleted) stepClass += ` ${styles.completed}`;

          return (
            <div key={step.id} className={stepClass}>
              <div className={styles.iconBox}>
                <Icon size={22} />
              </div>
              <span className={styles.stepName}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.statusBanner}>
        <p>Current Status: <strong>{status}</strong></p>
      </div>

      {status === 'Delivered' && (
        <button className={styles.newOrderBtn} onClick={onNewOrder}>
          🎉 Place New Order
        </button>
      )}
    </div>
  );
}
