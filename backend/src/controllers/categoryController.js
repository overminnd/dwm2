// ===================================
// src/controllers/categoryController.js
// ===================================
import { Category, Product } from '../models/index.js';

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const { active } = req.query;

    const filter = {};
    if (active === 'true') {
      filter.active = true;
    }

    const categories = await Category.find(filter)
      .sort('name');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener categorías activas
// @route   GET /api/categories/active
// @access  Public
export const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true })
      .sort('name');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener productos de una categoría
// @route   GET /api/categories/:id/products
// @access  Public
export const getCategoryProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const products = await Product.find({ 
      categoryId: category._id,
      status: 'published'
    })
    .populate('categoryId', 'name slug')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('-createdAt');

    const total = await Product.countDocuments({ 
      categoryId: category._id,
      status: 'published'
    });

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener subcategorías
// @route   GET /api/categories/:id/subcategories
// @access  Public
export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Category.find({ 
      parentId: req.params.id,
      active: true
    }).sort('name');

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener categoría padre
// @route   GET /api/categories/:id/parent
// @access  Public
export const getParentCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    if (!category.parentId) {
      return res.json({
        success: true,
        data: null,
        message: 'Esta categoría no tiene padre'
      });
    }

    const parent = await Category.findById(category.parentId);

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear una nueva categoría
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    // Verificar si ya existe
    const existingCategory = await Category.findOne({ 
      name: name.trim() 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    // Si tiene padre, verificar que existe
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Categoría padre no encontrada'
        });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      parentId: parentId || null,
      active: true
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoría creada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar una categoría
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const { name, description, parentId, active } = req.body;

    // Si se cambia el nombre, verificar que no exista
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: name.trim(),
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    // Si se cambia el padre, verificar que existe
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Categoría padre no encontrada'
        });
      }

      // No permitir que sea su propio padre
      if (parentId === category._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Una categoría no puede ser su propio padre'
        });
      }
    }

    // Actualizar campos
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parentId = parentId;
    if (active !== undefined) category.active = active;

    await category.save();

    res.json({
      success: true,
      data: category,
      message: 'Categoría actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar una categoría
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si tiene productos asociados
    const productsCount = await Product.countDocuments({ 
      categoryId: category._id 
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${productsCount} producto(s) asociado(s) a esta categoría`
      });
    }

    // Verificar si tiene subcategorías
    const subcategoriesCount = await Category.countDocuments({ 
      parentId: category._id 
    });

    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${subcategoriesCount} subcategoría(s) asociada(s)`
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};