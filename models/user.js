const mongoose = require('mongoose');
const { FLOAT, DOUBLE, NUMBER } = require('sequelize');

// Definir el esquema para la preventa
const UserSchema = new mongoose.Schema({

  nombres_completos: {
    type: String,
    required: false
  },
  tokensComprados: {
    type: Number,
    default: 0,
    required: false
  },
  tokensporcomision: {
    type: Number,
    default: 0,
    required: false
  },
  usdcomision:{
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
    type: Number,
    default: 0
  },
  wallet: {
    type: String,
    required: true,
    unique: true,
  },
  
  num_id:{
    type: String,
    required: false
  },
  referido:{
    type:String,
    required:false
  }


});

// Crear el modelo
const User = mongoose.model('User', UserSchema);

module.exports = User;
