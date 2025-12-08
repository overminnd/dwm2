// ===================================
// src/controllers/productController.js
// ===================================
import { Product, Category } from '../models/index.js';

// @desc    Obtener todos los productos (con filtros)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    // ═══════════════════════════════════════════════════════════════════
    // EXTRAER QUERY PARAMETERS
    // ═══════════════════════════════════════════════════════════════════
    const {
      featured,
      category,      // Slug de categoría (ej: "pescado")
      categoryId,    // ✅ NUEVO: ObjectId directo
      search,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUIR FILTROS
    // ═══════════════════════════════════════════════════════════════════
    const filters = {};

    // ✅ FILTRO POR FEATURED
    if (featured !== undefined) {
      filters.featured = featured === 'true' || featured === true;
      console.log('🔍 Filtro featured aplicado:', filters.featured);
    }

    // ✅ FILTRO POR CATEGORÍA (MEJORADO - SOPORTA AMBOS)
    if (categoryId) {
      // OPCIÓN 1: categoryId viene directamente como ObjectId
      filters.categoryId = categoryId;
      console.log('🔍 Filtro categoryId (directo) aplicado:', categoryId);
    } else if (category) {
      // OPCIÓN 2: category viene como slug, buscar el ObjectId
      const categoryDoc = await Category.findOne({ 
        slug: category.toLowerCase() 
      });
      
      if (categoryDoc) {
        filters.categoryId = categoryDoc._id;
        console.log('🔍 Filtro category (slug) aplicado:', category, '→', categoryDoc._id);
      } else {
        console.warn('⚠️ Categoría no encontrada:', category);
      }
    }

    // Filtro por búsqueda (nombre o descripción)
    if (search) {
      filters.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { shortDescription: { $regex: new RegExp(search, 'i') } }
      ];
    }

    // Filtro por rango de precio
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Solo productos publicados
    filters.status = 'published';

    // ═══════════════════════════════════════════════════════════════════
    // LOG PARA DEBUGGING
    // ═══════════════════════════════════════════════════════════════════
    console.log('🔎 Filtros aplicados:', JSON.stringify(filters, null, 2));

    // ═══════════════════════════════════════════════════════════════════
    // CALCULAR PAGINACIÓN
    // ═══════════════════════════════════════════════════════════════════
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // ═══════════════════════════════════════════════════════════════════
    // EJECUTAR QUERY
    // ═══════════════════════════════════════════════════════════════════
    const products = await Product.find(filters)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .limit(limitNumber)
      .skip(skip)
      .lean();

    // Contar total de productos con estos filtros
    const totalProducts = await Product.countDocuments(filters);

    // ═══════════════════════════════════════════════════════════════════
    // RESPUESTA
    // ═══════════════════════════════════════════════════════════════════
    console.log(`✅ ${products.length} productos encontrados de ${totalProducts} totales`);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        productsPerPage: limitNumber,
        hasNextPage: pageNumber * limitNumber < totalProducts,
        hasPrevPage: pageNumber > 1
      }
    });

  } catch (error) {
    console.error('❌ Error en getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// @desc    Obtener productos destacados
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const products = await Product.find({ 
      featured: true, 
      status: 'published',
      stock: { $gt: 0 }
    })
    .populate('categoryId', 'name slug')
    .limit(parseInt(limit))
    .sort('-createdAt');

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un producto por slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('categoryId', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      categoryId,
      stock,
      sku,
      weight,
      featured,
      images,
      mainImage
    } = req.body;

    // Validar que la categoría existe
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const product = await Product.create({
      name,
      description,
      shortDescription,
      price,
      categoryId,
      stock: stock || 0,
      sku,
      weight,
      featured: featured || false,
      images: images || [],
      mainImage: mainImage || (images && images[0] ? images[0].url : null),
      status: 'published'
    });

    await product.populate('categoryId', 'name slug');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Producto creado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Validar categoría
    if (req.body.categoryId) {
      const categoryExists = await Category.findById(req.body.categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
    }

    // Actualizar todos los campos enviados
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    // SI viende active, forzamos boolean
    if (req.body.active !== undefined) {
      product.active = req.body.active === true || req.body.active === "true";
    }

    await product.save();
    await product.populate('categoryId', 'name slug');

    res.json({
      success: true,
      data: product,
      message: 'Producto actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Publicar un producto
// @route   PUT /api/products/:id/publish
// @access  Private/Admin
export const publishProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.status = 'published';
    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Producto publicado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Retirar un producto (ocultar)
// @route   PUT /api/products/:id/retire
// @access  Private/Admin
export const retireProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.status = 'retired';
    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Producto retirado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar stock de un producto
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock inválido'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.stock = stock;
    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Stock actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verificar disponibilidad de un producto
// @route   GET /api/products/:id/availability
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const isAvailable = product.status === 'published' && product.stock > 0;

    res.json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        available: isAvailable,
        stock: product.stock,
        status: product.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Agregar imágenes a un producto
// @route   POST /api/products/:id/images
// @access  Private/Admin
export const addImages = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de imágenes inválido'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Agregar nuevas imágenes
    images.forEach((img, index) => {
      product.images.push({
        url: img.url,
        order: product.images.length + index + 1
      });
    });

    // Si no hay mainImage, usar la primera
    if (!product.mainImage && product.images.length > 0) {
      product.mainImage = product.images[0].url;
    }

    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Imágenes agregadas correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener productos relacionados (misma categoría)
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const { limit = 4 } = req.query;

    // Buscar productos de la misma categoría, excluyendo el actual
    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      status: 'published',
      stock: { $gt: 0 }
    })
    .populate('categoryId', 'name slug')
    .limit(parseInt(limit))
    .sort('-createdAt');

    res.json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};