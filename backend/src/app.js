import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API funcionando ✅' });
});

// Aquí irán tus rutas
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// ... etc

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error del servidor'
  });
});

export default app;