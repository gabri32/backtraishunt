const mongoose = require('mongoose');
const { Json } = require('sequelize/lib/utils');

// Definir el esquema para la preventa
const transactionSchema = new mongoose.Schema({
  datos: {
    type:Object,
    required: true
  }
 

});

// Crear el modelo
const transactions = mongoose.model('transactions', transactionSchema);

module.exports = transactions;
