// ===================================
// src/controllers/bannerController.js
// ===================================
import { Banner } from '../models/index.js';

// @desc    Obtener todos los banners
// @route   GET /api/banners
// @access  Public
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort('order');

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener banners activos (para el carrusel)
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true })
      .sort('order')
      .limit(5); // Máximo 5 banners en el carrusel

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un banner por ID
// @route   GET /api/banners/:id
// @access  Public
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear un nuevo banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, imageUrl, link, order, active } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'La URL de la imagen es obligatoria'
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      imageUrl,
      link,
      order: order || 0,
      active: active !== undefined ? active : true
    });

    res.status(201).json({
      success: true,
      data: banner,
      message: 'Banner creado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar un banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }

    const { title, subtitle, imageUrl, link, order, active } = req.body;

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (imageUrl !== undefined) banner.imageUrl = imageUrl;
    if (link !== undefined) banner.link = link;
    if (order !== undefined) banner.order = order;
    if (active !== undefined) banner.active = active;

    await banner.save();

    res.json({
      success: true,
      data: banner,
      message: 'Banner actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar un banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }

    await banner.deleteOne();

    res.json({
      success: true,
      message: 'Banner eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reordenar banners
// @route   POST /api/banners/reorder
// @access  Private/Admin
export const reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body; // Array de { id, order }

    if (!Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: 'Formato inválido'
      });
    }

    // Actualizar el orden de cada banner
    const updates = banners.map(({ id, order }) => 
      Banner.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updates);

    const updatedBanners = await Banner.find().sort('order');

    res.json({
      success: true,
      data: updatedBanners,
      message: 'Banners reordenados correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};