// src/routes/views.router.js

const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

const PRODUCTS_FILE = './src/data/productos.json';

async function getProducts() {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

/**
 * GET /
 * Renderiza la vista home.handlebars, mostrando la lista de productos.
 */
router.get('/', async (req, res) => {
    const products = await getProducts();
    res.render('home', { products });
});

/**
 * GET /realtimeproducts
 * Renderiza la vista realTimeProducts.handlebars, mostrando la lista de productos y permitiendo la actualización en tiempo real.
 */
router.get('/realtimeproducts', async (req, res) => {
    const products = await getProducts();
    res.render('realTimeProducts', { products });
});

module.exports = router;
