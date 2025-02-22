// src/app.js

const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Poner la instancia de socket.io en el objeto app para poder usarla en los routers
app.set('io', io);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middlewares para parsear JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar routers
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
// Rutas para vistas
app.use('/', viewsRouter);

// Configuración de socket.io: conexión de clientes
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
