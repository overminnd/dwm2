// ===================================
// scripts/seed.js - Poblar BD con datos de prueba
// ===================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno
dotenv.config();

// Importar modelos
import User from '../src/models/user.js';
import Category from '../src/models/category.js';
import Product from '../src/models/product.js';
import Banner from '../src/models/banner.js';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Datos de prueba
const seedData = async () => {
  try {
    // Limpiar base de datos
    console.log('🧹 Limpiando base de datos...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    console.log('✅ Base de datos limpiada');

    // 1. CREAR USUARIOS
    console.log('\n👥 Creando usuarios...');
    
    // Usuario Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@marazul.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'MarAzul',
      phone: '912345678',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin creado:', admin.email);

    // Usuario Cliente
    const customerPassword = await bcrypt.hash('cliente123', 10);
    const customer = await User.create({
      email: 'cliente@example.com',
      password: customerPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '987654321',
      role: 'customer',
      isActive: true
    });
    console.log('✅ Cliente creado:', customer.email);

    // 2. CREAR CATEGORÍAS
    console.log('\n📂 Creando categorías...');
    
    const categorias = await Category.insertMany([
      {
        name: 'Mariscos Frescos',
        slug: 'mariscos-frescos',
        description: 'Los mejores mariscos frescos del día',
        imageUrl: 'https://images.unsplash.com/photo-1559737558-2f3c7b3d8c42?w=400',
        order: 1,
        active: true
      },
      {
        name: 'Pescados',
        slug: 'pescados',
        description: 'Pescados frescos de la mejor calidad',
        imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
        order: 2,
        active: true
      },
      {
        name: 'Congelados',
        slug: 'congelados',
        description: 'Productos del mar congelados',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
        order: 3,
        active: true
      },
      {
        name: 'Conservas',
        slug: 'conservas',
        description: 'Conservas de productos marinos',
        imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400',
        order: 4,
        active: true
      }
    ]);
    console.log(`✅ ${categorias.length} categorías creadas`);

    // 3. CREAR PRODUCTOS
    console.log('\n🦐 Creando productos...');
    
    const productos = await Product.insertMany([
      // Mariscos Frescos
      {
        name: 'Camarón Jumbo Fresco',
        slug: 'camaron-jumbo-fresco',
        description: 'Camarones jumbo frescos del día, de alta calidad. Perfectos para preparaciones gourmet.',
        shortDescription: 'Camarones jumbo frescos de primera calidad',
        price: 15990,
        categoryId: categorias[0]._id,
        stock: 50,
        status: 'published',
        sku: 'CAM-001',
        weight: 500,
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500', order: 1 }
        ]
      },
      {
        name: 'Langostinos Gigantes',
        slug: 'langostinos-gigantes',
        description: 'Langostinos gigantes frescos, ideales para parrilla o ceviche.',
        shortDescription: 'Langostinos gigantes premium',
        price: 18990,
        categoryId: categorias[0]._id,
        stock: 30,
        status: 'published',
        sku: 'LAN-001',
        weight: 500,
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1633436116238-63ce8b8e5f91?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1633436116238-63ce8b8e5f91?w=500', order: 1 }
        ]
      },
      {
        name: 'Pulpo Fresco',
        slug: 'pulpo-fresco',
        description: 'Pulpo fresco del día, perfecto para carpaccio o a la parrilla.',
        shortDescription: 'Pulpo fresco premium',
        price: 12990,
        categoryId: categorias[0]._id,
        stock: 25,
        status: 'published',
        sku: 'PUL-001',
        weight: 600,
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500', order: 1 }
        ]
      },
      {
        name: 'Ostiones Frescos',
        slug: 'ostiones-frescos',
        description: 'Ostiones frescos del sur, ideales para ceviche o gratinados.',
        shortDescription: 'Ostiones del sur',
        price: 8990,
        categoryId: categorias[0]._id,
        stock: 40,
        status: 'published',
        sku: 'OST-001',
        weight: 300,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500', order: 1 }
        ]
      },
      
      // Pescados
      {
        name: 'Salmón Fresco Premium',
        slug: 'salmon-fresco-premium',
        description: 'Salmón fresco de la Patagonia, rico en Omega-3.',
        shortDescription: 'Salmón fresco de la Patagonia',
        price: 11990,
        categoryId: categorias[1]._id,
        stock: 35,
        status: 'published',
        sku: 'SAL-001',
        weight: 800,
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=500', order: 1 }
        ]
      },
      {
        name: 'Merluza del Sur',
        slug: 'merluza-del-sur',
        description: 'Merluza austral fresca, carne blanca y suave.',
        shortDescription: 'Merluza austral fresca',
        price: 7990,
        categoryId: categorias[1]._id,
        stock: 45,
        status: 'published',
        sku: 'MER-001',
        weight: 700,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=500', order: 1 }
        ]
      },
      {
        name: 'Reineta Fresca',
        slug: 'reineta-fresca',
        description: 'Reineta fresca del día, ideal para frito o al horno.',
        shortDescription: 'Reineta fresca chilena',
        price: 6990,
        categoryId: categorias[1]._id,
        stock: 55,
        status: 'published',
        sku: 'REI-001',
        weight: 600,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', order: 1 }
        ]
      },

      // Congelados
      {
        name: 'Calamares Congelados',
        slug: 'calamares-congelados',
        description: 'Calamares congelados, listos para preparar.',
        shortDescription: 'Calamares congelados premium',
        price: 9990,
        categoryId: categorias[2]._id,
        stock: 60,
        status: 'published',
        sku: 'CAL-002',
        weight: 500,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500', order: 1 }
        ]
      },
      {
        name: 'Filete de Merluza Congelado',
        slug: 'filete-merluza-congelado',
        description: 'Filetes de merluza congelados sin piel ni espinas.',
        shortDescription: 'Filetes de merluza sin espinas',
        price: 8490,
        categoryId: categorias[2]._id,
        stock: 70,
        status: 'published',
        sku: 'MER-002',
        weight: 600,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500', order: 1 }
        ]
      },

      // Conservas
      {
        name: 'Atún en Agua',
        slug: 'atun-en-agua',
        description: 'Atún en agua, lata de 170g.',
        shortDescription: 'Atún en agua 170g',
        price: 2990,
        categoryId: categorias[3]._id,
        stock: 100,
        status: 'published',
        sku: 'ATU-001',
        weight: 170,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=500', order: 1 }
        ]
      },
      {
        name: 'Sardinas en Aceite',
        slug: 'sardinas-en-aceite',
        description: 'Sardinas en aceite vegetal, lata de 120g.',
        shortDescription: 'Sardinas en aceite 120g',
        price: 1990,
        categoryId: categorias[3]._id,
        stock: 120,
        status: 'published',
        sku: 'SAR-001',
        weight: 120,
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500',
        images: [
          { url: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500', order: 1 }
        ]
      }
    ]);
    console.log(`✅ ${productos.length} productos creados`);

    // 4. CREAR BANNERS
    console.log('\n🎨 Creando banners...');
    
    const banners = await Banner.insertMany([
      {
        title: '¡Oferta de Verano!',
        subtitle: '20% de descuento en todos los mariscos frescos',
        imageUrl: 'https://images.unsplash.com/photo-1559737558-2f3c7b3d8c42?w=1200',
        link: '/products?category=mariscos-frescos',
        order: 1,
        active: true
      },
      {
        title: 'Salmón Premium',
        subtitle: 'Directo de la Patagonia a tu mesa',
        imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=1200',
        link: '/products/salmon-fresco-premium',
        order: 2,
        active: true
      },
      {
        title: 'Productos Congelados',
        subtitle: 'La mejor calidad, siempre disponible',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200',
        link: '/products?category=congelados',
        order: 3,
        active: true
      }
    ]);
    console.log(`✅ ${banners.length} banners creados`);

    // RESUMEN
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('\n📊 RESUMEN:');
    console.log(`   👥 Usuarios: 2`);
    console.log(`   📂 Categorías: ${categorias.length}`);
    console.log(`   🦐 Productos: ${productos.length}`);
    console.log(`   🎨 Banners: ${banners.length}`);
    
    console.log('\n🔐 CREDENCIALES:');
    console.log('\n   👨‍💼 ADMIN:');
    console.log('      Email: admin@marazul.com');
    console.log('      Password: admin123');
    console.log('\n   👤 CLIENTE:');
    console.log('      Email: cliente@example.com');
    console.log('      Password: cliente123');
    
    console.log('\n📝 IDs IMPORTANTES (guárdalos):');
    console.log(`   Categoría "Mariscos Frescos": ${categorias[0]._id}`);
    console.log(`   Categoría "Pescados": ${categorias[1]._id}`);
    console.log(`   Producto "Camarón Jumbo": ${productos[0]._id}`);
    console.log(`   Producto "Salmón Premium": ${productos[4]._id}`);
    
    console.log('\n🚀 Ahora puedes probar el backend en Postman!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar
const run = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('👋 Desconectado de MongoDB\n');
  process.exit(0);
};

run();