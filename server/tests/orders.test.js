const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { Menu, Order } = require('../models/db');

let seededMenuItemId;
let createdOrderId;

beforeAll(async () => {
  // Seed a menu item for order tests
  const item = await Menu.create({
    name: 'Test Burger',
    description: 'A test burger for orders',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
  });
  seededMenuItemId = item._id.toString();
});

afterAll(async () => {
  // Clean up test data
  await Menu.deleteMany({ name: 'Test Burger' });
  await Order.deleteMany({ 'customerDetails.name': 'Test User' });
  await mongoose.connection.close();
});

describe('Orders API - CRUD', () => {
  // ─── CREATE ───────────────────────────────────────────────
  it('POST /api/orders - should create a new order successfully', async () => {
    const payload = {
      items: [{ menuItemId: seededMenuItemId, quantity: 2 }],
      customerDetails: {
        name: 'Test User',
        address: '123 Test Street, City',
        phone: '9876543210'
      }
    };

    const res = await request(app).post('/api/orders').send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('status', 'Order Received');
    expect(res.body).toHaveProperty('total');
    expect(res.body.total).toBeCloseTo(19.98); // 9.99 * 2
    expect(res.body.items).toHaveLength(1);

    createdOrderId = res.body.id;
  });

  // ─── READ ALL ─────────────────────────────────────────────
  it('GET /api/orders - should retrieve all orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ─── READ ONE ─────────────────────────────────────────────
  it('GET /api/orders/:id - should retrieve a specific order', async () => {
    const res = await request(app).get(`/api/orders/${createdOrderId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdOrderId);
    expect(res.body).toHaveProperty('status', 'Order Received');
    expect(res.body.customerDetails).toHaveProperty('name', 'Test User');
  });

  it('GET /api/orders/:id - should return 404 for non-existent order', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/orders/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });

  // ─── UPDATE STATUS ────────────────────────────────────────
  it('PATCH /api/orders/:id/status - should update order status to Preparing', async () => {
    const res = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'Preparing' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'Preparing');
  });

  it('PATCH /api/orders/:id/status - should update order status to Out for Delivery', async () => {
    const res = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'Out for Delivery' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'Out for Delivery');
  });

  it('PATCH /api/orders/:id/status - should update order status to Delivered', async () => {
    const res = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'Delivered' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'Delivered');
  });
});

describe('Orders API - Input Validation', () => {
  it('POST /api/orders - should fail with empty items array', async () => {
    const payload = {
      items: [],
      customerDetails: {
        name: 'Test User',
        address: '123 Test St',
        phone: '9876543210'
      }
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/orders - should fail without customer name', async () => {
    const payload = {
      items: [{ menuItemId: seededMenuItemId, quantity: 1 }],
      customerDetails: {
        address: '123 Test St',
        phone: '9876543210'
        // name is missing
      }
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/orders - should fail without delivery address', async () => {
    const payload = {
      items: [{ menuItemId: seededMenuItemId, quantity: 1 }],
      customerDetails: {
        name: 'Test User',
        phone: '9876543210'
        // address is missing
      }
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/orders - should fail without phone number', async () => {
    const payload = {
      items: [{ menuItemId: seededMenuItemId, quantity: 1 }],
      customerDetails: {
        name: 'Test User',
        address: '123 Test St'
        // phone is missing
      }
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/orders - should fail without customerDetails', async () => {
    const payload = {
      items: [{ menuItemId: seededMenuItemId, quantity: 1 }]
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('PATCH /api/orders/:id/status - should fail without status field', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/api/orders/${fakeId}/status`)
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
