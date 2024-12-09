const mongoose = require('mongoose');

// Definir el esquema para la preventa
const UserSchema = new mongoose.Schema({

  nombres_completos: {
    type: String,
    required: true
  },
  tokensComprados: {
    type: Number,
    default: 0,
    required: false
  },
  tokensRetirados: {
    type: Number,
    default: 0
  },
  descripcion: {
    type: String,
    required: false
  },
  preciocompra:{
    type: String,
    default: 0
  },
  wallet:{
    type: String,
    required: false
  },
  num_id:{
    type: String,
    required: true
  }


});

// Crear el modelo
const User = mongoose.model('User', UserSchema);

module.exports = User;
