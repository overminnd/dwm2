// ===================================
// src/routes/index.js
// Archivo central para importar todas las rutas
// ===================================
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import orderRoutes from './orderRoutes.js';
import addressRoutes from './addressRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import contactRoutes from './contactRoutes.js';

export default function setupRoutes(app) {
  // Autenticación
  app.use('/api/auth', authRoutes);
  
  // Usuarios
  app.use('/api/users', userRoutes);
  
  // Productos
  app.use('/api/products', productRoutes);
  
  // Carrito
  app.use('/api/cart', cartRoutes);
  
  // Categorías
  app.use('/api/categories', categoryRoutes);
  
  // Banners
  app.use('/api/banners', bannerRoutes);
  
  // Órdenes
  app.use('/api/orders', orderRoutes);
  
  // Direcciones
  app.use('/api/addresses', addressRoutes);
  
  // Reseñas
  app.use('/api/reviews', reviewRoutes);
  
  // Contacto
  app.use('/api/contact', contactRoutes);
  
  console.log('✅ Todas las rutas configuradas correctamente');
}

// También puedes exportar individualmente si lo prefieres
export {
  authRoutes,
  userRoutes,
  productRoutes,
  cartRoutes,
  categoryRoutes,
  bannerRoutes,
  orderRoutes,
  addressRoutes,
  reviewRoutes,
  contactRoutes
};