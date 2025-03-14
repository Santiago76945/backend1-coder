// src/routes/products.router.js

const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const filter = {};

    // Si se recibe query, se puede filtrar por categoría o disponibilidad
    if (query) {
      // Por ejemplo, si query es un string que se debe buscar en la categoría
      filter.category = query;
      // O podrías manejar filtros más complejos
    }

    const sortOption = {};
    if (sort === 'asc' || sort === 'desc') {
      sortOption.price = sort === 'asc' ? 1 : -1;
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: sortOption
    };

    const totalDocs = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / options.limit);
    const products = await Product.find(filter, null, options);

    // Construir links (prevLink y nextLink) de forma dinámica según tus rutas
    const prevPage = parseInt(page) > 1 ? parseInt(page) - 1 : null;
    const nextPage = parseInt(page) < totalPages ? parseInt(page) + 1 : null;

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page: parseInt(page),
      hasPrevPage: prevPage !== null,
      hasNextPage: nextPage !== null,
      prevLink: prevPage ? `/api/products?page=${prevPage}&limit=${limit}` : null,
      nextLink: nextPage ? `/api/products?page=${nextPage}&limit=${limit}` : null
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Otros endpoints (GET por id, POST, PUT, DELETE) se adaptan de forma similar usando Mongoose

module.exports = router;
