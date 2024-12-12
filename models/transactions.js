const mongoose = require('mongoose');

// Definir el esquema para la preventa
const transactionSchema = new mongoose.Schema({
  fase: {
    type: Number,
    required: true
  }
 

});

// Crear el modelo
const transactions = mongoose.model('transactions', transactionSchema);

module.exports = transactions;
