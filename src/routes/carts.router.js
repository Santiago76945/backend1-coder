// src/routes/carts.router.js

const express = require('express');
const router = express.Router();
const Cart = require('../models/cart.model');

router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    }
    res.json({ status: 'success', payload: cart.products });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Implementa de forma similar los demás endpoints actualizando el carrito con operaciones Mongoose

module.exports = router;
