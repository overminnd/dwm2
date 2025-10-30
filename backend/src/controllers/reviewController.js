// ===================================
// src/controllers/reviewController.js
// ===================================
import { Review, Product, Order, OrderItem } from '../models/index.js';

// @desc    Obtener todas las reseñas de un producto
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ productId: req.params.productId });

    res.json({
      success: true,
      data: reviews,
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

// @desc    Obtener una reseña específica
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'firstName lastName')
      .populate('productId', 'name slug');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear una reseña
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validar campos requeridos
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Producto y calificación son obligatorios'
      });
    }

    // Validar rating (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario haya comprado el producto
    const hasPurchased = await OrderItem.exists({
      productId,
      orderId: {
        $in: await Order.find({ 
          userId: req.user.id,
          status: { $in: ['paid', 'shipped', 'delivered'] }
        }).distinct('_id')
      }
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'Debes comprar el producto antes de dejar una reseña'
      });
    }

    // Verificar que no haya dejado ya una reseña para este producto
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este producto'
      });
    }

    // Crear reseña
    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      comment: comment ? comment.trim() : undefined
    });

    await review.populate('userId', 'firstName lastName');
    await review.populate('productId', 'name slug');

    res.status(201).json({
      success: true,
      data: review,
      message: 'Reseña creada correctamente'
    });
  } catch (error) {
    // Error de índice único (ya dejó una reseña)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este producto'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar una reseña
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Verificar que la reseña pertenece al usuario
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const { rating, comment } = req.body;

    // Validar rating si se proporciona
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Actualizar campos
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment ? comment.trim() : '';

    await review.save();

    await review.populate('userId', 'firstName lastName');
    await review.populate('productId', 'name slug');

    res.json({
      success: true,
      data: review,
      message: 'Reseña actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar una reseña
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Verificar que la reseña pertenece al usuario o es admin
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Reseña eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener calificación promedio de un producto
// @route   GET /api/products/:productId/reviews/average
// @access  Public
export const getAverageRating = async (req, res) => {
  try {
    const result = await Review.aggregate([
      {
        $match: { productId: req.params.productId }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Redondear a 1 decimal
        totalReviews: result[0].totalReviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar reseñas por producto (para admin o frontend)
// @route   POST /api/reviews/list-by-product
// @access  Public
export const listByProduct = async (req, res) => {
  try {
    const { productId, page = 1, limit = 10 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID del producto requerido'
      });
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .populate('userId', 'firstName lastName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ productId });

    res.json({
      success: true,
      data: reviews,
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

// @desc    Verificar si el usuario puede dejar una reseña
// @route   GET /api/reviews/can-review/:productId
// @access  Private
export const canUserReview = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar si ya dejó una reseña
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'Ya has dejado una reseña para este producto',
        existingReview
      });
    }

    // Verificar si ha comprado el producto
    const hasPurchased = await OrderItem.exists({
      productId,
      orderId: {
        $in: await Order.find({ 
          userId: req.user.id,
          status: { $in: ['paid', 'shipped', 'delivered'] }
        }).distinct('_id')
      }
    });

    if (!hasPurchased) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'Debes comprar el producto antes de dejar una reseña'
      });
    }

    res.json({
      success: true,
      canReview: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener reseñas del usuario
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId: req.user.id })
      .populate('productId', 'name slug mainImage')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: reviews,
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