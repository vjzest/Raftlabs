const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { Menu } = require('../models/db');

let seededMenuItemId;

beforeAll(async () => {
  // Seed one menu item for testing
  const item = await Menu.create({
    name: 'Test Pizza',
    description: 'A test pizza',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'
  });
  seededMenuItemId = item._id.toString();
});

afterAll(async () => {
  // Clean up test data
  await Menu.deleteMany({ name: 'Test Pizza' });
  await mongoose.connection.close();
});

describe('Menu API', () => {
  it('GET /api/menu - should retrieve all menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('price');
  });

  it('GET /api/menu/:id - should retrieve a specific menu item', async () => {
    const res = await request(app).get(`/api/menu/${seededMenuItemId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', seededMenuItemId);
    expect(res.body).toHaveProperty('name', 'Test Pizza');
    expect(res.body).toHaveProperty('price', 10.99);
  });

  it('GET /api/menu/:id - should return 404 for non-existent item', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/menu/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });
});
