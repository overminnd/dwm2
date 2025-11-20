// ===================================
// src/app.js
// ===================================
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();

// Middlewares
app.use(helmet());

// CORS - Permitir múltiples orígenes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    config.frontendUrl // Mantener el original también
  ].filter(Boolean), // Filtrar undefined si config.frontendUrl no existe
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce MarAzul API ✅',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      cart: '/api/cart',
      categories: '/api/categories',
      banners: '/api/banners',
      orders: '/api/orders',
      addresses: '/api/addresses',
      reviews: '/api/reviews',
      contact: '/api/contact'
    }
  });
});

// Configurar todas las rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Ruta 404 - No encontrada
app.use(notFound);

// Manejo de errores global
app.use(errorHandler);

export default app;