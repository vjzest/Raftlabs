const { Order, inMemoryMenu, inMemoryOrders, isMongoConnected } = require('../models/db');

const STATUS_SEQUENCE = [
  { status: 'Preparing', delay: 10000 },
  { status: 'Out for Delivery', delay: 30000 },
  { status: 'Delivered', delay: 60000 },
];

// SSE clients: orderId -> Set of res objects
const sseClients = new Map();

const pushStatusUpdate = (orderId, status) => {
  const clients = sseClients.get(orderId);
  if (!clients || clients.size === 0) return;
  clients.forEach(client => {
    try { client.write(`data: ${JSON.stringify({ status })}\n\n`); } catch (_) {}
  });
};

// ─── Helper: calculate total ──────────────────────────────
const calculateTotal = (items) => {
  let total = 0;
  for (const item of items) {
    const menuItem = inMemoryMenu.find(m => m.id === item.menuItemId || m._id === item.menuItemId);
    if (menuItem) total += menuItem.price * item.quantity;
  }
  return total;
};

// ─── CREATE ORDER ─────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, customerDetails } = req.body;

    if (!isMongoConnected()) {
      // In-memory fallback
      const id = Date.now().toString();
      const total = calculateTotal(items);
      const newOrder = { id, items, total, customerDetails, status: 'Order Received', createdAt: new Date() };
      inMemoryOrders.push(newOrder);

      STATUS_SEQUENCE.forEach(({ status, delay }) => {
        setTimeout(() => {
          newOrder.status = status;
          pushStatusUpdate(id, status);
        }, delay);
      });

      return res.status(201).json(newOrder);
    }

    // MongoDB path
    let total = 0;
    const { Menu } = require('../models/db');
    for (const item of items) {
      try {
        const menuItem = await Menu.findById(item.menuItemId);
        if (menuItem) total += menuItem.price * item.quantity;
      } catch (_) {
        const fallback = inMemoryMenu.find(m => m.id === item.menuItemId);
        if (fallback) total += fallback.price * item.quantity;
      }
    }

    const newOrder = new Order({ items, total, customerDetails, status: 'Order Received' });
    const savedOrder = await newOrder.save();
    const orderId = savedOrder._id.toString();

    STATUS_SEQUENCE.forEach(({ status, delay }) => {
      setTimeout(async () => {
        try {
          await Order.findByIdAndUpdate(orderId, { status });
          pushStatusUpdate(orderId, status);
        } catch (err) { console.error(err); }
      }, delay);
    });

    const orderObj = savedOrder.toObject();
    orderObj.id = orderId;
    res.status(201).json(orderObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── SSE STREAM ───────────────────────────────────────────
const streamOrderStatus = async (req, res) => {
  const { id } = req.params;

  let currentStatus = 'Order Received';

  if (!isMongoConnected()) {
    const order = inMemoryOrders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    currentStatus = order.status;
  } else {
    try {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      currentStatus = order.status;
    } catch {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send current status immediately
  res.write(`data: ${JSON.stringify({ status: currentStatus })}\n\n`);

  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);

  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = sseClients.get(id);
    if (clients) { clients.delete(res); if (clients.size === 0) sseClients.delete(id); }
  });
};

// ─── GET ALL ORDERS ───────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    if (!isMongoConnected()) return res.json(inMemoryOrders);
    const orders = await Order.find({});
    res.json(orders.map(o => { const obj = o.toObject(); obj.id = obj._id.toString(); return obj; }));
  } catch {
    res.json(inMemoryOrders);
  }
};

// ─── GET ORDER BY ID ──────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o.id === req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json(order);
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const obj = order.toObject(); obj.id = obj._id.toString();
    res.json(obj);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

// ─── UPDATE STATUS ────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    if (!isMongoConnected()) {
      const order = inMemoryOrders.find(o => o.id === req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      order.status = status;
      pushStatusUpdate(req.params.id, status);
      return res.json(order);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const obj = order.toObject(); obj.id = obj._id.toString();
    pushStatusUpdate(req.params.id, status);
    res.json(obj);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, streamOrderStatus };
