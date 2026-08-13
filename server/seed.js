const mongoose = require('mongoose');
const { connectDB, Menu } = require('./models/db');
require('dotenv').config();

const menuItems = [
  {
    name: 'Margherita Pizza',
    description: 'Classic delight with 100% real mozzarella cheese',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=500',
  },
  {
    name: 'Double Cheeseburger',
    description: 'Two smashed beef patties, cheddar cheese, pickles, house sauce',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500',
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons, and Caesar dressing',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=500',
  },
  {
    name: 'Spicy Chicken Wings',
    description: '6 pieces of spicy chicken wings with ranch dip',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=500',
  }
];

const seedDB = async () => {
  await connectDB();
  await Menu.deleteMany({});
  await Menu.insertMany(menuItems);
  console.log('Database seeded!');
  process.exit(0);
};

seedDB();
