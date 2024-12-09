const mongoose = require('mongoose');

// Definir el esquema para la preventa
const preventaSchema = new mongoose.Schema({
  fase: {
    type: Number,
    required: true
  },
 
  cantidadTotal: {
    type: Number,
    default: 0
  },
  tokensDisponibles: {
    type: Number,
    required: true
  },
  tokensVendidos: {
    type: Number,
    default: 0
  },
  faseActiva: {
    type: Boolean,
    default: false
  }, 
  descripcion: {
    type: String,
    required: false
  },
  precioactual:{
    type: String,
    required: false
  },
  preciofin:{
    type: String,
    required: false       
  },
  precioini:{
    type: String,
    required: false       
  }
});

// Crear el modelo
const Preventa = mongoose.model('Preventa', preventaSchema);

module.exports = Preventa;
