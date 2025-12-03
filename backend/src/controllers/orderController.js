// ===================================
// src/controllers/orderController.js
// ===================================
import { Order, OrderItem, Cart, CartItem, Product } from '../models/index.js';

// @desc    Obtener todas las órdenes del usuario
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user.id })
      .populate('addressId')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: orders,
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

// @desc    Obtener una orden por ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'email firstName lastName')
      .populate('addressId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que la orden pertenece al usuario (o es admin)
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Obtener items de la orden
    const items = await OrderItem.find({ orderId: order._id })
      .populate('productId', 'name slug mainImage');

    res.json({
      success: true,
      data: {
        order,
        items
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear una nueva orden desde el carrito
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;

    // Validar dirección
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una dirección de envío'
      });
    }

    // Obtener carrito activo
    const cart = await Cart.findOne({ 
      userId: req.user.id, 
      status: 'active' 
    });

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: 'No tienes un carrito activo'
      });
    }

    // Obtener items del carrito
    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tu carrito está vacío'
      });
    }

    // Validar stock de todos los productos
    for (const item of cartItems) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: 'Producto no encontrado en el carrito'
        });
      }

      if (item.productId.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: `El producto "${item.productId.name}" no está disponible`
        });
      }

      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para "${item.productId.name}". Solo quedan ${item.productId.stock} unidades`
        });
      }
    }

    // Calcular totales
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.quantity * item.unitPrice;
    });

    const tax = 0; // Por ahora sin impuestos
    const shippingCost = 0; // Por ahora sin costo de envío
    const total = subtotal + tax + shippingCost;

    // Crear orden
    const order = await Order.create({
      userId: req.user.id,
      addressId,
      subtotal,
      tax,
      shippingCost,
      total,
      status: 'pending_payment'
    });

    // Crear items de la orden y actualizar stock
    const orderItems = [];
    for (const cartItem of cartItems) {
      const orderItem = await OrderItem.create({
        orderId: order._id,
        productId: cartItem.productId._id,
        productName: cartItem.productId.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        subtotal: cartItem.quantity * cartItem.unitPrice
      });

      orderItems.push(orderItem);

      // Reducir stock del producto
      await Product.findByIdAndUpdate(
        cartItem.productId._id,
        { $inc: { stock: -cartItem.quantity } }
      );
    }

    // Vaciar carrito
    await CartItem.deleteMany({ cartId: cart._id });
    await Cart.deleteOne({ _id: cart._id });

    // Poblar orden con relaciones
    await order.populate('addressId');

    res.status(201).json({
      success: true,
      data: {
        order,
        items: orderItems
      },
      message: 'Orden creada correctamente'
    });

    // Poblar orden con relaciones
    await order.populate('addressId');

    res.status(201).json({
      success: true,
      data: {
        order,
        items: orderItems
      },
      message: 'Orden creada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancelar una orden
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que la orden pertenece al usuario
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Solo se puede cancelar si está pendiente de pago
    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar esta orden'
      });
    }

    // Restaurar stock
    const orderItems = await OrderItem.find({ orderId: order._id });
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Orden cancelada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar estado de orden (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Estado actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener items de una orden
// @route   GET /api/orders/:orderId/items
// @access  Private
export const getOrderItems = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar autorización
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate('productId', 'name slug mainImage');

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calcular total de una orden
// @route   GET /api/orders/:id/total
// @access  Private
export const calculateOrderTotal = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        total: order.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};