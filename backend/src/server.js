import app from './app.js';
import connectDB from './config/database.js';
import { config } from './config/config.js';

// Conectar a la base de datos
connectDB();

// Iniciar servidor
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${config.env}`);
});