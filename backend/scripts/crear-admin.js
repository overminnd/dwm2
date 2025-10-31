// ===================================
// scripts/crear-admin.js
// Script simple para crear un usuario admin
// ===================================
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const crearAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Definir schema de usuario
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: String,
      phone: String,
      role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      isActive: { type: Boolean, default: true },
      avatarUrl: String
    }, { 
      timestamps: true 
    });

    const User = mongoose.model('User', userSchema);

    // Verificar si el admin ya existe
    const adminExiste = await User.findOne({ email: 'admin@marazul.com' });
    
    if (adminExiste) {
      console.log('\n⚠️  El usuario admin@marazul.com ya existe');
      console.log('🔄 Actualizando rol a admin por si acaso...');
      
      await User.updateOne(
        { email: 'admin@marazul.com' },
        { $set: { role: 'admin', isActive: true } }
      );
      
      console.log('✅ Usuario actualizado correctamente');
    } else {
      console.log('\n🔨 Creando nuevo usuario admin...');
      
      // Hashear password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Crear usuario admin
      const admin = await User.create({
        email: 'admin@marazul.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'MarAzul',
        phone: '912345678',
        role: 'admin',
        isActive: true
      });

      console.log('✅ Usuario admin creado exitosamente!');
      console.log(`   ID: ${admin._id}`);
    }

    // Mostrar credenciales
    console.log('\n' + '='.repeat(50));
    console.log('🔐 CREDENCIALES DE ADMINISTRADOR');
    console.log('='.repeat(50));
    console.log('\n   📧 Email:    admin@marazul.com');
    console.log('   🔑 Password: admin123');
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Ahora puedes hacer login como admin en Postman\n');

    // Verificación adicional
    const verificacion = await User.findOne({ email: 'admin@marazul.com' });
    console.log('📊 Verificación:');
    console.log(`   - Email: ${verificacion.email}`);
    console.log(`   - Nombre: ${verificacion.firstName} ${verificacion.lastName}`);
    console.log(`   - Rol: ${verificacion.role}`);
    console.log(`   - Activo: ${verificacion.isActive ? 'Sí' : 'No'}`);
    console.log('');

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Desconectado de MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solución: Asegúrate de que MongoDB esté corriendo');
      console.log('   Ejecuta: mongosh');
      console.log('   Si no conecta, inicia MongoDB primero\n');
    }
    
    if (error.code === 11000) {
      console.log('\n💡 El usuario ya existe. Usa mongosh para cambiar el rol:');
      console.log('   mongosh');
      console.log('   use marazul');
      console.log('   db.users.updateOne({ email: "admin@marazul.com" }, { $set: { role: "admin" } })');
      console.log('');
    }
    
    process.exit(1);
  }
};

// Ejecutar
console.log('\n🚀 Iniciando creación de usuario admin...\n');
crearAdmin();