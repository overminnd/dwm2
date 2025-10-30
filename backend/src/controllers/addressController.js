// ===================================
// src/controllers/addressController.js
// ===================================
import { Address } from '../models/index.js';

// @desc    Obtener todas las direcciones del usuario
// @route   GET /api/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id })
      .sort('-isDefault -createdAt');

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener una dirección específica
// @route   GET /api/addresses/:id
// @access  Private
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Verificar que la dirección pertenece al usuario
    if (address.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nueva dirección
// @route   POST /api/addresses
// @access  Private
export const createAddress = async (req, res) => {
  try {
    const { street, number, city, region, zipCode, country, isDefault } = req.body;

    // Validar campos requeridos
    if (!street || !number || !city || !region) {
      return res.status(400).json({
        success: false,
        message: 'Calle, número, ciudad y región son obligatorios'
      });
    }

    // Si es la primera dirección, hacerla predeterminada automáticamente
    const existingAddresses = await Address.countDocuments({ 
      userId: req.user.id 
    });

    const newAddress = await Address.create({
      userId: req.user.id,
      street: street.trim(),
      number: number.trim(),
      city: city.trim(),
      region: region.trim(),
      zipCode: zipCode ? zipCode.trim() : undefined,
      country: country ? country.trim() : 'Chile',
      isDefault: existingAddresses === 0 ? true : (isDefault || false)
    });

    res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Dirección creada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar dirección
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Verificar que la dirección pertenece al usuario
    if (address.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const { street, number, city, region, zipCode, country, isDefault } = req.body;

    // Actualizar campos
    if (street) address.street = street.trim();
    if (number) address.number = number.trim();
    if (city) address.city = city.trim();
    if (region) address.region = region.trim();
    if (zipCode !== undefined) address.zipCode = zipCode ? zipCode.trim() : undefined;
    if (country) address.country = country.trim();
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({
      success: true,
      data: address,
      message: 'Dirección actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar dirección
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Verificar que la dirección pertenece al usuario
    if (address.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Si es la dirección predeterminada, asignar otra como predeterminada
    if (address.isDefault) {
      const otherAddress = await Address.findOne({
        userId: req.user.id,
        _id: { $ne: address._id }
      });

      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
    }

    await address.deleteOne();

    res.json({
      success: true,
      message: 'Dirección eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Establecer dirección como predeterminada
// @route   PUT /api/addresses/:id/set-default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    // Verificar que la dirección pertenece al usuario
    if (address.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Quitar el default de todas las demás direcciones del usuario
    await Address.updateMany(
      { userId: req.user.id, _id: { $ne: address._id } },
      { isDefault: false }
    );

    // Establecer esta como predeterminada
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      data: address,
      message: 'Dirección establecida como predeterminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Validar dirección
// @route   POST /api/addresses/validate
// @access  Private
export const validateAddress = async (req, res) => {
  try {
    const { street, number, city, region, zipCode } = req.body;

    // Validaciones básicas
    const errors = [];

    if (!street || street.trim().length < 3) {
      errors.push('La calle debe tener al menos 3 caracteres');
    }

    if (!number || number.trim().length < 1) {
      errors.push('El número es obligatorio');
    }

    if (!city || city.trim().length < 2) {
      errors.push('La ciudad debe tener al menos 2 caracteres');
    }

    if (!region || region.trim().length < 2) {
      errors.push('La región debe tener al menos 2 caracteres');
    }

    if (zipCode && !/^[0-9]{7}$/.test(zipCode.trim())) {
      errors.push('El código postal debe tener 7 dígitos');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        valid: false,
        errors
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Dirección válida'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener dirección predeterminada del usuario
// @route   GET /api/addresses/default
// @access  Private
export const getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ 
      userId: req.user.id, 
      isDefault: true 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una dirección predeterminada'
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};