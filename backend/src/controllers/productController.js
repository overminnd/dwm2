// ===================================
// src/controllers/productController.js
// ===================================
import { Product, Category } from '../models/index.js';

// @desc    Obtener todos los productos (con filtros)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      status = 'published',
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Construir filtro
    const filter = { status };

    // Filtrar por categoría
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.categoryId = cat._id;
      }
    }

    // Filtrar por destacados
    if (featured === 'true') {
      filter.featured = true;
    }

    // Búsqueda por nombre o descripción
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginación
    const skip = (page - 1) * limit;

    // Consulta
    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Total de productos (para paginación)
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
      status: 'draft'
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

    // Si se cambia la categoría, validar que existe
    if (req.body.categoryId) {
      const categoryExists = await Category.findById(req.body.categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
    }

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

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