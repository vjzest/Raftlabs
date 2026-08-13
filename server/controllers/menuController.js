const { Menu, inMemoryMenu, isMongoConnected } = require('../models/db');

const getMenu = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      // In-memory fallback
      return res.json(inMemoryMenu);
    }
    const menu = await Menu.find({});
    const formattedMenu = menu.map(item => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image
    }));
    res.json(formattedMenu);
  } catch (error) {
    // Fallback on any DB error
    res.json(inMemoryMenu);
  }
};

const getMenuItemById = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const item = inMemoryMenu.find(i => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Menu item not found' });
      return res.json(item);
    }
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMenu, getMenuItemById };
