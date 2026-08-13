const validateOrder = (req, res, next) => {
  const { items, customerDetails } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required and cannot be empty' });
  }

  if (!customerDetails || !customerDetails.name || !customerDetails.address || !customerDetails.phone) {
    return res.status(400).json({ error: 'Incomplete customer details' });
  }

  next();
};

module.exports = {
  validateOrder
};
