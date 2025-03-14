// src/routes/views.router.js

const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

router.get('/products', async (req, res) => {
  try {
    // Aquí se pueden aplicar filtros y paginación según se requiera para la vista
    const products = await Product.find().limit(10);
    res.render('index', { products });
  } catch (error) {
    res.status(500).send('Error al cargar productos');
  }
});

// Para la vista de detalles del producto
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).send('Error al cargar el producto');
  }
});

// Vista para el carrito específico
const Cart = require('../models/cart.model');
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.render('cartDetail', { cart });
  } catch (error) {
    res.status(500).send('Error al cargar el carrito');
  }
});

module.exports = router;
