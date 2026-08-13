const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s
    });
    isMongoConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.warn('⚠️  Falling back to in-memory storage...');
    isMongoConnected = false;
    // Do NOT exit - continue with in-memory fallback
  }
};

// ─── Mongoose Schemas ─────────────────────────────────────
const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.Mixed, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  customerDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  status: { type: String, default: 'Order Received' }
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);
const Order = mongoose.model('Order', orderSchema);

// ─── In-Memory Fallback ────────────────────────────────────
const inMemoryMenu = [
  {
    _id: '1',
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic delight with 100% real mozzarella cheese',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=500',
  },
  {
    _id: '2',
    id: '2',
    name: 'Double Cheeseburger',
    description: 'Two smashed beef patties, cheddar cheese, pickles, house sauce',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500',
  },
  {
    _id: '3',
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons, and Caesar dressing',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=500',
  },
  {
    _id: '4',
    id: '4',
    name: 'Spicy Chicken Wings',
    description: '6 pieces of spicy chicken wings with ranch dip',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=500',
  },
];

const inMemoryOrders = [];

module.exports = { connectDB, Menu, Order, inMemoryMenu, inMemoryOrders, isMongoConnected: () => isMongoConnected };
