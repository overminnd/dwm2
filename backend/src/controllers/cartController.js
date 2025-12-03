// ===================================
// src/controllers/cartController.js
// ===================================
import { Cart, CartItem, Product } from '../models/index.js';

// @desc    Obtener el carrito del usuario
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    // Buscar carrito activo del usuario
    let cart = await Cart.findOne({ 
      userId: req.user.id, 
      status: 'active' 
    });

    // Si no existe, crear uno nuevo
    if (!cart) {
      cart = await Cart.create({ 
        userId: req.user.id,
        status: 'active'
      });
    }

    // Obtener items del carrito con información del producto
    const items = await CartItem.find({ cartId: cart._id })
      .populate({
        path: 'productId',
        select: 'name slug price stock status mainImage'
      });

    // Calcular totales
    let subtotal = 0;
    const validItems = [];

    for (const item of items) {
      // Verificar que el producto existe y está disponible
      if (item.productId && item.productId.status === 'published') {
        const itemSubtotal = item.quantity * item.unitPrice;
        subtotal += itemSubtotal;
        
        validItems.push({
          _id: item._id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: itemSubtotal
        });
      } else {
        // Eliminar items de productos no disponibles
        await CartItem.findByIdAndDelete(item._id);
      }
    }

    res.json({
      success: true,
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          status: cart.status
        },
        items: validItems,
        summary: {
          itemCount: validItems.length,
          subtotal,
          total: subtotal // Por ahora sin impuestos ni envío
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

// @desc    Agregar producto al carrito
// @route   POST /api/cart/items
// @access  Private
export const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validar cantidad
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser al menos 1'
      });
    }

    // Verificar que el producto existe y está disponible
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (product.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Producto no disponible'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Solo quedan ${product.stock} unidades`
      });
    }

    // Buscar o crear carrito
    let cart = await Cart.findOne({ 
      userId: req.user.id, 
      status: 'active' 
    });

    if (!cart) {
      cart = await Cart.create({ 
        userId: req.user.id,
        status: 'active'
      });
    }

    // Verificar si el producto ya está en el carrito
    let cartItem = await CartItem.findOne({ 
      cartId: cart._id, 
      productId 
    });

    if (cartItem) {
      // Actualizar cantidad
      const newQuantity = cartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Solo quedan ${product.stock} unidades`
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Crear nuevo item
      cartItem = await CartItem.create({
        cartId: cart._id,
        productId,
        quantity,
        unitPrice: product.price
      });
    }

    await cartItem.populate('productId', 'name slug price mainImage');

    res.status(201).json({
      success: true,
      data: {
        item: cartItem,
        subtotal: cartItem.quantity * cartItem.unitPrice
      },
      message: 'Producto agregado al carrito'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar cantidad de un item
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser al menos 1'
      });
    }

    const cartItem = await CartItem.findById(req.params.itemId)
      .populate('cartId')
      .populate('productId');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }

    // Verificar que el carrito pertenece al usuario
    if (cartItem.cartId.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Verificar stock
    if (cartItem.productId.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Solo quedan ${cartItem.productId.stock} unidades`
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    await cartItem.populate('productId', 'name slug price mainImage');

    res.json({
      success: true,
      data: {
        item: cartItem,
        subtotal: cartItem.quantity * cartItem.unitPrice
      },
      message: 'Cantidad actualizada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar item del carrito
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.itemId)
      .populate('cartId');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }

    // Verificar que el carrito pertenece al usuario
    if (cartItem.cartId.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    await cartItem.deleteOne();

    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Vaciar carrito completo
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      userId: req.user.id, 
      status: 'active' 
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Eliminar todos los items del carrito
    await CartItem.deleteMany({ cartId: cart._id });

    res.json({
      success: true,
      message: 'Carrito vaciado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calcular total del carrito
// @route   GET /api/cart/total
// @access  Private
export const getCartTotal = async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      userId: req.user.id, 
      status: 'active' 
    });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          subtotal: 0,
          total: 0
        }
      });
    }

    const items = await CartItem.find({ cartId: cart._id })
      .populate('productId', 'price status');

    let subtotal = 0;
    let itemCount = 0;

    for (const item of items) {
      if (item.productId && item.productId.status === 'published') {
        subtotal += item.quantity * item.unitPrice;
        itemCount += item.quantity;
      }
    }

    res.json({
      success: true,
      data: {
        itemCount,
        subtotal,
        tax: 0, // Por ahora sin impuestos
        shipping: 0, // Por ahora sin envío
        total: subtotal
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marcar carrito como abandonado
// @route   POST /api/cart/mark-abandoned
// @access  Private
export const markCartAsAbandoned = async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      userId: req.user.id, 
      status: 'active' 
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    cart.status = 'abandoned';
    await cart.save();

    res.json({
      success: true,
      message: 'Carrito marcado como abandonado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};