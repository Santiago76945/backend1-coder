// src/routes/products.router.js

const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

const PRODUCTS_FILE = '../data/productos.json';

// Función para leer los productos desde el archivo
async function readProductsFile() {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return []; // Si no existe o falla, devuelve un arreglo vacío
    }
}

// Función para escribir los productos en el archivo y registrar el cambio en el log
async function writeProductsFile(products) {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    const logEntry = `${new Date().toISOString()} - Productos actualizados: ${JSON.stringify(products)}\n`;
    await fs.appendFile('../data/productos_history.log', logEntry);
}

/**
 * GET /
 * Listar todos los productos.
 * Soporta el query param ?limit para limitar la cantidad de productos.
 */
router.get('/', async (req, res) => {
    try {
        const products = await readProductsFile();
        let result = products;
        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            result = products.slice(0, limit);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

/**
 * GET /:pid
 * Traer solo el producto con el ID proporcionado.
 */
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const products = await readProductsFile();
        const product = products.find(p => String(p.id) === pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer productos' });
    }
});

/**
 * POST /
 * Agregar un nuevo producto.
 * Campos obligatorios: title, description, code, price, stock, category.
 * status se asigna en true por defecto.
 * thumbnails es opcional.
 * El id se genera automáticamente.
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const products = await readProductsFile();
        const newId = products.length > 0 ? (Math.max(...products.map(p => Number(p.id))) + 1) : 1;

        const newProduct = {
            id: newId,
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || []
        };

        products.push(newProduct);
        await writeProductsFile(products);

        // Emite el evento de actualización de productos a través de sockets
        const io = req.app.get('io');
        if (io) {
            io.emit('updateProducts', products);
        }

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

/**
 * PUT /:pid
 * Actualizar un producto por los campos enviados en el body.
 * Nunca se debe actualizar el id.
 */
router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const updatedFields = req.body;
        if (updatedFields.id) {
            delete updatedFields.id; // Se elimina cualquier intento de actualizar el id
        }
        const products = await readProductsFile();
        const index = products.findIndex(p => String(p.id) === pid);
        if (index === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        const updatedProduct = { ...products[index], ...updatedFields };
        products[index] = updatedProduct;
        await writeProductsFile(products);

        // Emitir actualización (si se desea que la modificación se refleje en tiempo real)
        const io = req.app.get('io');
        if (io) {
            io.emit('updateProducts', products);
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

/**
 * DELETE /:pid
 * Eliminar el producto con el ID indicado.
 */
router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        let products = await readProductsFile();
        const index = products.findIndex(p => String(p.id) === pid);
        if (index === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        const deletedProduct = products.splice(index, 1)[0];
        await writeProductsFile(products);

        // Emitir actualización para reflejar la eliminación en tiempo real
        const io = req.app.get('io');
        if (io) {
            io.emit('updateProducts', products);
        }

        res.json({ message: 'Producto eliminado', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;
