import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Cart from '../src/components/Cart';

// Mock cartItems data
const mockItems = [
  { id: '1', name: 'Margherita Pizza', description: 'Classic pizza', price: 12.99, image: '', quantity: 2 },
  { id: '2', name: 'Double Cheeseburger', description: 'Juicy burger', price: 9.99, image: '', quantity: 1 }
];

describe('Cart Component', () => {
  it('renders empty state when no items', () => {
    render(<Cart items={[]} onUpdateQuantity={jest.fn()} onCheckout={jest.fn()} />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add items from the menu to get started')).toBeInTheDocument();
  });

  it('renders all cart items correctly', () => {
    render(<Cart items={mockItems} onUpdateQuantity={jest.fn()} onCheckout={jest.fn()} />);
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Double Cheeseburger')).toBeInTheDocument();
  });

  it('calculates per-item total correctly', () => {
    render(<Cart items={mockItems} onUpdateQuantity={jest.fn()} onCheckout={jest.fn()} />);
    // Pizza: 12.99 * 2 = 25.98
    expect(screen.getByText('$25.98')).toBeInTheDocument();
    // Burger: 9.99 * 1 = 9.99
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('shows correct subtotal for all items', () => {
    render(<Cart items={mockItems} onUpdateQuantity={jest.fn()} onCheckout={jest.fn()} />);
    // Total: 2*12.99 + 1*9.99 = 35.97
    expect(screen.getByText('$35.97')).toBeInTheDocument();
  });

  it('shows item count badge in cart title', () => {
    render(<Cart items={mockItems} onUpdateQuantity={jest.fn()} onCheckout={jest.fn()} />);
    // Total quantity: 2 + 1 = 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity with -1 when minus button clicked', () => {
    const mockUpdate = jest.fn();
    render(<Cart items={mockItems} onUpdateQuantity={mockUpdate} onCheckout={jest.fn()} />);
    
    const minusButtons = screen.getAllByLabelText('Decrease quantity');
    fireEvent.click(minusButtons[0]);
    expect(mockUpdate).toHaveBeenCalledWith('1', -1);
  });

  it('calls onUpdateQuantity with +1 when plus button clicked', () => {
    const mockUpdate = jest.fn();
    render(<Cart items={mockItems} onUpdateQuantity={mockUpdate} onCheckout={jest.fn()} />);
    
    const plusButtons = screen.getAllByLabelText('Increase quantity');
    fireEvent.click(plusButtons[1]);
    expect(mockUpdate).toHaveBeenCalledWith('2', 1);
  });

  it('calls onCheckout when Proceed to Checkout is clicked', () => {
    const mockCheckout = jest.fn();
    render(<Cart items={mockItems} onUpdateQuantity={jest.fn()} onCheckout={mockCheckout} />);
    
    fireEvent.click(screen.getByText('Proceed to Checkout →'));
    expect(mockCheckout).toHaveBeenCalledTimes(1);
  });

  it('does not show checkout button when cart is empty', () => {
    render(<Cart items={[]} onUpdateQuantity={jest.fn()} onCheckout={jest.fn()} />);
    expect(screen.queryByText('Proceed to Checkout →')).not.toBeInTheDocument();
  });
});
