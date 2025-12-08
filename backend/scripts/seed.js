// ===================================
// scripts/seed.js 
// Poblar BD con datos de prueba
// ===================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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
    // ⚠️ IMPORTANTE: NO hasheamos aquí, el modelo lo hace automáticamente
    const admin = await User.create({
      email: 'admin@marazul.com',
      password: 'admin123', // ← Texto plano, el modelo lo hashea
      firstName: 'Admin',
      lastName: 'MarAzul',
      phone: '912345678',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin creado:', admin.email);

    // Usuario Cliente
    // ⚠️ IMPORTANTE: NO hasheamos aquí, el modelo lo hace automáticamente
    const customer = await User.create({
      email: 'cliente@example.com',
      password: 'cliente123', // ← Texto plano, el modelo lo hashea
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
        name: 'Mariscos',
        slug: 'mariscos-frescos',
        description: 'Platos preparados con mariscos frescos del día',
        imageUrl: 'https://res.cloudinary.com/REEMPLAZAR/image/upload/v1/mariscos.png',
        order: 1,
        active: true
      },
      {
        name: 'Pescados',
        slug: 'pescados-frescos',
        description: 'Platos preparados con pescados frescos y de calidad',
        imageUrl: 'https://res.cloudinary.com/REEMPLAZAR/image/upload/v1/pescados.png',
        order: 2,
        active: true
      },
      {
        name: 'Ensaladas',
        slug: 'ensaladas',
        description: 'Ensaladas frescas del mar, preparadas con ingredientes de calidad',
        imageUrl: 'https://res.cloudinary.com/REEMPLAZAR/image/upload/v1/ensaladas.png',
        order: 3,
        active: true
      }
    ]);

    console.log(`✅ ${categorias.length} categorías creadas`);



    // 3. CREAR PRODUCTOS
    console.log('\n🦐 Creando productos...');
    
    const productos = await Product.insertMany([
      // ==============================
      // MARISCOS 
      // ==============================

      {
        name: "Chupe de Jaiba Tradicional",
        slug: "chupe-jaiba-tradicional",
        description: "Chupe de jaiba preparado al estilo tradicional chileno, cremoso, suave y con un balance perfecto entre mariscos frescos y especias. Servido gratinado y caliente.",
        shortDescription: "Chupe casero de jaiba gratinado",
        price: 11990,
        categoryId: categorias[0]._id,
        stock: 40,
        status: "published",
        sku: "JAI-CH-001",
        weight: 380,
        featured: true,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871530/chupe-jaiba-tradicional_v4tmtw.png", 
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871530/chupe-jaiba-tradicional_v4tmtw.png", order: 1 } 
        ]
      },
      {
        name: "Mariscal Frío Clásico",
        slug: "mariscal-frio-clasico",
        description: "Mariscal tradicional chileno preparado con pulpo, choritos, camarón y calamar, marinado en limón, cilantro y cebolla morada. Fresco, intenso y lleno de sabor marino.",
        shortDescription: "Mariscal fresco con limón y cilantro",
        price: 9990,
        categoryId: categorias[0]._id,
        stock: 50,
        status: "published",
        sku: "MAR-FR-002",
        weight: 350,
        featured: true,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871533/mariscal-frio-clasico_udnrdi.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871533/mariscal-frio-clasico_udnrdi.png", order: 1 }
        ]
      },
      {
        name: "Pulpo al Olivo Peruano",
        slug: "pulpo-al-olivo",
        description: "Pulpo cocido lentamente para lograr textura suave, servido con una fina salsa peruana de aceituna botija. Elegante, fresco y perfecto como plato gourmet.",
        shortDescription: "Pulpo tierno con salsa de aceituna",
        price: 13990,
        categoryId: categorias[0]._id,
        stock: 30,
        status: "published",
        sku: "PUL-OL-003",
        weight: 300,
        featured: false,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871527/pulpo-al-olivo_eprrrq.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871527/pulpo-al-olivo_eprrrq.png", order: 1 }
        ]
      },
      {
        name: "Ceviche Mixto de Mariscos",
        slug: "ceviche-mixto-mariscos",
        description: "Ceviche mixto preparado con pulpo, camarón, pescado fresco, cebolla morada, cilantro y ají. Un plato refrescante con los sabores clásicos del Pacífico.",
        shortDescription: "Ceviche con pulpo y camarón",
        price: 10990,
        categoryId: categorias[0]._id,
        stock: 45,
        status: "published",
        sku: "CEV-MX-004",
        weight: 320,
        featured: true,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871525/ceviche-mixto-mariscos_x6ewiz.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871525/ceviche-mixto-mariscos_x6ewiz.png", order: 1 }
        ]
      },
      {
        name: "Machas a la Parmesana",
        slug: "machas-parmesana",
        description: "Machas frescas gratinadas con mantequilla, vino blanco y queso parmesano. Un clásico imperdible de la gastronomía chilena.",
        shortDescription: "Clásicas machas gratinadas",
        price: 14990,
        categoryId: categorias[0]._id,
        stock: 25,
        status: "published",
        sku: "MAC-PM-005",
        weight: 260,
        featured: false,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871523/machas-parmesana_qb1tch.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871523/machas-parmesana_qb1tch.png", order: 1 }
        ]
      },
      {
        name: "Caldillo de Mariscos Artesanal",
        slug: "caldillo-mariscos-artesanal",
        description: "Caldillo abundante preparado con camarón, choritos, pescado fresco y especias tradicionales. Reconfortante, caliente y lleno de sabor.",
        shortDescription: "Caldo casero con mariscos",
        price: 8990,
        categoryId: categorias[0]._id,
        stock: 60,
        status: "published",
        sku: "CAL-MA-006",
        weight: 450,
        featured: false,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871522/caldillo-mariscos-artesanal_ozlgxd.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871522/caldillo-mariscos-artesanal_ozlgxd.png", order: 1 }
        ]
      },
      {
        name: "Arroz con Mariscos al Estilo Chileno",
        slug: "arroz-mariscos-chileno",
        description: "Arroz preparado con un mix de mariscos frescos, vino blanco, pimentón y especias chilenas. Cremoso, aromático y perfecto como plato principal.",
        shortDescription: "Arroz cremoso con mariscos",
        price: 10990,
        categoryId: categorias[0]._id,
        stock: 50,
        status: "published",
        sku: "ARR-MA-007",
        weight: 420,
        featured: false,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871520/arroz-mariscos-chileno_horyio.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871520/arroz-mariscos-chileno_horyio.png", order: 1 }
        ]
      },
      {
        name: "Pastel de Jaiba Cremoso",
        slug: "pastel-jaiba-cremoso",
        description: "Pastel de jaiba casero con salsa blanca, ajo, mantequilla y especias tradicionales. Servido gratinado al horno para un sabor intenso y cremoso.",
        shortDescription: "Pastel de jaiba casero",
        price: 12990,
        categoryId: categorias[0]._id,
        stock: 35,
        status: "published",
        sku: "JAI-PA-008",
        weight: 380,
        featured: true,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871519/pastel-jaiba-cremoso_oqvpvv.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871519/pastel-jaiba-cremoso_oqvpvv.png", order: 1 }
        ]
      },
      {
        name: "Camarones al Pil Pil",
        slug: "camarones-al-pil-pil",
        description: "Camarones frescos salteados en aceite de oliva, ajo, ají y perejil. Un plato simple, aromático y muy popular en la cocina nacional.",
        shortDescription: "Clásico pil pil de camarón",
        price: 9990,
        categoryId: categorias[0]._id,
        stock: 70,
        status: "published",
        sku: "CAM-PP-009",
        weight: 250,
        featured: false,
        mainImage: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871533/camarones-al-pil-pil_lnmly4.png",
        images: [
          { url: "https://res.cloudinary.com/dqms1jdlh/image/upload/v1764871533/camarones-al-pil-pil_lnmly4.png", order: 1 }
        ]
      },

      // ==============================
      // PESCADOS
      // ==============================
      
      {
        name: 'Salmón Premium a la Plancha',
        slug: 'salmon-premium-plancha',
        description: 'Salmón fresco de la Patagonia cocinado a la plancha, acompañado de vegetales salteados. Su textura suave y su sabor intenso lo convierten en un plato perfecto para una comida saludable y deliciosa.',
        shortDescription: 'Salmón fresco a la plancha con vegetales',
        price: 13990,
        categoryId: categorias[1]._id, 
        stock: 40,
        status: 'published',
        sku: 'SAL-PL-001',
        weight: 350,
        featured: true,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/salmon-premium-plancha_fapsez.png',
        images: [
          { 
            url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/salmon-premium-plancha_fapsez.png', 
            order: 1 
          }
        ]
      },
      {
        name: 'Reineta Frita con Ensalada Chilena',
        slug: 'reineta-frita-ensalada-chilena',
        description: 'Filete de reineta fresca frita dorada y crujiente, acompañada de clásica ensalada chilena recién preparada. Un plato tradicional y muy solicitado.',
        shortDescription: 'Reineta frita + ensalada chilena',
        price: 9990,
        categoryId: categorias[1]._id,
        stock: 60,
        status: 'published',
        sku: 'REI-FR-002',
        weight: 400,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/reineta-frita-ensalada-chilena_jb9vdg.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/reineta-frita-ensalada-chilena_jb9vdg.png', order: 1 }
        ]
      },
      {
        name: 'Merluza a lo Pobre',
        slug: 'merluza-a-lo-pobre',
        description: 'Merluza del sur preparada a lo pobre con papas fritas caseras, cebolla caramelizada y huevo frito. Una combinación sabrosa y abundante.',
        shortDescription: 'Merluza del sur a lo pobre',
        price: 10990,
        categoryId: categorias[1]._id,
        stock: 55,
        status: 'published',
        sku: 'MER-PB-003',
        weight: 450,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/merluza-a-lo-pobre_fpa3kn.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/merluza-a-lo-pobre_fpa3kn.png', order: 1 }
        ]
      },
      {
        name: 'Ceviche de Salmón Chileno',
        slug: 'ceviche-salmon-chileno',
        description: 'Ceviche preparado con salmón fresco chileno, jugo de limón, cilantro, cebolla morada y toques de ají verde. Fresco, ligero y lleno de sabor.',
        shortDescription: 'Ceviche fresco de salmón',
        price: 8990,
        categoryId: categorias[1]._id,
        stock: 45,
        status: 'published',
        sku: 'SAL-CE-004',
        weight: 300,
        featured: true,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/ceviche-salmon-chileno_nz1sqs.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/ceviche-salmon-chileno_nz1sqs.png', order: 1 }
        ]
      },
      {
        name: 'Filete de Congrio en Salsa Verde',
        slug: 'congrio-salsa-verde',
        description: 'Clásico plato chileno de filete de congrio servido con salsa verde de cilantro, ajo y vino blanco. Un plato tradicional lleno de sabor.',
        shortDescription: 'Congrio fresco en salsa verde',
        price: 11990,
        categoryId: categorias[1]._id,
        stock: 35,
        status: 'published',
        sku: 'CON-SV-005',
        weight: 420,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/congrio-salsa-verde_me9dkr.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869694/congrio-salsa-verde_me9dkr.png', order: 1 }
        ]
      },
      {
        name: 'Chupe de Marraqueta con Reineta',
        slug: 'chupe-reineta',
        description: 'Un chupe casero de reineta con marraqueta tostada, leche y especias tradicionales. Cremoso, reconfortante y perfecto para días fríos.',
        shortDescription: 'Chupe de reineta casero',
        price: 10990,
        categoryId: categorias[1]._id,
        stock: 40,
        status: 'published',
        sku: 'REI-CH-006',
        weight: 380,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869696/chupe-reineta_lijhc4.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869696/chupe-reineta_lijhc4.png', order: 1 }
        ]
      },
      {
        name: 'Tiradito de Salmón con Ají Amarillo',
        slug: 'tiradito-salmon-aji-amarillo',
        description: 'Finas láminas de salmón acompañadas de salsa cremosa de ají amarillo, limón y especias. Un plato fresco y elegante.',
        shortDescription: 'Tiradito de salmón estilo peruano',
        price: 9990,
        categoryId: categorias[1]._id,
        stock: 50,
        status: 'published',
        sku: 'SAL-TI-007',
        weight: 280,
        featured: true,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/tiradito-salmon-aji-amarillo_kmbzy8.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/tiradito-salmon-aji-amarillo_kmbzy8.png', order: 1 }
        ]
      },
      {
        name: 'Sándwich de Merluza Crispy',
        slug: 'sandwich-merluza-crispy',
        description: 'Merluza crispy en pan artesanal con mayonesa casera, lechuga fresca y toque de limón. Perfecto para un almuerzo rápido y sabroso.',
        shortDescription: 'Sándwich de merluza crispy',
        price: 7490,
        categoryId: categorias[1]._id,
        stock: 70,
        status: 'published',
        sku: 'MER-SW-008',
        weight: 300,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/sandwich-merluza-crispy_prnsur.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/sandwich-merluza-crispy_prnsur.png', order: 1 }
        ]
      },
      {
        name: 'Caldo de Pescado Artesanal',
        slug: 'caldo-pescado-artesanal',
        description: 'Caldo preparado con restos frescos de pescado, verduras y especias tradicionales. Ideal para el invierno, nutritivo y reconfortante.',
        shortDescription: 'Caldo casero de pescado',
        price: 5990,
        categoryId: categorias[1]._id,
        stock: 90,
        status: 'published',
        sku: 'CAL-PE-009',
        weight: 500,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/caldo-pescado-artesanal02_kjlkuu.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764869695/caldo-pescado-artesanal02_kjlkuu.png', order: 1 }
        ]
      },
      // ==============================
      // ENSALADAS
      // ==============================
      {
        name: 'Ensalada Marina Premium',
        slug: 'ensalada-marina-premium',
        description: 'Ensalada fresca con camarones, salmón ahumado, hojas verdes, palta y aderezo cítrico. Un plato ligero, elegante y lleno de sabor.',
        shortDescription: 'Ensalada fresca con mariscos y salmón',
        price: 8990,
        categoryId: categorias[2]._id, // ← ENSALADAS (tercera categoría)
        stock: 30,
        status: 'published',
        sku: 'ENS-001',
        weight: 350,
        featured: true,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764877311/ensalada-marina-premium_ikkpr9.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764877311/ensalada-marina-premium_ikkpr9.png', order: 1 }
        ]
      },
      {
        name: 'Ensalada César de Salmón',
        slug: 'ensalada-cesar-salmon',
        description: 'Versión premium de la clásica César, con crutones artesanales, mix de hojas, parmesano fresco y filete de salmón grillado.',
        shortDescription: 'César con salmón grillado',
        price: 9990,
        categoryId: categorias[2]._id,
        stock: 35,
        status: 'published',
        sku: 'ENS-002',
        weight: 380,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764877311/ensalada-cesar-salmon_shjvgt.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764877311/ensalada-cesar-salmon_shjvgt.png', order: 1 }
        ]
      },
      {
        name: 'Ensalada de Quinoa con Mariscos',
        slug: 'ensalada-quinoa-mariscos',
        description: 'Mezcla fresca de quinoa, pulpo, camarones, pepino, tomate cherry y dressing de limón. Alta en proteínas y muy fresca.',
        shortDescription: 'Quinoa fresca con mariscos',
        price: 8490,
        categoryId: categorias[2]._id,
        stock: 40,
        status: 'published',
        sku: 'ENS-003',
        weight: 360,
        featured: false,
        mainImage: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764877312/ensalada-quinoa-mariscos_jw6cv2.png',
        images: [
          { url: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764877312/ensalada-quinoa-mariscos_jw6cv2.png', order: 1 }
        ]
      }
    ]);
    console.log(`✅ ${productos.length} productos creados`);

    // 4. CREAR BANNERS
    console.log('\n🎨 Creando banners...');
    
    const banners = await Banner.insertMany([
      {
        title: 'MARISCOS',
        subtitle: 'MARISCOS DELICIOSOS',
        imageUrl: 'https://res.cloudinary.com/dqms1jdlh/image/upload/v1764956172/baanner01_q0nk2t.jpg',
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