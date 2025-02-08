// routes/carts.router.js
const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

const CARTS_FILE = './data/carrito.json';

// Función para leer los carritos desde el archivo
async function readCartsFile() {
    try {
        const data = await fs.readFile(CARTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return []; // Si no existe o falla, devuelve un arreglo vacío
    }
}

// Función para escribir los carritos en el archivo
async function writeCartsFile(carts) {
    await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
}

/**
 * POST /
 * Crear un nuevo carrito.
 * Estructura: { id, products: [] }
 */
router.post('/', async (req, res) => {
    try {
        const carts = await readCartsFile();
        const newId = carts.length > 0 ? (Math.max(...carts.map(c => Number(c.id))) + 1) : 1;
        const newCart = {
            id: newId,
            products: []
        };
        carts.push(newCart);
        await writeCartsFile(carts);
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear carrito' });
    }
});

/**
 * GET /:cid
 * Listar los productos del carrito con el ID proporcionado.
 */
router.get('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const carts = await readCartsFile();
        const cart = carts.find(c => String(c.id) === cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer carrito' });
    }
});

/**
 * POST /:cid/product/:pid
 * Agregar un producto al carrito:
 *  - Si el producto ya existe en el carrito, incrementar su cantidad.
 *  - Si no existe, agregarlo con cantidad 1.
 * Se debe agregar solo el ID del producto y la cantidad.
 */
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const carts = await readCartsFile();
        const cartIndex = carts.findIndex(c => String(c.id) === cid);
        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        // Verifica si el producto ya existe en el carrito
        const productIndex = carts[cartIndex].products.findIndex(item => String(item.product) === pid);
        if (productIndex !== -1) {
            // Incrementa la cantidad
            carts[cartIndex].products[productIndex].quantity += 1;
        } else {
            // Agrega el producto con cantidad 1
            carts[cartIndex].products.push({
                product: pid,
                quantity: 1
            });
        }
        await writeCartsFile(carts);
        res.json(carts[cartIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

module.exports = router;
