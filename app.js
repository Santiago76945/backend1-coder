// app.js
const express = require('express');
const app = express();

// Importa los routers
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

// Middlewares para parsear JSON y datos urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas base
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

